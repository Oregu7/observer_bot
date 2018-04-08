const { getViews } = require("../util");

// регистрируем пост
function registerPost(ctx, { views, hoursLater, date }) {

}

exports.byURL = async(ctx) => {
    const [channel, post] = ctx.match.slice(3, 5);
    const { views, date, hoursLater, error } = await getViews(channel, post);
    if (error) return ctx.reply(ctx.i18n.t("base.incorrectURLMessage"));

    return ctx.reply(`${views} - ${hoursLater} часов`);
};

exports.byPost = async(ctx) => {
    const { forward_from_message_id: post, forward_from_chat: { username = null } } = ctx.message;
    if (!username) return ctx.reply(ctx.i18n.t("base.incorrectPostMessage"));

    const { views, date, hoursLater, error } = await getViews(username, post);
    if (error) return ctx.reply(ctx.i18n.t("base.incorrectURLMessage"));

    return ctx.reply(`${views} - ${hoursLater} часов`);
};