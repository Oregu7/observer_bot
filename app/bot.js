const config = require("config");
const Telegraf = require("telegraf");
const I18n = require("telegraf-i18n");
const { localSession } = require("./util");
const controllers = require("./controllers");

//config
const token = config.get("bot.token");
const bot = new Telegraf(token);
const i18n = new I18n({
    directory: config.get("bot.localesPath"),
    defaultLanguage: "ru",
    useSession: true,
});
// Create scene manager
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
// commands
bot.start(controllers.startController);
// patterns
bot.hears(/(https?:\/\/)?(www\.)?t\.me\/(\S+)\/(\d+)\??.*/, controllers.registerByURL);
// events
bot.on("message", controllers.messageController);

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;