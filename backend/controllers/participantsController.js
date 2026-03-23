const db = require("../db");

// @route   POST /api/participants/:eventId
// @access  Private
const addParticipant = async (req, res) => {
  const { eventId } = req.params; // event_id from the url
  const { user_id } = req.body; // user to add

  try {
    // using NOT IN - check if user is not already a participant of this event
    const [eligible] = await db
      .promise()
      .query(
        "SELECT * FROM users WHERE user_id = ? AND user_id NOT IN (SELECT user_id FROM event_participants WHERE event_id = ?)",
        [user_id, eventId],
      );

    // if eligible is empty, user is already a participant
    if (eligible.length === 0)
      return res.status(400).json({ message: "user is already a participant" });

    // add the participant
    await db
      .promise()
      .query(
        "INSERT INTO event_participants (event_id, user_id, role, status) VALUES (?, ?, 'participant', 'invited')",
        [eventId, user_id],
      );

    // add to audit log
    await db
      .promise()
      .query(
        `INSERT INTO audit_logs (event_id, action, performed_by, details) VALUES (?, 'updated', ?, ?)`,
        [eventId, req.user.user_id, `user ${user_id} added to event`],
      );

    res.status(201).json({ message: "participant added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route   PUT /api/participants/:eventId
// @access  Private
const updateParticipantStatus = async (req, res) => {
  const { eventId } = req.params; // event_id from the url
  const user_id = req.user.user_id; // logged in user from jwt
  const { status } = req.body; // accepted or declined
  //status is sent in the request, if the user is actually a participant of that event, it updates the status to whatever is it in the request

  try {
    // check if the participant exists
    const [existing] = await db.promise().query(
      //SQL QUERY
      "SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?",
      [eventId, user_id],
    );

    if (existing.length === 0)
      return res.status(404).json({ message: "participant not found" });

    // update the status
    await db.promise().query(
      //SQL QUERY
      "UPDATE event_participants SET status = ? WHERE event_id = ? AND user_id = ?",
      [status, eventId, user_id],
    );

    res.json({ message: `invitation ${status} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/participants/:eventId
// @access  Private
const removeParticipant = async (req, res) => {
  const { eventId } = req.params; // event_id from the url
  const { user_id } = req.body; // user to remove
  const requester_id = req.user.user_id; // logged in user from jwt

  try {
    // only the creator can remove participants
    const [creator] = await db.promise().query(
      //SQL QURERY
      "SELECT * FROM event_participants WHERE event_id = ? AND user_id = ? AND role = 'creator'",
      [eventId, requester_id],
    );

    if (creator.length === 0)
      return res
        .status(403)
        .json({ message: "not authorized to remove participants" });

    // remove the participant
    await db.promise().query(
      //SQL QUERY
      "DELETE FROM event_participants WHERE event_id = ? AND user_id = ?",
      [eventId, user_id],
    );

    // add to audit log
    await db.promise().query(
      //INSERT INTO AUDIT LOGS
      `INSERT INTO audit_logs (event_id, action, performed_by, details) VALUES (?, 'updated', ?, ?)`,
      [eventId, requester_id, `user ${user_id} removed from event`],
    );

    res.json({ message: "participant removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addParticipant, updateParticipantStatus, removeParticipant };
