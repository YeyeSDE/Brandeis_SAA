// import different required packages
const mongoose = require("mongoose");
const express = require("express");
const layouts = require("express-ejs-layouts");
const connectFlash = require('connect-flash');
const methodOverride = require("method-override");
const expressSession = require("express-session");
const passport = require("passport");
const socketio = require("socket.io");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const errorController = require("./controllers/errorController");
const router = require("./routes/index");
const chatController = require("./controllers/chatController");
const checkLogin = require("./checkLogin");

// create the express app and the router
const app = express();

// connect with mongodb
mongoose.connect('mongodb://localhost:27017/brandeis_saa');

// import controllers, because we are not calling any actions from the controllers here, but in the routes. 
//const homeController = require("./controllers/homeController");

//const router = express.Router();
const PORT = process.env.PORT || 3000;

// set the view engine to ejs and configure static files and layouts
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(layouts);
app.use(cookieParser("secret_passcode"));

// get: only to display
// post: send data and modify data and may cause the change of the status of the data.
// put: similar to post: already have data and want to updata
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);

app.use(cookieParser("secret-passcode"));

// configure express-session middleware
app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 40000,
    },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration for User authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set up the middleware to make flash messages accessible in views
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Configure app to use JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use the router with the Express app
app.use("/", router);

// Start the server
const server = app.listen(PORT, () => {
  console.log("application is running");
});
const io = socketio(server);
chatController(io);
