//server.js-entry point of the program
const express = require("express"); //imports express and cors
const cors = require("cors");
require("dotenv").config(); //loads the .env file to use
require("./services/reminderScheduler");
const chatbotRoutes = require("./routes/chatbotRoutes");
const app = express(); //creates the express application
app.use(cors()); //cors- cross origin requests- allows app to use cross origin requests- allow frontend to access backend apis
app.use(express.json()); //tells app to parse incoming request bodies as json

// Routes- lists the routes and where we have to go if we get those routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/participants", require("./routes/participants"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/admin", require("./routes/admin"));

app.use("/api/chatbot", chatbotRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
}); //starts the server, gets the port number from our .env
