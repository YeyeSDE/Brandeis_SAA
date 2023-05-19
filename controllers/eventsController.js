// compared with CPA6, we need to vallidate whether the users has logged in before taking any actions on the event
// require models
const Event = require("../models/event");
const User = require("../models/user");
const {check, validationResult } = require("express-validator");
// import the http-status-codes module 
const httpStatus = require("http-status-codes");

// get the event parameters from request body
const getEventParams = (body) => {
  return {
    title: body.title,
    description: body.description,
    location: body.location,
    startDate: body.startDate,
    endDate: body.endDate,
    isOnline: body.isOnline,
    registrationLink: body.registrationLink,
    organizer: body.organizer,
    attendees: body.attendees,
  };
};

// speficify the different validation rules for events.
const validateEvent = () => {
  return [
    check("title").notEmpty().withMessage("Title is required."),
    check("description").notEmpty().withMessage("Description is required."),
    check("registationLink").optional({ checkFalsy: true }) .isURL() .withMessage("Registration link must be a valid URL."),
    // make sure the start date is before the end date
    check("endDate").notEmpty().withMessage("An end date is required.")
    .custom((value, { req }) => {
      if ( value < req.body.startDate) {
        throw new Error ("End date should not be earlier than start date!");
      } return true;
    })
  ];
};

// check if the user is logged in
const checkLogin = ( req, res) => {
  // if the user is not logged in
  if (!req.isAuthenticated()) {
    // log the reminder message
    req.flash("You have to be logged in first.");
    // redirect the log in page for the user
    req.redirect('/users/login');
    // return false
    return false;
  }
  // return true if the user is logged in 
  return true;
}

// define controller methods for events
module.exports = {
  // find all events
  index: (req, res, next) => {
    // use find method on the Event model to find all of the events in the database
    Event.find({})
      // populate the organizer attendees fields in the events with the corresponding documents from the User model
      //.populate("organizer attendees")
      .then((events) => {
        // handle the response from the database query 
        res.locals.events = events;
        // pass the result to the next funcion
        next();
      })
      // catch all error
      .catch((error) => {
        // log the error message
        console.log(`Error fetching events: ${error.message}`);
        // proceed to the next middleware function that handles an error
        next(error);
      });
  },

  // render index view for events
  indexView: (req, res) => {
    res.render("events/index");
  },

  // define the method called new by an async function with req and res as parameters
  new: async (req, res) => {
    try {
      // find all user document in the database
      let users = await User.find({});
      // check if the user collection is an array
      if (!Array.isArray(users)) {
        // wrap the user in an array so it can iterated over in the view
        users = [users];
      }
      // render the event/new view and passes the users array as an object
      res.render("events/new", { users: users }); 
      // catch the error
    } catch (error) {
      // log the error message
      console.log(`Error fetching users: ${error.message}`);
      res.status(500).send('Internal Server Error');
    }
  },

  // create a new event by flash
  create: async(req, res, next) => {

    // check if the user is logged in before creating the events and validate the event data
    try {
      if (!checkLogin(req, res, next)) return;
      await Promise.all(validateEvent().map((rule) => rule.run(req)));
      const errors = validationResult(req);
      
      //  add validation errors to the flash message and the user is redirected to the new event page.
      if (!errors.isEmpty()) {
        const userErrors = errors.array().map((error) => error.msg).join(', ');
        req.flash("error", userErrors);
        return res.redirect("/events/new");
      }
  
      // create a new event and pass it to the event parameters obtained from the getEventParams() function.
      let eventParams = getEventParams(req.body);
      Event.create(eventParams)
        .then((event) => {
          // if the creation is successful, the user is redirected to the events page, and a success message is added to the flash message. 
          res.locals.redirect = "/events";
          res.locals.event = event;
          next();
        })
        // if there is an error, the user is redirected back to the new event page and an error message is added to the flash message.
        .catch((error) => {
          console.log(`Error saving event: ${error.message}`);
          res.locals.redirect = "/events/new";
          req.flash("error", `Failed to create an event: ${error.message}`);
          // proceed to the next middleware function
          next();
        });
    // catch the error when creating the event
    } catch (error) {
      console.log(`Validation Error: ${error.message}`);
      // proceed to the next error handling method.
      next(error);
    }
  },

  // redirect to a specific path
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // display an event
  show: (req, res, next) => {
    // check if the user is logged in or not.
    if (!checkLogin(req, res)) return;
    // get the event ID from the request parameters 
    let eventId = req.params.id;
    // find the event by ID and populates the organizer and attendees fields. 
    Event.findById(eventId)
      .populate("organizer attendees")
      .then((event) => {
        // if the event is found, store it in database
        res.locals.event = event;
        // proceed to the next middleware funcion.
        next();
      })
      //catch the error
      .catch((error) => {
        console.log(`Catch the error by event ID: ${error.message}`);
        next(error);
      });
  },

  // display an event
  showView: (req, res) => {
    // if the user is not logged in, return
    if (!checkLogin(req, res)) return;
    // render to the event display page
    res.render("events/show");
  },

  // display the events by its ID 
  edit: async (req, res, next) => {
    // creat a new event ID from the request
    let eventId = req.params.id;
    try {
      // if the user is not logged in, return
      if (!checkLogin(req, res)) return;
      // find the event from database by ID
      const event = await Event.findById(eventId);
      // find the user from the database
      const users = await User.find({});
      // render to the event edit page
      res.render("events/edit", {
        event: event,
        users: users,
      });
      //catch the error
    } catch (error) {
      console.log(`Catch the error by event or user ID: ${error.message}`);
      // proceed to the next error handling function
      next(error);
    }
  },
  
  // update an event with its parameters
  update: async (req, res, next) => {
    try {
      // if the user is not logged in, return
      if (!checkLogin(req, res)) return;
      // check if the user is logged in before updating the events and validate the event data
      await Promise.all(validateEvent().map((rule) => rule.run(req)));
      const errors = validationResult(req);
      // if there is an error, log out the error and redirect the path the event editing page
      if (!errors.isEmpty()) {
        const eventErrors = errors.Array().map((error) => error.msg).join(', ');
        req.flash("error". eventErrors);
        return res.redirect(`/events/${req.params.id}/edit`);
      }
      let eventId = req.params.id, 
        eventParams = {
          title: req.body.title,
          dectription: req.body.description,
          location: req.body.location,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          isOnline: req.body.isOnline,
          registrationLink: req.body.registrationLink,
          organizer: req.body.organizer,
          attendees: req.body.attendees,
        };

     //update the event by the ID in database
     Event.findByIdAndUpdate(eventId, {
       $set: eventParams,
     })
       .then((event) => {
        // when the event is update, send the message to flash
        req.flash("success", `${event.title} has been updated!`);
         // set the redirect path to the updated event's URL
         res.locals.redirect = `/events/${eventId}`;
         // store the updated event in res.locals.event
         res.locals.event = event;
         // proceed to the next middleware function
        next();
       })
       //catch the error
       .catch((error) => {
         // log the error message
         console.log(`Error updating event by ID: ${error.message}`);
         req.flash("error", 'Error to update the event: ${eror.message}');
         res.locals.redirect = `/events/${eventId}/edit`;
         // call the next middleware function with the error object
         next();
       });
    } catch (error) {
      console.log(`Validation error: ${error.message}`);
      next(error);
    }
   },


  // delete an event
  delete: (req, res, next) => {
    if (!checkLogin(req, res)) return;
    let eventId = req.params.id;
    //delete an event by the function of findByIdAndRemove
    Event.findByIdAndRemove(eventId)
      .then(() => {
        // send out the success message
        req.flash(
            "success",
            "Event has been deleted."
        );
        // set the redirection path to events
        res.locals.redirect = "/events";
        // proceed to the next middleware function
        next();
    })
      //catch the error
      .catch((error) => {
        // log the error message
        console.log(`Error for deleting the event: ${error.message}`);
        req.flash(
        "error",
        "Failed to delete event!"
        );
      // proceed to the next middleware function
      next();
    });
  },
  
  // handle a request to attend an event by an asynchronous function
  attend: async (req, res) => {
    try {
      if (!checkLogin(req, res)) return;
      // extract the event ID from the request parameters
      const eventId = req.params.id;
      // extract the username from the request body
      const username = req.body.username;
      // find a user with the given username in the database
      const user = await User.findOne({ name: username });
      
      // if the user is not found, send a 404 status with a "User not found" message
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      
      // find the event with the given ID in the database
      const event = await Event.findById(eventId);
      // if the user is not already in the attendees list, add the user to the list
      if (!event.attendees.includes(user._id)) {
        event.attendees.push(user);
        await event.save();
      }
      
      // send a 200 status message when the user is added successfully
      res.status(200).send("User has been added to attendees");
      // catch the error
    } catch (error) {
      console.log(`Error attending event: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  },

  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },

  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
};
    

