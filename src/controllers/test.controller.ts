import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import lhModel from '../models/Lh.model';
import NtModel from '../models/Nt.model';
import OTKModel from '../models/Otk.model';
import AnilistModel from '../models/Myanilist';
import _24HModel from '../models/24H.model';
import Chapter from '../models/Chapter.model';
import {
    saveComics,
    saveDescriptionComics,
    saveChapters,
    savePagesOfChapter,
    convertFaunaToMongo,
} from '../actions';
import faunaDb from '../services/faunaDb';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
const { Readable } = require('stream');

import cloudinaryController from './cloudinary.controller';
import { cloudinaryClient } from '../config';
import ComicsModel from '../models/Comics.model';

const Nt = NtModel.Instance(process.env.NT_SOURCE_URL as string);
const Lh = lhModel.Instance(process.env.LH_SOURCE_URL as string);
const Otk = OTKModel.Instance(process.env.OTK_SOURCE_URL as string);
const _24H = _24HModel.Instance(process.env.T4_SOURCE_URL as string);
const Myanilist = AnilistModel.Instance(
    process.env.ANILIST_SOURCE_URL as string,
);

import Comics from '../models';
import axios from 'axios';
const { getComics } = Comics();
const { uploadImage } = cloudinaryController();

export default function testController() {
    return {
        testGet: async (req: Request, res: Response, next: NextFunction) => {
            try {
                // const data = await Myanilist.getInfo('119161');
                // const data = await getComics();
                // const pageData = data?.map((e) => {
                //     if (e.status === 'fulfilled') {
                //         return e.value;
                //     }
                // });

                /* Scape all comics. */
                // await Promise.allSettled(
                //     [...new Array(555).keys()].map(async (e) => {
                //         await saveComics(e + 1);
                //     }),
                // );

                // for (let i = 1; i <= 555; i++) {
                //     await saveComics(i);
                // }

                // await saveChapters();

                // const data = await faunaDb().paginate(10, 'all_comics');

                //@ts-ignore
                // const result = await faunaDb().paginate(5);
                //@ts-ignore

                // const data = await ComicsModel.find().limit(5).skip(16435);

                // await savePagesOfChapter();

                // await saveDescriptionComics();

                await savePagesOfChapter();

                // for await (const doc of Chapter.find().cursor()) {
                //     console.log(doc);
                // }

                return res.status(200).json({
                    message: 'ok',
                    // cost:
                    //     Math.round(
                    //         (new Date(Date.now()).getTime() - start.getTime()) /
                    //             1000,
                    //     ) + 's',
                });
            } catch (err) {
                return res.status(400).json({
                    message: 'error',
                });
            }
        },

        testPost: async (req: Request, res: Response, next: NextFunction) => {
            const { body } = req;

            return res.status(200).json({
                message: 'ok',
            });
        },
    };
}
