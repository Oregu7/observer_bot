const moment = require("moment");
const { getViews, watcherManager } = require("../util");
const { PostModel } = require("../models");

// регистрируем пост
async function registerPost(ctx, channel, messageId) {
    const { i18n } = ctx;
    const { chat: { id: userId } } = ctx.message;
    const { views, viewsCount, date, url, error } = await getViews(channel, messageId);
    const hoursLater = watcherManager.getDifferenceInHours(date);
    const finishDate = watcherManager.getFinishDate(ctx, date);
    // невалидный url
    if (error)
        return ctx.reply(i18n.t("base.incorrectURLMessage"));
    // пост выложили более 24-х часов назад
    else if (hoursLater > 24)
        return ctx.replyWithHTML(i18n.t("base.theWatchLimitExceededMessage", { hoursLater: Math.floor(hoursLater) }));
    // регитрируем пост
    const post = await PostModel.createAndCheckExist({ channel, messageId, userId, url, date }, { views, viewsCount });
    // если мы его уже добавили
    if (post.exist)
        return ctx.replyWithHTML(i18n.t("base.existPostMessage", { finishDate, url: post.utl }));

    // запускаем вотчеры
    const timerId = setInterval(watcher, watcherManager.hour, ctx, post);
    const timeOutId = setTimeout(closeWatcher, watcherManager.getWatchTime(date), ctx, post);
    watcherManager.saveTimers(post, timerId, timeOutId);

    return ctx.replyWithHTML(i18n.t("base.startWatchMessage", { finishDate, url }));
}

async function watcher(ctx, post) {
    const { channel, messageId, _id: postId } = post;
    const { views, viewsCount, error } = await getViews(channel, messageId);
    if (error) {
        watcherManager.stopWatchers(post);
        ctx.replyWithHTML(ctx.i18n.t("base.watchErrorMessage", { url: post.url }));
        return sendStatisticsMessage(ctx, post);
    }

    let ok = await PostModel.update({ _id: postId }, { $push: { statistics: { views, viewsCount } } });
    console.log(`${channel}[${postId}] => ${views}`);

    return ok;
}

async function closeWatcher(ctx, post) {
    watcherManager.stopWatchers(post);
    let ok = await watcher(ctx, post);
    console.log(`${post.channel}[${post._id}] => finish`);
    return sendStatisticsMessage(ctx, post);
}


async function sendStatisticsMessage(ctx, post) {
    const { statistics } = await PostModel.findById(post._id);
    let message = `--- Статистика <a href ="${post.url}">поста</a> ---\n`;
    const [lastStat] = statistics.splice(-1);
    statistics.forEach((el, indx) => {
        message += `${indx + 1}) ${watcherManager.formatDate(ctx, el.date)} - ${el.views}\n`;
    });
    message += `[${watcherManager.formatDate(ctx, lastStat.date)}]\n\nИтого за 24 часа пост набрал <b>${lastStat.views}</b>`;

    return ctx.replyWithHTML(message);
}

exports.byURL = async(ctx) => {
    const [channel, messageId] = ctx.match.slice(3, 5);
    return registerPost(ctx, channel, messageId);
};

exports.byPost = (ctx) => {
    const { forward_from_message_id: messageId, forward_from_chat: { username = null } } = ctx.message;
    if (!username) return ctx.reply(ctx.i18n.t("base.incorrectPostMessage"));
    return registerPost(ctx, username, messageId);
};