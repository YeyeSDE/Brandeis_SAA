// require the express library and create a new router module 
const router = require("express").Router();
// require the usersController
const usersController = require("../controllers/usersController");

// users routes 
// get: only to display
// post: send data and modify data and may cause the change of the status of the data.
// put: similar to post: already have data and want to updata
router.get("/", usersController.isAdmin, usersController.index, usersController.indexView);
router.get("/new", usersController.new);
router.post(
    "/create",
    usersController.create, 
    usersController.redirectView
);
router.get("/login", usersController.login);

router.post("/login", usersController.authenticate);
router.get("/logout", usersController.logout, usersController.redirectView);
router.get("/:id", usersController.show, usersController.showView);
router.get("/:id/edit", usersController.edit);
router.put("/:id/update",usersController.update, usersController.redirectView);
router.delete(
    "/:id/delete", 
    usersController.delete, 
    usersController.redirectView
);

// export the user route, so it can be used elsewhere
module.exports = router;
