// set the routes for navbar

module.exports = {
    index: (req, res) => {
        res.render("index.ejs");
    },
    contact: (req, res) => {
        res.render("contact");
    },
    about: (req, res) => {
        res.render("about");
    },
    chat: (req, res) => {
        res.render("chat");
    }
};

