const db = require("../db");

//route GET/api/events
//accesss- private- needs the jwt token to be accessed
//route GET/api/events
const getEvents = async (req, res) => {
  const user_id = req.user.user_id; //this comes from the jwt via the middleware, we get the user
  //GETTING ALL THE EVENTS FOR A CERTAIN USER
  try {
    // using IN - get all events where the user is a participant
    const [results] = await db
      .promise()
      .query(
        "SELECT * FROM events WHERE event_id IN (SELECT event_id FROM event_participants WHERE user_id = ?)",
        [user_id],
      );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//route GET/api/events/:id
//private access

const getEventById = (req, res) => {
  //gets one particular event of a user by the event id
  const { id } = req.params; //the id is a paramter of the req, so we get the id from the request
  db.query(
    "select e.*, ep.role, ep.status from events e join event_participants ep on e.event_id=ep.event_id where e.event_id=?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Event not found" });
      res.json(results[0]);
    },
  );
};

// @route   POST /api/events
// @access  Private

// @route   POST /api/events
// @access  Private
const createEvent = (req, res) => {
  const creator_id = req.user.user_id;
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    recurrence_end,
    visibility,
    participants, // array of user_ids to invite
  } = req.body;
  //this is a nested query, three layers, one to insert into event, then when an event is successfuly created to insert into event participants
  //then when a participant is successfully created, we insert it into audit logs
  db.query(
    "INSERT into events (creator_id, title, description, start_datetime, end_datetime, is_recurring, recurrence_type, recurrence_interval, recurrence_end, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      creator_id,
      title,
      description,
      start_datetime,
      end_datetime,
      is_recurring,
      recurrence_type,
      recurrence_interval,
      recurrence_end,
      visibility,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      const event_id = result.insertId;
      //now, we are going to insert the participants, the event creator gets inserted with role creator and the rest as participants
      //nested query, first query adds participants, inner query adds it to the audit log when a participant is created without any errors
      db.query(
        "INSERT INTO event_participants (event_id, user_id, role, status) VALUES (?, ?, 'creator', 'accepted')",
        [event_id, creator_id],
        (
          err, //we don't need the results here for anything, so we only take err
        ) => {
          if (err) return res.status(500).json({ message: err.message });

          function insertAuditLog() {
            // trigger handles audit log automatically on event insert
            res
              .status(201)
              .json({ message: "Event created successfully", event_id });
          }

          // add other participants if any
          if (participants && participants.length > 0) {
            const values = participants
              .filter((user_id) => user_id !== creator_id) // don't add creator again
              .map((user_id) => [event_id, user_id, "participant", "invited"]);
            db.query(
              "INSERT INTO event_participants (event_id, user_id, role, status) VALUES ?",
              [values],
              (err) => {
                if (err) return res.status(500).json({ message: err.message });
                insertAuditLog();
              },
            );
          } else {
            insertAuditLog();
          }
        },
      );
    },
  );
};

// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  const { id } = req.params; // event_id from the url
  const user_id = req.user.user_id; // from the jwt token via middleware
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    is_recurring,
    recurrence_type,
    recurrence_interval,
    recurrence_end,
    visibility,
  } = req.body; // getting the values for the event from the request body

  try {
    // check if the logged in user is the creator of the event
    const [results] = await db
      .promise()
      .query(
        "SELECT * FROM event_participants WHERE role = 'creator' AND user_id = ? AND event_id = ?",
        [user_id, id],
      );

    // if not the creator, return 403
    if (results.length === 0)
      return res
        .status(403)
        .json({ message: "not authorized to update this event" });

    // update the event
    await db
      .promise()
      .query(
        "UPDATE events SET title=?, description=?, start_datetime=?, end_datetime=?, is_recurring=?, recurrence_type=?, recurrence_interval=?, recurrence_end=?, visibility=? WHERE event_id=?",
        [
          title,
          description,
          start_datetime,
          end_datetime,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_end,
          visibility,
          id,
        ],
      );

    // add to audit log
    await db
      .promise()
      .query(
        `INSERT INTO audit_logs (event_id, action, performed_by, details) VALUES (?, 'updated', ?, ?)`,
        [id, user_id, `Event '${title}' updated`],
      );

    res.json({ message: "event updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  const { id } = req.params; // event_id from the url
  const user_id = req.user.user_id; // from the jwt token via middleware

  try {
    // check if the logged in user is the creator of the event
    const [results] = await db
      .promise()
      .query(
        "SELECT * FROM event_participants WHERE role = 'creator' AND user_id = ? AND event_id = ?",
        [user_id, id],
      );

    // if not the creator, return 403
    if (results.length === 0)
      return res
        .status(403)
        .json({ message: "not authorized to delete this event" });

    // delete the event - trigger handles audit log automatically before delete
    await db.promise().query("DELETE FROM events WHERE event_id = ?", [id]);

    res.json({ message: "event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
