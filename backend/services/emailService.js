const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async (to, eventTitle, startDatetime) => {
  const mailOptions = {
    from: `Syncify <mysyncifyapp@gmail.com>`,
    to,
    subject: `Reminder!: ${eventTitle}`,
    html: `
            <h2>Event reminder </h2>
            <p>This is a reminder for your upcoming event:</p>
            <h3>${eventTitle}</h3>
            <p>Starts at: ${startDatetime}</p>
            <br/>
            <p>Regards,</p>
            <p>Syncify</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendReminderEmail };
