const moment = require("moment");
const Telegraf = require("telegraf");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const getViews = require("./getViews");
const i18n = require("./i18n");
const { PostModel } = require("../models");

//config
const token = require("config").get("bot.token");
const bot = new Telegraf(token);

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

function getFinishDate(date) {
    const finishDate = getFinishDateInMilliseconds(date);
    return formatDate(finishDate);
}

function formatDate(date, format = "lll") {
    return moment(date)
        .locale("ru")
        .format(format);
}

function getDifferenceInHours(date) {
    const difference = getDifference(date);
    return difference / hour;
}

// timers
function saveTimers(post, timerId, timeOutId) {
    const { id: postId } = post;
    timers[postId] = { timerId, timeOutId };
    return true;
}

function stopWatchers(post) {
    try {
        const { timerId, timeOutId } = timers[post.id];
        clearInterval(timerId);
        clearTimeout(timeOutId);
        delete timers[post.id];
    } catch (err) {
        console.error(err);
    }

    return true;
}

async function watcherHandler(post) {
    const { channel, messageId, id: postId, url } = post;
    const { views, viewsCount, error } = await getViews(channel, messageId);
    if (error) {
        stopWatchers(post);
        const { subscribers, statistics } = await PostModel.getSubscribersAndStat(postId);
        subscribers.forEach((subscriber) => {
            let message = i18n.t("base.watchErrorMessage", { url });
            bot.telegram.sendMessage(subscriber, message, Extra.HTML());
        });

        PostModel.closeActivity(postId);
        sendStatisticsMessage(post, statistics, subscribers);
        return { error: true };
    }

    let ok = await PostModel.updateStatistics(postId, { views, viewsCount });
    console.log(`${channel}[${postId}] => ${views}`);

    return ok;
}

async function closeWatcher(post) {
    stopWatchers(post);
    const ok = await watcherHandler(post);
    if (ok.error) return null;

    const { subscribers, statistics } = await PostModel.getSubscribersAndStat(post.id);
    console.log(`${post.channel}[${post.id}] => finish`);

    PostModel.closeActivity(post.id);
    return sendStatisticsMessage(post, statistics, subscribers);
}

function sendStatisticsMessage(post, statistics, subscribers) {
    let message = `--- Статистика <a href ="${post.url}">поста</a> ---\n`;
    const [lastStat] = statistics.splice(-1);
    statistics.forEach((el, indx) => {
        message += `${indx + 1}) ${formatDate(el.date)} - ${el.views}\n`;
    });
    message += `[${formatDate(lastStat.date)}]\n\nИтого за 24 часа пост набрал <b>${lastStat.views}</b>`;
    const keyboard = Markup.inlineKeyboard([
        Markup.callbackButton(".csv", `csv:${post.id}`),
        Markup.callbackButton(".xls", `xls:${post.id}`),
        Markup.callbackButton(".xml", `xml:${post.id}`),
        Markup.callbackButton(".json", `json:${post.id}`),
    ], { columns: 4 });

    return subscribers.forEach((subscriber) => {
        bot.telegram.sendMessage(subscriber, message, Extra.HTML().markup(keyboard));
    });
}

function startWatchers(post) {
    const timerId = setInterval(watcherHandler, hour, post);
    const timeOutId = setTimeout(closeWatcher, getWatchTime(post.date), post);
    saveTimers(post, timerId, timeOutId);
}

async function run() {
    const postList = await PostModel.find({ active: true })
        .select("url date channel messageId");

    for (let post of postList) {
        startWatchers(post);
    }
}

module.exports = {
    run,
    hour,
    minute,
    getWatchTime,
    getFinishDate,
    formatDate,
    saveTimers,
    stopWatchers,
    startWatchers,
    getFinishDateInMilliseconds,
    getDifferenceInHours,
};