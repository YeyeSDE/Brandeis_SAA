// require the user model
const User = require("../models/user");
const passport = require("passport");
const { body, validationRequest, validationResult } = require("express-validator");

// set user parameters by the function from the request body
const getUserParams = (body) => {
  return {
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    graduationYear: body.graduationYear,
    major: body.major,
    job: body.job,
    company: body.company,
    city: body.city,
    state: body.state,
    country: body.country,
    zipCode: body.zipCode,
    bio: body.bio,
    interests: body.interests,
  };
};

// defines different user validation rules
const validateUser = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ min: 2}).withMessage("Name must be at least 2 character.long").isString().withMessage("Name must be a string."),
    body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Email should be valid.").normalizeEmail(),
    body("password").trim().isLength({ min: 4}).withMessage("Password must be at least 4 characters long."),
    body("role").trim().notEmpty().withMessage("Role is required."),
    body("graduationYear").isNumeric("Graduation year must be a number."),
    body("zipCode").isInt().withMessage("Zip code must be a number").isLength({ min: 5, max: 5}).withMessage("Zip code should be only 5 digits"),
    body("bio").trim().isLength({ max: 100}).withMessage("Bio cannot be over 100 characters long"),
  ]
}
// export an object containing controller methods
module.exports = {
  // method to fetch all users and store them in res.locals.user
  index: (req, res, next) => {
    User.find({})
      .then((users) => {
        // store fetched users in res.locals.user
        res.locals.users = users;
        // proceed the next middleware function
        next();
      })
      // catch the error
      .catch((error) => {
        // log the error message
        console.log(`Error finding users: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  },

  // render the users index view 
  indexView: (req, res) => {
    res.render("users/index");
  },

  // render the user creation view
  new: (req, res) => {
    res.render("users/new");
  },

  // create a new user
  create: (req, res, next) => {
    if (req.skip) return next();
    let newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash(
          "success",
          `${user.name}'s account created successfully!`
        );
        res.locals.redirect = "/";
        next();
      } else {
        req.flash(
          "error",
          `Failed to create user account because: ${error.message}.`
        );
        res.locals.redirect = "/users/new";
        next();
      }
    });
  },
  
  // redirect to a specified path
  redirectView: (req, res, next) => {
    // extract user parameters from the request body
    let redirectPath = res.locals.redirect;
    // redirect the response if a redirect path is se
    if (redirectPath) res.redirect(redirectPath);
    // proceed to next middleware function if no redirect path is set
    else next();
  },

  // display one user by ID
  show: (req, res, next) => {
    // update user ID
    let userId = req.params.id;
    User.findById(userId)
      .then((user) => {
        // store the found user in res.locals.user 
        if (user) {
          res.locals.user = user;
          // proceed to the next mddileware function
          next();
          // else log the error message and redirect the path back to user page
        } else {
          req.flash("error", "User not found.");
          res.locals.redirect = "/users";
          // proceed to the next middleware function
          next();
        }
      })
      // catch the error
      .catch((error) => {
        // log the error message
        console.log(`Error findinging user by ID: ${error.message}`);
          // call the next middleware function with the error object
        next(error);
      });
  },

  // display the user detail view
  showView: (req, res) => {
    res.render("users/show");
  },

  // render page to edit the user 
  edit: (req, res, next) => {
    // update user ID
    let userId = req.params.id;
    User.findById(userId)
      .then((user) => {
        res.render("users/edit", {
          // pass the found user to the users/edit
          user: user,
        });
      })
      // catch the error
      .catch((error) => {
        console.log(`Error finding user by ID: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  },
  
  // render to login page 
  login: (req, res) => {
    res.render('users/login');
  }, 
  
  // authenticate the users by using Passport
  authenticate: (req, res, next) => {
    // call Passport's authenticate method with the 'local' strategy
    passport.authenticate("local", (error, user, info) => {
      // check if there is an error
      if (error) {
        // log the error
        console.log ("error", error);
        // send error message to flash page
        req.flash("error", "There is an error during authentication.");
        // redirect the path to user login page
        return res.redirect('/users/login');
      }
      
      // check if the user is found
      if (!user) {
        // if not, log the failed message
        console.log("Failed to authentificate", info.message);
        // send the error message to flash page
        req.flash("error", "Failed to login");
        // redirect the path to the login page
        return res.redirect('/users/login');
      }

      // log the user in using Passport's request logIn method
      req.logIn(user, (error) => {
        // check if there is error
        if (error) {
          // if so, log the error message
          console.log("Login error:", error);
          // send the error message to flash page
          req.flash("error", "Failed to login.");
          // redirect the path to the login page
          return res.redirect('/users/login');
        }
        
        // if no error, send the success mesage to flash page
        req.flash("success", "You are logged in!");
        // then redirect the path to the home page
        return res.redirect('/');
      });
    }) (req, res, next);
  },

  // update a new user by ID
  update: async (req, res, next) => {
    try {
      // validare the user input data
      await Promise.all(validateUser().map((rule) => rule.run(req)));
      const errors = validationResult(req);
      
      // if there is an error, concantate the error and send them to the flash page
      if (!errors.isEmpty()) {
        const userError = errors.array().map((error) => error.msg).join(', ');
        req.flash("error", userError);
        // redirect the path to user editing page
        res.locals.redirect = `/users/${req.params.id}/edit`;
        return next();
      }
    
    // get the user ID from the request body
    let userId = req.params.id,
      userParams = getUserParams(req.body);
    // find the user by ID and update
    User.findByIdAndUpdate(userId, {
      $set: userParams,
    }) 
    // if user is found, send the sucess message to the flash page
      .then((user) => {
        req.flash(
            "success",
            `${user.name}'s account has been updated.`
          );
        // set the redirection path
        res.locals.redirect = `/users/${userId}`;
        // store the user in the respone if it is found
        res.locals.user = user;
        // proceed to the next middleware function
        next();
      })
      //catch the error if there is one.
      .catch((error) => {
        // send the error message to flash page
        req.flash("failed", `Failed to update ${user.name}'s account.`);
        // log the error message
        console.log(`Error updating user by ID: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  // catch the error during update process
  } catch (error) {
      console.log(`Error during validation: ${error.message}`);
      next(error);
    }
  },

  // delete a user by findByIdAndRemove function
  delete: (req, res, next) => {
    // update the userId
    let userId = req.params.id;
    User.findByIdAndRemove(userId)
      .then(() => {
        // set the redirection path for response
        res.locals.redirect = "/users";
        // proceed to the next middleware function
        next();
      })
      //catch the error 
      .catch((error) => {
        // log the error message
        console.log(`Error deleting user by ID: ${error.message}`);
        // proceed to the next middleware function
        next();
      });
  },

  // asynchronous middleware function for a user to attend an event
  attend: async (req, res) => {
    try {
      // get the event ID from the request parameters
      const eventId = req.params.id;
      // get the user name from the request body
      const username = req.body.username;
      // find the user by user name in the database using the findOne method
      const user = await User.findOne({ name: username });
      
      // send out 404 status message if the user is not found
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      
      // find the event in the database by its ID using the findById method
      const event = await Event.findById(eventId);

      // check if the user is already in the attendees list of the event
      if (!event.attendees.includes(user._id)) {
        // add the user to the event's attendees list
        event.attendees.push(user);
        // save the updated event to the database
        await event.save();
      }
      // send out a 200 success message 
      res.status(200).send("User successfully added to attendees");
      // catch the error
    } catch (error) {
      // log the error that happens
      console.log(`Error attending event: ${error.message}`);
      // send out a 500 status with error message
      res.status(500).send("Internal Server Error");
    }
  },
  
  
  // logout the user's account
  logout: (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have been logged out!");
      res.locals.redirect = "/";
      next();
    });
  },
  
  // check if the user is logged in and is
  isAdmin: (req, res, next) => {
    // if it is logged in proceed to the next middleware function
    if (req.currentUser) {
      next();
    // if the user is not logged in, present the warning in the flash
    } else {
      req.flash("error", "You have to be an admin to view the list of users.");
      // redirect the user to the login page 
      res.redirect('/users/login');
    }
  },
  
  // Check if the user is logged in
  checkLogin: (req, res, next) => {
    // if the user is not logged in
    if (!req.isAuthenticated()) {
      // send the error message in flash
      req.flash('error', 'You must be logged in to access hidden content.');
      // redirect to user login page
      res.redirect('/users/login');
    // if user is logged in, proceed to the next middleware function
    } else {
      next();
    }
  },

  // get apiToken for each user and verify them from the database
  verifyToken: (req, res, next) => {
    let token = res.locals.currentUser.apiToken;
    // if token is identical from the user in the database
    if (token) {
      console.log(token)
      User.findOne({apiToken: token})
        // allow the user to use it
        .then((user) => {
          console.log(user)
          if (user) {
            next();
          // else present that it is the invalid API token
          } else {
            new Error ("Invalid API token.")
          };
        })
        // catch the error
        .catch((error) => {
          next(new Error(error.message));
        });
    } else {
      next (new Error("Invalid API token."));
    }
  },  
};
