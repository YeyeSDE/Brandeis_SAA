
//set the HTTP response status using the http-status-codes library 
const statusCodes = require("http-status-codes");

//handle the not-found situation to 404
exports.respondSourceNotFound = (req, res) => {
  let errorCode = statusCodes.NOT_FOUND;
  res.status(errorCode);
  res.render("404");
};

//handle the internal error to 500
exports.respondInternalError = (error, req, res, next) => {
  let errorCode = statusCodes.INTERNAL_SERVER_ERROR;
  console.log(error);
  res.status(errorCode);
  res.render("500");
  // next(error);
}