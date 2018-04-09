const moment = require("moment");

const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const timers = {};

function getMilliseconds(date = null) {
    const dateObj = date ? new Date(date) : new Date;
    return dateObj.getTime();
}

function getDifference(date) {
    const date1 = getMilliseconds(date);
    const date2 = getMilliseconds();
    return date2 - date1;
}

// get watch time in milliseconds
function getWatchTime(date) {
    const difference = getDifference(date);
    return day - difference;
}

function getFinishDateInMilliseconds(date) {
    const watchTime = getWatchTime(date);
    const currentDate = getMilliseconds();
    return currentDate + watchTime;
}

function getFinishDate(ctx, date) {
    const finishDate = getFinishDateInMilliseconds(date);
    return formatDate(ctx, finishDate);
}

function formatDate(ctx, date, format = "lll") {
    const locale = ctx.i18n.locale();
    return moment(date)
        .locale(locale)
        .format(format);
}

function getDifferenceInHours(date) {
    const difference = getDifference(date);
    return difference / hour;
}


// timers

function saveTimers(post, timerId, timeOutId) {
    const { _id: postId } = post;
    timers[postId] = { timerId, timeOutId };
    return true;
}

function getTimers(post) {
    const { _id: postId } = post;
    const { timerId, timeOutId } = timers[postId];
    delete timers[postId];

    return { timerId, timeOutId };
}

function stopWatchers(post) {
    const { timerId, timeOutId } = getTimers(post);
    clearInterval(timerId);
    clearTimeout(timeOutId);
    return true;
}

module.exports = {
    hour,
    minute,
    getWatchTime,
    getFinishDate,
    formatDate,
    saveTimers,
    getTimers,
    stopWatchers,
    getFinishDateInMilliseconds,
    getDifferenceInHours,
};