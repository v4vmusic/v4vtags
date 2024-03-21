"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const mongoose_1 = require("mongoose");
const itemSchema = new mongoose_1.Schema({
    synced: {
        type: Date,
        required: false
    },
    feedGuid: {
        type: String,
        required: true
    },
    itemGuid: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: false
    },
    mp3URL: {
        type: String,
        required: false
    },
    artistName: {
        type: String,
        required: false
    },
    albumName: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    tags: [{ type: String }]
});
itemSchema.index({ feedGuid: 1, itemGuid: 1 }, { unique: true });
exports.Item = (0, mongoose_1.model)('item', itemSchema);
