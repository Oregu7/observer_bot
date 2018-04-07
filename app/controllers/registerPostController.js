const { getViews } = require("../util");

exports.byURL = async(ctx) => {
    const [channel, post] = ctx.match.slice(3, 5);
    const data = await getViews(channel, post);
    console.log(data);
    return ctx.reply(`${data.views} - ${data.hoursLater} часов`);
};