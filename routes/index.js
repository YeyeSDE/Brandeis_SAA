// requiire the express library and create a new router.
const router = require("express").Router();

// require the different routes
const userRoutes = require("./userRoutes"),
  errorRoutes = require ("./errorRoutes"),
  eventRoutes = require("./eventRoutes"),
  homeRoutes = require("./homeRoutes"),
  jobRoutes = require("./jobRoutes");
const apiRoutes = require("./apiRoutes");

// use the different routes moduels 
router.use("/", homeRoutes);
router.use("/users", userRoutes); 
router.use("/jobs", jobRoutes);
router.use("/events", eventRoutes);
router.use("/api", apiRoutes);
router.use("/", errorRoutes);

// export the router, so it can be used elsewhere
module.exports = router;