const router = require("express").Router();
const homeController = require("../controllers/homeController");
const checkLogin = require('../checkLogin');
//const usersController = require("../controllers/usersController");

// Home routes
router.get("/", homeController.index);
router.get("/about", homeController.about);
router.get("/contact", homeController.contact);
router.get("/chat", checkLogin, homeController.chat);

// export the route, so it can used elsewhere
module.exports = router;
