const config = require("config");
const Telegraf = require("telegraf");
const { localSession } = require("./util");
const controllers = require("./controllers");

//config
const token = config.get("bot.token");
const bot = new Telegraf(token);
// Create scene manager
// middlewares
bot.use(localSession.middleware());
// commands
bot.start(controllers.startController);
// patterns
bot.hears(/(https?:\/\/)?(www\.)?t\.me\/(\S+)\/(\d+)\??.*/, controllers.registerPostController.byURL);
// events
bot.on("message", (ctx) => {
    console.log(ctx.message);
});

bot.catch((err) => {
    console.error(err);
});

module.exports = bot;