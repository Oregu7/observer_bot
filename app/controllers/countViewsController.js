const { compileMessage } = require("../util");
const { getMainKeyboard } = require("../helpers");
const escape = require("escape-html");

module.exports = (ctx) => {
    const { i18n } = ctx;
    const keyboard = getMainKeyboard(ctx);
    const feedback = i18n.t("base.feedbackMessage");
    const { from: { first_name: firstName = "" } } = ctx.message;
    const message = `Привет, ${escape(firstName)} !
    Чтобы начать сбор статистики, просто отправь мне ссылку на пост, или репостните запись из канала.

    ${feedback}`;

    return ctx.replyWithHTML(compileMessage(message), keyboard.extra());
};