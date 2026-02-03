const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// Route modules
const routing = require("./routing");
const httpMethod = require("./httpMethod");
const middleware = require("./middleware");
const templating = require("./templating");
const form = require("./form");
const cookie = require("./cookie");
const sessionRoutes = require("./session");
const sessionAuth = require("./sessionauth");
const jwtAuth = require("./jwtauth");

const app = express();
const PORT = 3000;

// --------------------
// Global Middleware
// --------------------
app.use(express.json());
app.use(cookieParser());

// Session middleware (learning setup)
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true // enable when using HTTPS
    },
  })
);

// --------------------
// View Engine & Static Files
// --------------------
app.set("view engine", "ejs");
app.use(express.static("public"));

// --------------------
// Routes
// --------------------
app.use("/", jwtAuth);
app.use("/", sessionAuth);
app.use("/", sessionRoutes);
app.use("/", cookie);
app.use("/", form);
app.use("/", templating);
app.use("/", middleware);
app.use("/", httpMethod);
app.use("/", routing);

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
