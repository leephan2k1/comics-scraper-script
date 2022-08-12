import mongoose from 'mongoose';
import { mongoDbLocalClient } from '../config';
const { Schema } = mongoose;

const ChapterSchema = new Schema(
    {
        chapterSlug: {
            type: String,
            unique: true,
            require: true,
            index: true,
        },
        pages: [
            {
                id: {
                    type: String,
                    require: true,
                },
                src: {
                    type: String,
                    require: true,
                },
                fallbackSrc: {
                    type: String,
                },
            },
        ],
        comicId: {
            type: String,
            require: true,
        },
        comicSlug: {
            type: String,
            require: true,
        },
        comicName: {
            type: String,
            require: true,
        },
        source: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoDbLocalClient.model('pages', ChapterSchema);
