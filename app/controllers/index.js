const startController = require("./startController");
const messageController = require("./messageController");
const { byURL: registerByURL } = require("./registerPostController");

module.exports = {
    startController,
    registerByURL,
    messageController,
};