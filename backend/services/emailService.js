const { BrevoClient } = require("@getbrevo/brevo");
require("dotenv").config();

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const sendReminderEmail = async (to, eventTitle, startDatetime) => {
  await client.transactionalEmails.sendTransacEmail({
    sender: { name: "Syncify", email: "mysyncifyapp@gmail.com" },
    to: [{ email: to }],
    subject: `Reminder!: ${eventTitle}`,
    htmlContent: `
      <h2>Event reminder</h2>
      <p>This is a reminder for your upcoming event:</p>
      <h3>${eventTitle}</h3>
      <p>Starts at: ${startDatetime}</p>
      <br/>
      <p>Regards,</p>
      <p>Syncify</p>
    `,
  });
};

module.exports = { sendReminderEmail };
