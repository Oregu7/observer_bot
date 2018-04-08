const rp = require("request-promise");
const cheerio = require("cheerio");

async function getViews(channel, post) {
    const url = `https://t.me/${channel}/${post}?embed=1`;
    const data = await rp.get(url);
    const $ = cheerio.load(data);

    const info = $(".tgme_widget_message_info");
    const views = info
        .find("span.tgme_widget_message_views")
        .text();
    const date = info
        .find("span.tgme_widget_message_meta > a > time")
        .attr("datetime");

    if (!views) return { error: "incorrect link" };

    const hoursLater = getDifferenceInHours(date);
    const viewsNum = parseViews(views);
    return {
        views,
        viewsNum,
        date,
        hoursLater,
        error: null,
    };
}

function getMilliseconds(data = null) {
    const date = data ? new Date(data) : new Date;
    return date.getTime();
}

function getDifferenceInHours(data) {
    const date = getMilliseconds(data);
    const date2 = getMilliseconds();
    return (date2 - date) / (1000 * 60 * 60);
}

function parseViews(views) {
    const regx = /(\d+)\.?(\d+)?(K|M)?/;
    const [, firstNum, secNum, pattern] = views.match(regx);
    switch (pattern) {
        case "K":
            return Number(firstNum) * 1000 + (secNum ? Number(secNum) * 100 : 0);
        case "M":
            return Number(firstNum) * 1000000 + (secNum ? Number(secNum) * 1000 : 0);
        default:
            return Number(firstNum);
    }
}

module.exports = getViews;