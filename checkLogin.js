// check if the user is already logged in
const checkLogin = (req, res, next) => {
  // if not, send out the reminding message to the flash page.
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to access jobs.");
    // redirect the page to the user login page.
    res.redirect('/login');
  } else {
    next();
  }
};
// export the login so it can be used elsewhere 
module.exports = checkLogin;