const _ = require("lodash");
const Markup = require("telegraf/markup");
const csv = require("fast-csv");
const xlsx = require("node-xlsx");
const xml2js = require("xml2js");
const fs = require("fs");
const tmp = require("tmp");

const { PostModel } = require("../models");

function getPostMiddleware(callback) {
    return async(ctx) => {
        const [, postId] = ctx.match;
        const post = await PostModel.findById(postId)
            .select("-subscribers -statistics._id");
        if (post) return callback(ctx, post);
        return ctx.answerCbQuery("Данный пост отсутсвует :(");
    }
}

function tmpFile(ctx, prefix, postfix, callback) {
    tmp.file({ mode: 0644, prefix, postfix }, function _tempFileCreated(err, path, fd, cleanup) {
        try {
            if (err) throw err;
            ctx.answerCbQuery();
            ctx.reply("Начинаю загрузку...");
            return callback(path, fd, cleanup);
        } catch (err) {
            return ctx.reply("Что-то пошло не так .(");
        }
    });
}

exports.csv = getPostMiddleware((ctx, post) => {
    tmpFile(ctx, "views-", ".csv", (path, fd, cleanup) => {
        csv
            .writeToPath(path, post.statistics, { headers: true })
            .on("finish", async(error) => {
                await ctx.replyWithDocument({ source: path });
                cleanup();
            });
    });
})

exports.json = getPostMiddleware((ctx, post) => {
    tmpFile(ctx, "views-", ".json", (path, fd, cleanup) => {
        fs.writeFile(path, JSON.stringify(post.statistics), async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})

exports.xlsx = getPostMiddleware((ctx, post) => {
    tmpFile(ctx, "views-", ".xlsx", (path, fd, cleanup) => {
        const { statistics } = post.toObject();
        const data = [
            _.keys(statistics[0]),
            ...statistics.map((views) => _.values(views))
        ];
        const buffer = xlsx.build([{ name: "views", data: data }]);
        fs.writeFile(path, buffer, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})

exports.xml = getPostMiddleware((ctx, post) => {
    const builder = new xml2js.Builder();
    tmpFile(ctx, "views-", ".xml", (path, fd, cleanup) => {
        const { statistics } = post.toObject();
        const obj = {
            root: { statistics }
        };
        const xml = builder.buildObject(obj);
        fs.writeFile(path, xml, async(err) => {
            await ctx.replyWithDocument({ source: path });
            cleanup();
        });
    });
})