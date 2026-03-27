const express = require("express");
const db = require("../db");
const { findAvailableSlots } = require("../services/slotFinder");

const router = express.Router();

// Suggest common free slots
router.post("/suggest-slots", (req, res) => {
  const {
    creatorId,
    participantIds,
    title,
    description,
    dateRangeStart,
    dateRangeEnd,
    durationMinutes,
  } = req.body;

  if (
    !creatorId ||
    !participantIds ||
    !Array.isArray(participantIds) ||
    participantIds.length === 0 ||
    !title ||
    !dateRangeStart ||
    !dateRangeEnd ||
    !durationMinutes
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const allUserIds = [...new Set([creatorId, ...participantIds])];
  const placeholders = allUserIds.map(() => "?").join(",");

  const query = `
    SELECT DISTINCT
      e.event_id,
      e.title,
      e.start_datetime,
      e.end_datetime,
      ep.user_id
    FROM events e
    INNER JOIN event_participants ep
      ON e.event_id = ep.event_id
    WHERE ep.user_id IN (${placeholders})
      AND e.start_datetime <= CONCAT(?, ' 23:59:59')
      AND e.end_datetime >= CONCAT(?, ' 00:00:00')
    ORDER BY e.start_datetime ASC
  `;

  db.query(
    query,
    [...allUserIds, dateRangeEnd, dateRangeStart],
    (err, results) => {
      if (err) {
        console.error("Error suggesting slots:", err);
        return res.status(500).json({
          success: false,
          message: "Server error while checking availability",
          error: err.message,
        });
      }

      const busyIntervals = results.map((row) => ({
        start: row.start_datetime,
        end: row.end_datetime,
      }));

      const suggestions = findAvailableSlots({
        busyIntervals,
        rangeStart: dateRangeStart,
        rangeEnd: dateRangeEnd,
        durationMinutes: Number(durationMinutes),
        workStartHour: 9,
        workEndHour: 18,
        maxSuggestions: 5,
      });

      return res.json({
        success: true,
        message:
          suggestions.length > 0
            ? "Available slots found"
            : "No common slots available",
        data: {
          title,
          description: description || "",
          creatorId,
          participantIds,
          suggestions,
        },
      });
    }
  );
});

// Book selected slot
router.post("/book-slot", (req, res) => {
  const {
    creatorId,
    participantIds,
    title,
    description,
    startDatetime,
    endDatetime,
    visibility = "shared",
  } = req.body;

  if (
    !creatorId ||
    !participantIds ||
    !Array.isArray(participantIds) ||
    !title ||
    !startDatetime ||
    !endDatetime
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required booking fields",
    });
  }

  const allUserIds = [...new Set([creatorId, ...participantIds])];

  db.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error("Transaction start error:", transactionErr);
      return res.status(500).json({
        success: false,
        message: "Could not start transaction",
      });
    }

    const insertEventQuery = `
      INSERT INTO events (
        creator_id,
        title,
        description,
        start_datetime,
        end_datetime,
        visibility
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertEventQuery,
      [
        creatorId,
        title,
        description || null,
        startDatetime,
        endDatetime,
        visibility,
      ],
      (eventErr, eventResult) => {
        if (eventErr) {
          return db.rollback(() => {
            console.error("Insert event error:", eventErr);
            res.status(500).json({
              success: false,
              message: "Failed to create event",
              error: eventErr.message,
            });
          });
        }

        const eventId = eventResult.insertId;

        const participantValues = allUserIds.map((userId) => [
          eventId,
          userId,
          userId === creatorId ? "creator" : "participant",
          userId === creatorId ? "accepted" : "invited",
        ]);

        const insertParticipantsQuery = `
          INSERT INTO event_participants (event_id, user_id, role, status)
          VALUES ?
        `;

        db.query(
          insertParticipantsQuery,
          [participantValues],
          (participantErr) => {
            if (participantErr) {
              return db.rollback(() => {
                console.error("Insert participants error:", participantErr);
                res.status(500).json({
                  success: false,
                  message: "Failed to add participants",
                  error: participantErr.message,
                });
              });
            }

            const notificationValues = allUserIds.map((userId) => [
              userId,
              eventId,
              "event_created",
              `A new event "${title}" has been scheduled from ${startDatetime} to ${endDatetime}.`,
              false,
            ]);

            const insertNotificationsQuery = `
              INSERT INTO notifications
              (user_id, event_id, notification_type, message, is_sent)
              VALUES ?
            `;

            db.query(
              insertNotificationsQuery,
              [notificationValues],
              (notificationErr) => {
                if (notificationErr) {
                  return db.rollback(() => {
                    console.error("Insert notifications error:", notificationErr);
                    res.status(500).json({
                      success: false,
                      message: "Failed to create notifications",
                      error: notificationErr.message,
                    });
                  });
                }

                const insertAuditQuery = `
                  INSERT INTO audit_logs (event_id, action, performed_by, details)
                  VALUES (?, 'created', ?, ?)
                `;

                db.query(
                  insertAuditQuery,
                  [
                    eventId,
                    creatorId,
                    `Event "${title}" created by user ${creatorId} with participants ${allUserIds.join(", ")}`,
                  ],
                  (auditErr) => {
                    if (auditErr) {
                      return db.rollback(() => {
                        console.error("Insert audit log error:", auditErr);
                        res.status(500).json({
                          success: false,
                          message: "Failed to create audit log",
                          error: auditErr.message,
                        });
                      });
                    }

                    db.commit((commitErr) => {
                      if (commitErr) {
                        return db.rollback(() => {
                          console.error("Commit error:", commitErr);
                          res.status(500).json({
                            success: false,
                            message: "Transaction commit failed",
                            error: commitErr.message,
                          });
                        });
                      }

                      return res.status(201).json({
                        success: true,
                        message: "Event booked successfully",
                        data: {
                          eventId,
                          title,
                          startDatetime,
                          endDatetime,
                          participants: allUserIds,
                        },
                      });
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;