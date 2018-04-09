const Markup = require("telegraf/markup");

exports.getMainKeyboard = (ctx) => {
    return Markup.keyboard([
        Markup.button("\u{1F4C8}Посчитать просмотры"),
        Markup.button("\u{2139}FAQ"),
    ], { columns: 2 }).resize(true);
};