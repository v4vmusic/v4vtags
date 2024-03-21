import { Document, model, Schema } from "mongoose";

export interface Item extends Document {
    synced?: Date;
    feedGuid: string;
    itemGuid: string;
    imageURL?: string;
    mp3URL?: string;
    artistName?: string;
    albumName?: string;
    title?: string;
    tags?: string[];
}



const itemSchema = new Schema<Item>({

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
    tags: [{type: String}]
});

itemSchema.index({ feedGuid: 1, itemGuid: 1 }, { unique: true });

export const Item = model<Item>('item', itemSchema);