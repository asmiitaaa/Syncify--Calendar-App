const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

const sendReminderEmail = async (to, eventTitle, startDatetime) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Reminder!: ${eventTitle}`;
  sendSmtpEmail.htmlContent = `
    <h2>Event reminder</h2>
    <p>This is a reminder for your upcoming event:</p>
    <h3>${eventTitle}</h3>
    <p>Starts at: ${startDatetime}</p>
    <br/>
    <p>Regards,</p>
    <p>Syncify</p>
  `;
  sendSmtpEmail.sender = { name: "Syncify", email: "mysyncifyapp@gmail.com" };
  sendSmtpEmail.to = [{ email: to }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendReminderEmail };
