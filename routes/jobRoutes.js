// require express library and create a router object
const router = require("express").Router();
// import checkLogin and jobsController
const checkLogin = require('../checkLogin');
const jobsController = require('../controllers/jobsController');

// job routes
// get: only to display
// post: send data and modify data and may cause the change of the status of the data.
// put: similar to post: already have data and want to updata
router.get('/', jobsController.index, jobsController.indexView);
router.get('/new', checkLogin, jobsController.new);
router.post('/create', checkLogin, jobsController.create, jobsController.redirectView);
router.get('/:id', checkLogin, jobsController.show, jobsController.showView);
router.get('/:id/edit', checkLogin, jobsController.edit);
router.put('/:id/update', checkLogin, jobsController.update, jobsController.redirectView);
router.delete('/:id/delete', checkLogin, jobsController.delete, jobsController.redirectView);

// export the route, so it can used elsewhere
module.exports = router;


