/* jshint esversion:6 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes");
const session       = require("express-session");
const bcrypt        = require("bcrypt");
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const flash = require("connect-flash");
//const ensureLogin = require("connect-ensure-login");

mongoose.Promise=global.Promise;
//cambio el nombre BD de passport-local, que ya existe, a passport-Intro
mongoose.connect("mongodb://localhost/passport-intro");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//conf express-session
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));


//codigo que debe ir antes de passport.initialize() según la lección
passport.serializeUser((user, cb) => {
  console.log("----serializeUser");
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  console.log("-----deserializeUser");
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(flash()); //descomentar luego

passport.use(new LocalStrategy({
  passReqToCallback: true
},(req, username, password, next) => {
  console.log("-----LocalStrategy");
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

//estas lineas estaban arriba
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/', index);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
