const LocalSession = require("telegraf-session-local");
const localSession = new LocalSession({ database: "session_db.json" });

module.exports = localSession;