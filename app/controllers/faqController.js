const { compileMessage } = require("../util");
const { getMainKeyboard } = require("../helpers");

module.exports = (ctx) => {
    const { i18n } = ctx;
    const keyboard = getMainKeyboard(ctx);
    const info = i18n.t("base.startCommandMessage");
    const feedback = i18n.t("base.feedbackMessage");
    const message = `${info}
    
    <b>Основные функкции:</b>
    \u{1F538} Чтобы начать сбор статистики, просто отправьте мне ссылку на пост, или репостните запись из канала;
    \u{1F538} Бот собирает статистику, пока не пройдет 24 часа с публикации поста;
    \u{1F538} Бот делает измерения каждый час;
    \u{1F538} Вы не можете собирать статистику по постам, которые выложили более чем за 24 часа, до начала замера;
    \u{1F538} Если администратор канала удалил пост, то бот прекращает сбор статистики и выгружает собранные данные.

    ${feedback}`;

    return ctx.replyWithHTML(compileMessage(message), keyboard.extra());
};