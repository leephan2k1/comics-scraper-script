import mongoose from 'mongoose';
import { mongoDbRemoteClient } from '../config';
const { Schema } = mongoose;

const ChapterSchema = new Schema({
    custom_id: { type: Number, require: true },
    status: {
        type: String,
        require: true,
    },
    author: {
        type: String,
        require: true,
    },
    genres: [
        {
            id: String,
            value: String,
            label: String,
        },
    ],
    otherName: {
        type: String,
        require: true,
    },
    review: {
        type: String,
        require: true,
    },
    newChapter: {
        type: String,
        require: true,
    },
    thumbnail: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
        index: true,
    },
    updatedAt: {
        type: String,
        require: true,
    },
    slug: {
        type: String,
        require: true,
        index: true,
    },
    sourcesAvailable: [
        {
            sourceName: {
                type: String,
            },
            sourceSlug: {
                type: String,
            },
        },
    ],
    createdAt: {
        type: Date,
    },
});

export default mongoDbRemoteClient.model('comics', ChapterSchema);