const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
    subscribers: [{ type: Number, required: true }],
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

PostSchema.statics.createOrSubscribe = async function(userId, data, statistics) {
    const post = await this.findOne({ url: data.url }).select("url date subscribers");
    if (post && post.subscribers.indexOf(userId) !== -1) {
        return { exist: true, url: post.url, date: post.date };
    }else if(post) {
        post.subscribers.push(userId);
        await post.save();
        return { subscribe: true, url: post.url, date: post.date };
    }

    const {
        _id: id,
        url,
        date,
        channel,
        messageId,
    } = await this.create(Object.assign({}, data, { statistics: [statistics], subscribers: [userId] }));

    return { id, url, channel, messageId, date };
};

module.exports = mongoose.model("Post", PostSchema);