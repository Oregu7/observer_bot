const { UserModel } = require("../models");
const { getMainKeyboard } = require("../helpers");
const { getUserInfo } = require("../util");

module.exports = async(ctx) => {
    const { i18n } = ctx;
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.registerUser(getUserInfo(ctx));
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
    }

    const info = i18n.t("base.startCommandMessage");
    const feedback = i18n.t("base.feedbackMessage");
    const keyboard = getMainKeyboard(ctx);

    return ctx.replyWithHTML(`${info}\n\n${feedback}`, keyboard.extra());
};