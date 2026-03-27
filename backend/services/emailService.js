const nodemailer = require("nodemailer");
require("dotenv").config();

// create transporter - connects to gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// send reminder email
const sendReminderEmail = async (to, eventTitle, startDatetime) => {
  const mailOptions = {
    from: `Syncify <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reminder!: ${eventTitle}`,
    html: `
            <h2>Event reminder 📅</h2>
            <p>This is a reminder for your upcoming event:</p>
            <h3>${eventTitle}</h3>
            <p>starts at: ${startDatetime}</p>
            <br/>
            <p>Regards,</p>
            <p>Syncify</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendReminderEmail };
