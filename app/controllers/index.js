const startController = require("./startController");
const messageController = require("./messageController");
const { byURL: registerByURL } = require("./registerPostController");
const countViewsController = require("./countViewsController");
const faqController = require("./faqController");

module.exports = {
    startController,
    registerByURL,
    messageController,
    countViewsController,
    faqController,
};