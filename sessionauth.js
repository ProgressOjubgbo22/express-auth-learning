// ===============================
// Session-Based Authentication Router
// ===============================

const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const users = [];

// ------------------------------
// Middleware: Check if user is authenticated
// ------------------------------
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send({ message: "Not authenticated" });
  }
}

// ------------------------------
// Register a new user
// ------------------------------
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: "Username and password are required" });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).send({ message: "Username already exists" });
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).send({ message: "User registered successfully" });
});

// ------------------------------
// Login a user
// ------------------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: "Username and password are required" });
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send({ message: "Incorrect password" });

  // Store user info in session
  req.session.user = { username };

  res.send({ message: `Logged in as ${username}` });
});

// ------------------------------
// Logout a user
// ------------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send({ message: "Logout failed" });

    res.clearCookie("sid"); // clear session cookie
    res.send({ message: "Logged out successfully" });
  });
});

// ------------------------------
// Protected route example
// ------------------------------
router.get("/dashboard", isAuthenticated, (req, res) => {
  res.send({ message: `Welcome, ${req.session.user.username}` });
});

module.exports = router;
