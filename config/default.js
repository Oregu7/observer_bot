// загружаем переменные окружения
require("dotenv").config();
// загружаем компоненты
const path = require("path");
const mongo = require("./components/mongo");
const base = require("./components/base.json");
// необходимые переменные окружения
const REQUIRED_VARIABLES = [
    "NODE_ENV",
    "PORT",
    "IP",
    "WEBHOOK",
    "BOT_TOKEN",
    "DB_URI",
];

REQUIRED_VARIABLES.forEach((name) => {
    if (!process.env[name]) {
        throw new Error(`Environment variable ${name} is missing`);
    }
});

// use mongoDB
mongo(process.env.DB_URI);

// шарим конфиг
const config = {
    env: process.env.NODE_ENV,
    server: {
        port: Number(process.env.PORT),
        ip: process.env.IP,
        webhook: process.env.WEBHOOK,
    },
    bot: {
        token: process.env.BOT_TOKEN,
        localesPath: path.resolve(__dirname, "locales"),
    },
    base,
};

module.exports = config;