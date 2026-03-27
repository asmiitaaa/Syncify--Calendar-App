const cron = require("node-cron");
const db = require("../db");
const { sendReminderEmail } = require("./emailService");

// runs every minute
cron.schedule("* * * * *", async () => {
  console.log("checking reminders...");

  try {
    // get all reminders where the event is about to start
    const [reminders] = await db.promise().query(
      `select r.*, u.email, u.name, e.title, e.start_datetime 
             from reminders r 
             join users u on r.user_id = u.user_id 
             join events e on r.event_id = e.event_id
             where DATE_SUB(e.start_datetime, INTERVAL r.remind_before_minutes MINUTE) <= NOW()
             and e.start_datetime >= NOW()`,
    );

    // send email for each reminder
    for (const reminder of reminders) {
      await sendReminderEmail(
        reminder.email,
        reminder.title,
        reminder.start_datetime,
      );

      console.log(
        `reminder sent to ${reminder.email} for event ${reminder.title}`,
      );

      // delete reminder after sending so it doesnt send again
      await db
        .promise()
        .query("delete from reminders where reminder_id=?", [
          reminder.reminder_id,
        ]);
    }
  } catch (err) {
    console.error("error sending reminders:", err.message);
  }
});
