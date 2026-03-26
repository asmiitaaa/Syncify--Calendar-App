const db = require("../db");

//route get/api/notifications
//private access

const getNotifications = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    //SQL QUERY-GET ALL THE NOTIFICATIONS FOR THE LOGGED IN USER
    const [results] = await db
      .promise()
      .query(
        "select n.*, e.title from notifications n join events e on n.event_id=e.event_id where n.user_id=?",
        [user_id],
      );
    res.json(results); //sends the results back to the caller
  } catch (err) {
    res.status(500).json({ message: e.message });
  }
};

//route put/api/notifications/:id
//access-private access
const markNotificationSent = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  try {
    //SQL QUERY-CHECK IF THE NOTIFICATION BELONGS TO THE LOGGED IN USER
    const [notification] = await db
      .promise()
      .query(
        "select * from notifications where notification_id=? and user_id=?",
        [id, user_id],
      );
    if (
      notification.length === 0
    ) //notification not found- doesn't belong to logged in user
    {
      return res.status(404).json({ message: "notification not found" });
    }

    await db
      .promise()
      .query(
        "update notifications set is_sent=true, sent_at=NOW() where notification_id=?",
        [id],
      );
    res.json({ message: "notification marked as sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markNotificationSent };
