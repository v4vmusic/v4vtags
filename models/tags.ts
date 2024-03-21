import { Document, model, Schema } from "mongoose";

export interface Tags extends Document {
    tags : string[];
}



const tagsSchema = new Schema<Tags>({
    tags: [{type: String}]
});

tagsSchema.index({ feedGuid: 1, tagsGuid: 1 }, { unique: true });

export const Tags = model<Tags>('tags', tagsSchema);