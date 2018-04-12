const I18n = require("telegraf-i18n");

const i18n = new I18n({
    directory: require("config").get("bot.localesPath"),
    defaultLanguage: "ru",
    useSession: true,
});

module.exports = i18n;