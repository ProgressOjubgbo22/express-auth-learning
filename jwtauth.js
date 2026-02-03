// ===============================
// JWT-Based Authentication Router
// ===============================

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const SECRET = "superSecretKey";

const users = [];

// ------------------------------
// Middleware: Verify JWT token
// ------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Access token missing" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}

// ------------------------------
// Register a new user
// ------------------------------
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: "Username and password are required" });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).send({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).send({ message: "User registered successfully" });
});

// ------------------------------
// Login and generate JWT
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

  const token = jwt.sign(
    { username },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// ------------------------------
// Protected route example
// ------------------------------
router.get("/dashboard", authenticateToken, (req, res) => {
  res.send({
    message: `Hello ${req.user.username}, welcome to the dashboard`
  });
});

module.exports = router;
