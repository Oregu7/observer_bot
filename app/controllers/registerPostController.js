const { registerPost } = require("../util");

exports.byURL = async(ctx) => {
    const [channel, messageId] = ctx.match.slice(3, 5);
    return registerPost(ctx, channel, messageId);
};

exports.byPost = (ctx) => {
    const { forward_from_message_id: messageId, forward_from_chat: { username = null } } = ctx.message;
    if (!username) return ctx.reply(ctx.i18n.t("base.incorrectPostMessage"));
    return registerPost(ctx, username, messageId);
};