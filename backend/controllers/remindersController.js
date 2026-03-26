const db = require("../db");

//route get/api/reminders
//private access-only with jwt

const getReminders = async (req, res) => {
  const user_id = req.user.user_id; //the user who is making the request, we can get it from jwt middleware
  //SQL QUERY-selects all the reminders and the event start date and time for the logged in user
  try {
    const [results] = await db
      .promise()
      .query(
        "SELECT r.*, e.title, e.start_datetime from reminders r join events e on r.event_id=e.event_id where r.user_id=?",
        [user_id],
      );
    res.json(results); //sends the results back to the query
  } catch (err) {
    res.stats(500).json({ message: err.message });
  }
};

//route api-post reminders
//access private
const createReminder = async (req, res) => {
  const user_id = req.user.user_id;
  const { event_id, remind_before_minutes, reminder_type } = req.body;
  //destructuring the request-only fetches the fields from the request that we ask for
  try {
    //we give the event id for which we want to set a reminder in the request
    //SQL QUERY checks if the logged in user is a participant of the event
    const [participant] = await db
      .promise()
      .query(
        "select * from users where user_id = ? and user_id in (select user_id from event_participants where event_id = ?)",
        [user_id, event_id],
      );
    if (participant.length === 0)
      return res
        .status(403)
        .json({ message: "you are not a participant of this event" });
    //if not a participant, cannot set a reminder for this event
    await db
      .promise()
      .query(
        "insert into reminders(event_id, user_id, remind_before_minutes, reminder_type)values (?,?,?,?)",
        [event_id, user_id, remind_before_minutes, reminder_type],
      );
    res.status(201).json({ message: "reminder created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//route delete/api/reminders/:id
//private access

const deleteReminder = async (req, res) => {
  const { id } = req.params; //we use req.params when we want from the url
  //req.user, req.etc when we want straight from the middleware
  const user_id = req.user.user_id;
  try {
    //SQL QUERY-check if the reminder belongs to the logged-in user
    const [reminder] = await db
      .promise()
      .query("select * from reminders where reminder_id=? and user_id=?", [
        id,
        user_id,
      ]);
    //IF NOT found, cannot delete a reminder that doesn't belong to you
    if (reminder.length === 0)
      return res.status(404).json({ message: "reminder not found" });
    //To delete the reminder
    await db.promise().query("delete from reminders where reminder_id=?", [id]);
    res.json({ message: "reminder deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getReminders, createReminder, deleteReminder };
