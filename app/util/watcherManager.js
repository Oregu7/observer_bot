const moment = require("moment");
const { telegram } = require("../bot");

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
    const { id: postId } = post;
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

async function watcherHandler(post) {
    const { channel, messageId, id: postId } = post;
    const { views, viewsCount, error } = await getViews(channel, messageId);
    if (error) {
        stopWatchers(post);
        ctx.replyWithHTML(ctx.i18n.t("base.watchErrorMessage", { url: post.url }));
        return sendStatisticsMessage(ctx, post);
    }

    let ok = await PostModel.update({ id: postId }, { $push: { statistics: { views, viewsCount } } });
    console.log(`${channel}[${postId}] => ${views}`);

    return ok;
}

async function closeWatcher(post) {
    stopWatchers(post);
    let ok = await watcher(ctx, post);
    console.log(`${post.channel}[${post.id}] => finish`);
    return sendStatisticsMessage(ctx, post);
}

async function sendStatisticsMessage(post) {
    const { statistics } = await PostModel.findById(post.id);
    let message = `--- Статистика <a href ="${post.url}">поста</a> ---\n`;
    const [lastStat] = statistics.splice(-1);
    statistics.forEach((el, indx) => {
        message += `${indx + 1}) ${formatDate(ctx, el.date)} - ${el.views}\n`;
    });
    message += `[${formatDate(ctx, lastStat.date)}]\n\nИтого за 24 часа пост набрал <b>${lastStat.views}</b>`;

    return ctx.replyWithHTML(message);
}

function startWatchers(post) {
    const timerId = setInterval(watcherHandler, hour, post);
    const timeOutId = setTimeout(closeWatcher, getWatchTime(post.date), post);
    saveTimers(post, timerId, timeOutId);
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
    startWatchers,
    getFinishDateInMilliseconds,
    getDifferenceInHours,
};