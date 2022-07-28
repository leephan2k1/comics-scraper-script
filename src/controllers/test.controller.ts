import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import lhModel from '../models/Lh.model';
import NtModel from '../models/Nt.model';
import OTKModel from '../models/Otk.model';
import AnilistModel from '../models/Myanilist';
import _24HModel from '../models/24H.model';
import { saveComics } from '../actions/scrapeComics';

const Nt = NtModel.Instance(process.env.NT_SOURCE_URL as string);
const Lh = lhModel.Instance(process.env.LH_SOURCE_URL as string);
const Otk = OTKModel.Instance(process.env.OTK_SOURCE_URL as string);
const _24H = _24HModel.Instance(process.env.T4_SOURCE_URL as string);
const Myanilist = AnilistModel.Instance(
    process.env.ANILIST_SOURCE_URL as string,
);

import Comics from '../models';
const { getComics } = Comics();

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

                for (let i = 1; i <= 511; i++) {
                    await saveComics(i);
                }

                return res.status(200).json({
                    message: 'ok',
                    // data,
                });
            } catch (err) {
                return res.status(200).json({
                    message: 'not found',
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
