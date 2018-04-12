const config = require("config");
const Telegraf = require("telegraf");
const { localSession, i18n } = require("./util");
const controllers = require("./controllers");

//config
const token = config.get("bot.token");
const bot = new Telegraf(token);
// Create scene manager
// middlewares
bot.use(localSession.middleware());
bot.use(i18n.middleware());
// commands
bot.start(controllers.startController);
bot.command("faq", controllers.faqController);
bot.command("views", controllers.countViewsController);
// patterns
bot.hears(/^\u{1F4C8}Посчитать просмотры$/ui, controllers.countViewsController);
bot.hears(/^\u{2139}FAQ$/ui, controllers.faqController);
bot.hears(/(https?:\/\/)?(www\.)?t\.me\/(\S+)\/(\d+)\??.*/, controllers.registerByURL);
//actions
bot.action(/xls:(\S+)/i, controllers.downloadAction.xlsx);
bot.action(/csv:(\S+)/i, controllers.downloadAction.csv);
bot.action(/xml:(\S+)/i, controllers.downloadAction.xml);
bot.action(/json:(\S+)/i, controllers.downloadAction.json);
// events
bot.on("message", controllers.messageController);

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;