const Markup = require("telegraf/markup");
const { UserModel } = require("../models");


module.exports = async(ctx) => {
    const parts = ctx.message.text.split(" ");
    const route = parts[1] || "/";

    if (!ctx.session.hasOwnProperty("authToken")) {
        let user = await UserModel.createByContext(ctx);
        console.log(`[ new client ] => ${user.username}:${user.userId}`);
        ctx.session.authToken = user._id;
    }

    const keyboard = Markup.keyboard([
        Markup.button("Посчитать просмотры"),
        Markup.button("FAQ"),
    ], { columns: 2 }).resize(true);

    return ctx.reply(ctx.i18n.t("base.startCommandMessage"), keyboard.extra());
};