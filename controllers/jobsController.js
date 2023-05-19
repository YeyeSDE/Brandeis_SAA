
// require the job model
// debugged here: add body into the parameter section
const { body, validationResult } = require("express-validator");
const Job = require("../models/job");

// get job parameters from the request body   
const getJobParams = (body) => {
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    description: body.description,
    requirements: body.requirements,
    salary: body.salary,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    postDate: body.postDate,
    deadlineDate: body.deadlineDate,
    isActive: body.isActive,
  };
};

// define validation rules for jobs
const validateJob = () => {
  return [
    body("title").notEmpty().withMessage("Job title is required."),
    body("company").notEmpty().withMessage("company is required."),
    body("location").notEmpty().withMessage("Job location is required."),
    body("contactEmail").notEmpty().withMessage("A valid email is required."),
    body("postDate").notEmpty().withMessage("Post date is required."),
    // make sure the start date is earlier then the end date.
    body("deadlineDate").notEmpty().withMessage("Deadline date is required.")
    .custom((value, { req }) => {
      if ( value < req.body.postDate) {
        throw new Error("Deadline date can not be earlier than the post date!");
      } 
      return true;
    })
  ];
};

// validate the input data
const validate = (req, res, next) => {
  // get the validation errors from the request 
  const errors = validationResult(req);
  // if there is no error, proceed to the next middleware function
  if (errors.isEmpty()) {
    return next();
  }
  
  // create an array of error objects by iterating over each error obtained from validationResult().
  const jobError = [];
  errors.array().map(error => jobError.push({ [error.params]: error.msg}));
  // two properties for the error object: params, which is the parameter name that caused the error, and msg, which is the error message.
  req.flash("error", jobError);
  // add the error array to the flash message and redirect the user to the original URL.
  res.redirect(req.originalUrl);
};

// export the module with controller functions for jobs
module.exports = {
  // find all jobs in the database and store them in the response object's locals property
  index: (req, res, next) => {
    Job.find({})
      .then((jobs) => {
        // store the fetched jobs in res.locals
        res.locals.jobs = jobs;
        // proceed to the next middleware function
        next();
      })
      // catch the error
      .catch((error) => {
        console.log(`Error finding jobs: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  },

  // render the job view and displays all jobs
  indexView: (req, res) => {
    res.render("jobs/index");
  },

  // render the job new page to create new jobs
  new: (req, res) => {
    res.render("jobs/new");
  },

  // create a new job and store it in the database
  create: async(req, res, next) => {
    try {
      // call the validateJob() function to validate the job input data
      // the map() function is used to call the run() method of each validation rule with the req object. 
      // the Promise.all() function is used to wait for all the validation rules to complete before proceeding.
      await Promise.all(validateJob().map((rule => rule.run(req))));
      // get the validation errors from the requesy
      const errors = validationResult(req);
      
      //  concatenated the erros into a single string and added them to the flash message.
      if (!errors.isEmpty()) {
        const jobError = errors.array().map((error) => error.msg).join(', ');
        req.flash("error", jobError);
        // direct the user to the job new page
        return res.redirect("/jobs/new");
      }
  
    // extract the required job parameters from the request body
    let jobParams = getJobParams(req.body);
    console.log(getJobParams);

    Job.create(jobParams)
      .then((job) => {
        // send out the succes message
        req.flash(
          "success",
          `${job.title} job posted successfully!`
        );
        // set the redirect path for the response
        res.locals.redirect = "/jobs";
        // store the created new job in res.locals
        res.locals.job = job;
        // proceed to the next middleware function
        next();
      })
      //catch the error
      .catch((error) => {
        console.log(`Error saving job: ${error.message}`);
        // set the redirect path for the response
        res.locals.redirect = "/jobs/new";
        // send out the error message
        req.flash(
          "error",
          `Failed to post the job: ${error.message}`
        );
        // redirect the user to the job new page
        res.locals.redirect("/jobs/new");
        // proceed to the next middleware function
        next();
      });
  // catch the error during the job create process
  } catch (error) {
    console.log('Validation error: ${error.message}');
    // proceed to the next error handling function
    next(error);
  }
},

  // redirect to a specified path by the middleware function
  redirectView: (req, res, next) => {
    // get the redirect path from the response object's locals property
    let redirectPath = res.locals.redirect;
    // perform the redirection if there is a redirect path
    if (redirectPath) res.redirect(redirectPath);
    // else proceed to the next function
    else next();
  },

  // diplay a job by ID by the middleware function
  show: (req, res, next) => {
    // get the job ID from the request parameters
    let jobId = req.params.id;
    // find the job in the database by its ID
    Job.findById(jobId)
      // if the job is found, store it in the response
      .then((job) => {
        res.locals.job = job;
        // proceed to the next middleware function
        next();
      })
      //catch the error
      .catch((error) => {
        console.log(`Error finding job by ID: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  },

  // display all jobs
  showView: (req, res) => {
    // render the job display page
    res.render("jobs/show");
  },
  
  // check if the user is logged in
  checkLogin: (req, res, next) => {
    // is the user is not logged in, send the error message to flash page
    if ( !req.isAuthenticated()) {
      req.flash("error", 'Sorry, you must be logged in to access the jobs.');
      // direct the user to user login page
      res.redirect("/users/login");
    } else {
      // proceed to the next mddileware function
      next();
    }
  },

  // render the page for job editing
  edit: (req, res, next) => {
    // uodate the job ID
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      //catch the error
      .catch((error) => {
        // log the error message
        console.log(`Error finding job by ID: ${error.message}`);
        // call the next middleware function with the error object
        next(error);
      });
  },

  // render the page to show job parameters by middleware function
  update: async (req, res, next) => {
    try {
      
      await Promise.all(jobValidationRules().map((rule) => rule.run(req)));
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const jobError = errors.array().map((error) => error.msg).join(', ');
        req.flash("error", jobError);
        return res.redirect('/jobs/${req.params.id/edit');
      }

    let jobId = req.params.id,
      jobParams = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        description: req.body.description,
        requirements: req.body.requirements,
        salary: req.body.salary,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        postDate: req.body.postDate,
        deadlineDate: req.body.deadlineDate,
        isActive: req.body.isActive,
      };
  // find the job in database and update it by ID
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
      .then((job) => {
        req.flash("sucess", '${job.title} job has been updated.');
        // set the redirect path for the response
        res.locals.redirect = `/jobs/${jobId}`;
        // store the job in the response if it is found 
        res.locals.job = job;
        next();
       })
       //catch the error
        .catch((error) => {
          console.log(`Error updating job by ID: ${error.message}`);
          // store the error messages, retrieve and display it on the next request, providing feedback to the user after a form submission or other action.
          req.flash("error", 'Failed to update the job: ${error.message}');
          res.locals.redirect = '/jobs/${jobId}/edit';
          // call the next middleware function with the error object
          next();
        });
    } catch(error) {
      console.log ('Validation error: ${error.message}');
      next(error);
    }
  },

  // delete a job
  delete: (req, res, next) => {
    // update a job by ID
    let jobId = req.params.id;
    // function to find the job by ID and then delete it.
    Job.findByIdAndRemove(jobId)
      .then(() => {
        // set the redirect path to jobs
        res.locals.redirect = "/jobs";
        // proceed to the next middileware function
        next();
      })
      //catch the error
      .catch((error) => {
        // send out the error message
        console.log(`Error deleting job by ID: ${error.message}`);
        // proceed to the next middleware function if there is one
        next();
      });
  },
};