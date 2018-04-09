const { isURL } = require("validator");
const { byPost } = require("./registerPostController");

function otherwise(ctx) {
    //
}

module.exports = (ctx) => {
    const { text = "", forward_from_chat } = ctx.message;

    if (forward_from_chat) return byPost(ctx);
    else if (text.length && isURL(text)) return ctx.reply(ctx.i18n.t("base.incorrectURLMessage"));
    else return otherwise(ctx);
};