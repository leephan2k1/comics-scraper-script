import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import lhModel from '../models/Lh.model';
import NtModel from '../models/Nt.model';
import OTKModel from '../models/Otk.model';
import AnilistModel from '../models/Myanilist';
import _24HModel from '../models/24H.model';
import { saveComics, saveDescriptionComics, saveChapters } from '../actions';
import faunaDb from '../services/faunaDb';

import cloudinaryController from './cloudinary.controller';

const Nt = NtModel.Instance(process.env.NT_SOURCE_URL as string);
const Lh = lhModel.Instance(process.env.LH_SOURCE_URL as string);
const Otk = OTKModel.Instance(process.env.OTK_SOURCE_URL as string);
const _24H = _24HModel.Instance(process.env.T4_SOURCE_URL as string);
const Myanilist = AnilistModel.Instance(
    process.env.ANILIST_SOURCE_URL as string,
);

import Comics from '../models';
const { getComics } = Comics();
const { uploadImage } = cloudinaryController();

export default function testController() {
    return {
        testGet: async (req: Request, res: Response, next: NextFunction) => {
            try {
                const start = new Date(Date.now());

                // const data = await Myanilist.getInfo('119161');
                // const data = await getComics();

                // const pageData = data?.map((e) => {
                //     if (e.status === 'fulfilled') {
                //         return e.value;
                //     }
                // });

                /* Scape all comics. */
                // await Promise.allSettled(
                //     [...new Array(544).keys()].map(async (e) => {
                //         await saveComics(e + 1);
                //     }),
                // );

                // await saveDescriptionComics();

                // const data = await Otk.getChapters(
                //     'https://otakusan.net/manga-detail/72756/manh-len-tu-coi-chet',
                // );

                // const result = await faunaDb().paginate(5);

                //@ts-ignore
                // const data = result.data.map((e) => {
                //     return e.ref.id;
                // });

                await saveChapters();

                return res.status(200).json({
                    message: 'ok',
                    // result,
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
