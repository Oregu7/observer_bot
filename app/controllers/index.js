const startController = require("./startController");
const messageController = require("./messageController");
const { byURL: registerByURL } = require("./registerPostController");
const countViewsController = require("./countViewsController");
const faqController = require("./faqController");
const downloadAction = require("./downloadAction");

module.exports = {
    startController,
    registerByURL,
    messageController,
    countViewsController,
    faqController,
    downloadAction,
};