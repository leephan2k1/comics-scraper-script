import lhModel from '../models/Lh.model';
import NtModel from '../models/Nt.model';
import OTKModel from '../models/Otk.model';
import AnilistModel from '../models/Myanilist';
import _24HModel from '../models/24H.model';
import { Source_Type } from 'type';

const Nt = NtModel.Instance(process.env.NT_SOURCE_URL as string);
const Lh = lhModel.Instance(process.env.LH_SOURCE_URL as string, 10000);
const Otk = OTKModel.Instance(process.env.OTK_SOURCE_URL as string);
const _24H = _24HModel.Instance(process.env.T4_SOURCE_URL as string);
const Myanilist = AnilistModel.Instance(
    process.env.ANILIST_SOURCE_URL as string,
);

export default function Comics() {
    return {
        getComics: async (page: number) => {
            try {
                const data = (await Nt.scrapePage(page))?.mangaData;

                if (data) {
                    return await Promise.allSettled(
                        data.map(async (e) => {
                            if (!e.sourcesAvailable) {
                                e.sourcesAvailable = [];
                            }

                            const LHRes = await Lh.search(e.name);
                            if (LHRes) {
                                e.sourcesAvailable.push({
                                    sourceName: 'LHM',
                                    sourceSlug: LHRes.url,
                                });
                            }

                            const OtkRes = await Otk.search(e.name);
                            if (OtkRes?.length && OtkRes[0]?.slug) {
                                e.sourcesAvailable.push({
                                    sourceName: 'OTK',
                                    sourceSlug:
                                        (process.env.OTK_SOURCE_URL as string) +
                                        OtkRes[0].slug,
                                });
                            }

                            return e;
                        }),
                    );
                }
            } catch (err) {
                console.log(err);
            }
        },

        getComicsInfo: async (comicName: string) => {
            try {
                const data = await Myanilist.search(comicName);

                if (data) {
                    const info = await Myanilist.getInfo(data.id);

                    return { mal_id: data.id, ...info };
                }
            } catch (err) {
                return null;
            }
        },

        getChapters: async (comicSlug: string, sourceName: Source_Type) => {
            try {
                switch (sourceName) {
                    case 'LHM':
                        return await Lh.getChapters(comicSlug);
                    case 'OTK':
                        return await Otk.getChapters(comicSlug);
                    case 'NTC':
                        return await Nt.getChapters(comicSlug);
                }
            } catch (err) {
                return [];
            }
        },

        getPagesOfChap: async (
            chapterSlug: string,
            sourceName: Source_Type,
        ) => {
            try {
                switch (sourceName) {
                    case 'LHM':
                        return await Lh.getChapterPages(chapterSlug);
                    case 'NTC':
                        return await Nt.getChapterPages(chapterSlug);
                    case 'OTK':
                        return await Otk.getChapterPages(chapterSlug);
                }
            } catch (err) {
                console.log(`Error getPagesOfChap ${err}`);
                return [];
            }
        },
    };
}
