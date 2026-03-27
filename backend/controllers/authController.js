const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); //imports

const generateToken = (
  user_id, //this takes the user id,
) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// route   POST /api/auth/register
// access  Public-no token required

const registerUser = (req, res) => {
  const { name, email, password } = req.body; //we get these from the body of the request
  //QUERYING THE DATABASE TO CHECK IF THAT USER ALREADY EXISTS
  db.query("SELECT * from users where email =?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: err.message }); //if an error occurs, then return the error message
    if (results.length > 0)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = bcrypt.hashSync(password, 10);
    //hasing the password
    //if it comes till here, we know that the user doesnt already exist and that there is no error, so we can insert
    db.query(
      "INSERT INTO users(name, email, password) values (?,?,?)",
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({
          user_id: result.insertId,
          name,
          email,
          role: "user", // add this
          token: generateToken(result.insertId),
        });
      },
    );
  });
};
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => {
  const { email, password } = req.body;
  //SQL QUERY
  db.query("SELECT * from users where email =?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email address" });

    const user = results[0]; //gets the first row from the results array, since email is unique, there will only ever be one element in the results array

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role, // add this
      token: generateToken(user.user_id),
    });
  });
};

module.exports = { registerUser, loginUser };
