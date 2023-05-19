const router = require("express").Router();
const errorController = require("../controllers/errorController");
router.use(errorController.respondSourceNotFound);
router.use(errorController.respondInternalError);
module.exports = router;