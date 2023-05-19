const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const checkLogin = require('../checkLogin');

// Events routes
// get: only to display
// post: send data and modify data and may cause the change of the status of the data.
// put: similar to post: already have data and want to updata

router.get('/', eventsController.index, eventsController.indexView);
router.get('/new', checkLogin, eventsController.new);
router.post('/', checkLogin, eventsController.create, eventsController.redirectView);
router.get('/:id', checkLogin, eventsController.show, eventsController.showView);
router.get('/:id/edit', checkLogin, eventsController.edit);
router.put('/:id/update', checkLogin, eventsController.update, eventsController.redirectView);
router.delete('/:id/delete', checkLogin, eventsController.delete, eventsController.redirectView);
router.post("/:id/attend", checkLogin, eventsController.attend);

// export the route, so it can used elsewhere
module.exports = router;

