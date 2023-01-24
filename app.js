const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const authRouter = require('./routes/auth.routes')
const freeRouter = require('./routes/free-endpoint.routes')
const moviesRouter = require('./routes/movies.routes')
const dbConnect = require("./db/dbConnect")
const Auth = require('./models/auth.model');
const cors = require('cors')
//const Authorization = require('./middlewares/authorization.middleware')

dbConnect()

app.use((req, res, next) => {
  //res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization", "withCredentials"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

var corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://movie-app-mmt.onrender.com'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
}

app.use(cors(corsOptions));


// app.options("*", (req, res) => {
//   res.sendStatus(200);
// });

// body parser configuration
app.use(bodyParser.json());
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
/*app.use(function(req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});*/

moviesRouter.use(cookieParser())
app.use('/movies', moviesRouter)
app.use('/free-endpoint', freeRouter)
app.use('/auth', authRouter)

app.get("/", (request, response) => {
  //console.log(request.cookies)
  //console.log("TEST")
  //response.json({ message: "Hello World! Movie API works!" });
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  response.status(202).cookie('nick', 'chao', {
    //sameSite: 'strict',
    sameSite: 'none',
    secure: true,     //for prod
    path: '/',
    expires: expirationDate,
    //httpOnly: true
  }).send('cookie being intialized')
});

app.get("/urmom", (request, response) => {
  //console.log(request.cookies)
  //console.log("TEST")
  //response.json({ message: "Hello World! Movie API works!" });
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  response.status(202).cookie('cpp', 'idekkk', {
    //sameSite: 'strict',
    sameSite: 'none',
    secure: true,     //for prod
    path: '/',
    expires: expirationDate,
    //httpOnly: true
  }).send('cookie being intialized')
});

module.exports = app;
