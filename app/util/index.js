const i18n = require("./i18n");
const localSession = require("./localSession");
const getUserInfo = require("./getUserInfo");
const getViews = require("./getViews");
const watcherManager = require("./watcherManager");
const compileMessage = require("./compileMessage");
const registerPost = require("./registerPost");


module.exports = {
    i18n,
    localSession,
    getUserInfo,
    getViews,
    watcherManager,
    registerPost,
    compileMessage,
};