const router = require("express").Router();
const eventsController = require("../controllers/eventsController");
const usersController = require("../controllers/usersController");

// make sure each user has an unique token
router.use(usersController.verifyToken);

// require the eventsController here
router.get("/events", eventsController.index, eventsController.respondJSON);
router.get(
    "/events/:id/join",
    eventsController.attend,
    eventsController.respondJSON
);

router.use(eventsController.errorJSON);
// export the route, so it can be used elsewhere
module.exports = router;