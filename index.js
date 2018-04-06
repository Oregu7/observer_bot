const rp = require("request-promise");
const cheerio = require("cheerio");
const moment = require("moment");

async function getViews(link = "") {
    const regx = /(https?:\/\/)?(www\.)?t\.me\/(\S+)\/(\d+)\??.*/;
    const [channel, post] = link.match(regx).slice(3, 5);
    const url = `https://t.me/${channel}/${post}?embed=1`;
    console.log(url);
    const data = await rp.get(url);
    const $ = cheerio.load(data);
    
    const info = $(".tgme_widget_message_info");
    const views = info
        .find("span.tgme_widget_message_views")
        .text();
    const date = info
        .find("span.tgme_widget_message_meta > a > time")
        .attr("datetime");

    const momentDate = moment(date).locale("ru").format("L");
    const viewsNum = parseViews(views);
    return {
        views,
        viewsNum,
        date,
        momentDate
    };
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

// https://t.me/buff_10/1240

getViews("https://t.me/buff_10/1240")
    .then(console.log)
    .catch(console.error);