const getViews = require("./getViews");
const watcherManager = require("./watcherManager");
const { PostModel } = require("../models");

// регистрируем пост
module.exports = async(ctx, channel, messageId) => {
    const { i18n } = ctx;
    const { chat: { id: userId } } = ctx.message;
    const { views, viewsCount, date, url, error } = await getViews(channel, messageId);
    const hoursLater = watcherManager.getDifferenceInHours(date);
    const finishDate = watcherManager.getFinishDate(date);
    // невалидный url
    if (error)
        return ctx.reply(i18n.t("base.incorrectURLMessage"));
    // пост выложили более 24-х часов назад
    else if (hoursLater > 24)
        return ctx.replyWithHTML(i18n.t("base.theWatchLimitExceededMessage", {
            hoursLater: Math.floor(hoursLater),
        }));
    // регитрируем пост
    const post = await PostModel.createOrSubscribe(userId, {
        channel,
        messageId,
        url,
        date,
    }, { views, viewsCount });
    // если мы его уже добавили или подписались
    if (post.exist)
        return ctx.replyWithHTML(i18n.t("base.existPostMessage", { finishDate, url: post.utl }));
    else if (post.subscribe)
        return ctx.replyWithHTML(i18n.t("base.startWatchMessage", { finishDate, url: post.url }));

    // запускаем вотчеры
    watcherManager.startWatchers(post);
    return ctx.replyWithHTML(i18n.t("base.startWatchMessage", { finishDate, url }));
};