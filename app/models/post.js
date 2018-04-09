const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
    userId: { type: Number, required: true },
    url: { type: String, required: true, index: true },
    channel: { type: String, required: true },
    messageId: { type: Number, required: true },
    date: { type: Date, required: true },
    active: { type: Boolean, default: true },
    statistics: [{
        date: { type: Date, default: Date.now },
        views: { type: String, required: true },
        viewsCount: { type: Number, required: true },
    }],
});

PostSchema.statics.createAndCheckExist = async function(data, statistics) {
    const exist = await this.findOne({ userId: data.userId, url: data.url }).select("url date");
    if (exist) return { exist: true, url: exist.url, date: exist.date };

    return await this.create(Object.assign({}, data, { statistics: [statistics] }));
};

module.exports = mongoose.model("Post", PostSchema);