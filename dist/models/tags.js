"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = void 0;
const mongoose_1 = require("mongoose");
const tagsSchema = new mongoose_1.Schema({
    tags: [{ type: String }]
});
tagsSchema.index({ feedGuid: 1, tagsGuid: 1 }, { unique: true });
exports.Tags = (0, mongoose_1.model)('tags', tagsSchema);
