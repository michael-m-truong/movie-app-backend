const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const authRouter = require('./routes/auth.routes')
const dbConnect = require("./db/dbConnect")
const Auth = require('./models/auth.model');

dbConnect()

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*app.use(function(req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});*/

app.use('/auth', authRouter)

app.get("/", (request, response) => {
  response.json({ message: "Hello World! API works!" });
});

module.exports = app;
