const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
    userId: { type: Number, required: true },
    url: { type: String, required: true },
    channel: { type: String, required: true },
    postId: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    statistics: [{
        date: { type: Date, required: true },
        views: { type: String, required: true },
        viewsCount: { type: Number, required: true },
    }],
});

module.exports = mongoose.model("Post", PostSchema);