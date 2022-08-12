import Comics from '../models';
import faunaDb from '../services/faunaDb';
import logEvents from '../utils/logEvents';
import { Comic_Chapters, Chapter_Pages } from 'type';
import Page from '../models/Page.model';
import Chapter from '../models/Chapter.model';
import ComicsMongo from '../models/Comics.model';
import Description from '../models/Description.model';

const { getComics, getComicsInfo, getChapters, getPagesOfChap } = Comics();
const { getDocumentId, saveDocument, paginate, upsertDocument } = faunaDb();

export async function saveComics(page: number) {
    const data = await getComics(page);

    const pageData = data?.map((e) => {
        if (e.status === 'fulfilled') {
            return e.value;
        }
    });

    if (pageData && pageData.length)
        await Promise.allSettled(
            pageData?.map(async (comic, index) => {
                await ComicsMongo.updateOne(
                    {
                        name: comic.name,
                    },
                    comic,
                    { upsert: true },
                );

                console.log(`save ${comic.name} sucessfully`);
            }),
        );
}

export async function saveDescriptionComics() {
    try {
        const limit = 5;
        let count = 0;
        let data = await ComicsMongo.find().limit(limit).skip(count);

        //@ts-ignore
        while (data.length > 0) {
            //@ts-ignore
            await Promise.allSettled(
                //@ts-ignore
                data.map(async (e) => {
                    const info = await getComicsInfo(e.name);

                    if (info) {
                        await Description.updateOne(
                            {
                                name: e.name,
                            },
                            info,
                            { upsert: true },
                        );

                        console.log(`save desc ${e.name} successfully`);
                    }
                }),
            );

            count = count + limit;
            data = await ComicsMongo.find().limit(limit).skip(count);
        }
    } catch (err) {
        console.log(err);
    }
}

export async function saveChapters() {
    try {
        const limit = 5;
        let count = 0;
        let data = await ComicsMongo.find().limit(limit).skip(count);
        //@ts-ignore
        while (data.length > 0) {
            //@ts-ignore
            await Promise.allSettled(
                //@ts-ignore
                data.map(async (comic) => {
                    const chapters: Comic_Chapters = {
                        chapters_list: [],
                        comicName: comic.name,
                        comicSlug: comic.slug,
                        source: 'NTC',
                    };

                    const mainChapters = await getChapters(comic.slug, 'NTC');

                    if (mainChapters && mainChapters.length > 0) {
                        chapters.chapters_list.push({
                            sourceName: 'NTC',
                            chapters: mainChapters,
                        });
                    }

                    //get chapter other source if exist:
                    if (comic.sourcesAvailable?.length > 0) {
                        await Promise.allSettled(
                            //@ts-ignore
                            comic.sourcesAvailable.map(async (e) => {
                                const chaptersResult = await getChapters(
                                    e.sourceSlug,
                                    e.sourceName,
                                );

                                if (
                                    chaptersResult &&
                                    chaptersResult.length > 0
                                ) {
                                    chapters.chapters_list.push({
                                        sourceName: e.sourceName,
                                        chapters: chaptersResult,
                                    });
                                }
                            }),
                        );
                    }

                    await Chapter.updateOne(
                        {
                            comicName: chapters.comicName,
                        },
                        chapters,
                        { upsert: true },
                    );

                    console.log(`save ${chapters.comicName} successfully!`);
                }),
            );

            //@ts-ignore
            count = count + limit;
            data = await ComicsMongo.find().limit(limit).skip(count);
        }
    } catch (err) {
        console.log(err);
    }
}

export async function savePagesOfChapter() {
    try {
        // const limit = 1;
        // let count = 0;
        // let data = await Chapter.find().limit(limit).skip(count);

        for await (const doc of Chapter.find().cursor()) {
            const pages_of_chap: Chapter_Pages = {
                comicName: doc?.comicName,
                comicSlug: doc?.comicSlug,
                source: '',
                chapterSlug: '',
                pages: [],
            };

            if (
                Array.isArray(doc?.chapters_list) &&
                doc?.chapters_list.length > 0
            ) {
                await Promise.allSettled(
                    //@ts-ignore
                    doc.chapters_list.map(async (eChap) => {
                        if (eChap.chapters.length === 0) return;

                        await Promise.allSettled(
                            //@ts-ignore
                            eChap.chapters.map(async (chap, index) => {
                                const existPages = await Page.findOne({
                                    chapterSlug: chap?.chapterSlug,
                                });
                                if (existPages) return;

                                const pagesOfChap = await getPagesOfChap(
                                    chap.chapterSlug,
                                    eChap.sourceName,
                                );

                                if (pagesOfChap?.length) {
                                    pages_of_chap.pages = pagesOfChap;
                                    pages_of_chap.chapterSlug =
                                        chap.chapterSlug;
                                    pages_of_chap.source = eChap.sourceName;
                                }

                                if (
                                    pages_of_chap.chapterSlug &&
                                    pages_of_chap.source
                                ) {
                                    await Page.updateOne(
                                        {
                                            chapterSlug: chap?.chapterSlug,
                                        },
                                        pages_of_chap,
                                        { upsert: true },
                                    );
                                }

                                console.log(
                                    `save ${chap.chapterSlug} ${index} successfully!`,
                                );
                            }),
                        );
                    }),
                );
            }
        }

        //@ts-ignore
        // while (data.length > 0) {
        //     await Promise.allSettled(
        //         //@ts-ignore
        //         data.map(async (chapter) => {
        //             const pages_of_chap: Chapter_Pages = {
        //                 comicName: chapter?.comicName,
        //                 comicSlug: chapter?.comicSlug,
        //                 source: '',
        //                 chapterSlug: '',
        //                 pages: [],
        //             };

        //             if (
        //                 Array.isArray(chapter?.chapters_list) &&
        //                 chapter?.chapters_list.length > 0
        //             ) {
        //                 await Promise.allSettled(
        //                     //@ts-ignore
        //                     chapter.chapters_list.map(async (eChap) => {
        //                         if (eChap.chapters.length === 0) return;

        //                         await Promise.allSettled(
        //                             //@ts-ignore
        //                             eChap.chapters.map(async (chap, index) => {
        //                                 const existPages = await Page.findOne({
        //                                     chapterSlug: chap?.chapterSlug,
        //                                 });
        //                                 if (existPages) return;

        //                                 const pagesOfChap =
        //                                     await getPagesOfChap(
        //                                         chap.chapterSlug,
        //                                         eChap.sourceName,
        //                                     );

        //                                 if (pagesOfChap?.length) {
        //                                     pages_of_chap.pages = pagesOfChap;
        //                                     pages_of_chap.chapterSlug =
        //                                         chap.chapterSlug;
        //                                     pages_of_chap.source =
        //                                         eChap.sourceName;
        //                                 }

        //                                 if (
        //                                     pages_of_chap.chapterSlug &&
        //                                     pages_of_chap.source
        //                                 ) {
        //                                     await Page.updateOne(
        //                                         {
        //                                             chapterSlug:
        //                                                 chapter?.chapterSlug,
        //                                         },
        //                                         pages_of_chap,
        //                                         { upsert: true },
        //                                     );
        //                                 }

        //                                 console.log(
        //                                     `save ${chapter.comicName} ${index} successfully!`,
        //                                 );
        //                             }),
        //                         );
        //                     }),
        //                 );
        //             }
        //         }),
        //     );

        //     //@ts-ignore
        //     count = count + limit;
        //     data = await ComicsMongo.find().limit(limit).skip(count);
        // }
    } catch (err) {
        console.log(`Error save pages of chap ${err}`);
    }
}

export async function convertFaunaToMongo() {
    try {
        const index = 'all_chapters';

        let data = await paginate(10, index);

        //@ts-ignore
        while (data?.after) {
            //@ts-ignore
            if (data?.after.length > 0) {
                //@ts-ignore
                if (!data?.after[0]) break;
            }

            //@ts-ignore
            await Promise.allSettled(
                //@ts-ignore
                data.data.map(async (e) => {
                    const comic = e.data;
                    const { comicId, ...rest } = comic;

                    console.log(rest);

                    await Chapter.updateOne(
                        {
                            comicName: comic.comicName,
                        },
                        {
                            ...rest,
                            createdAt: Date.now,
                        },
                        { upsert: true },
                    );

                    // await Chapter.create({
                    //     ...rest,
                    //     slug: comic.comicSlug,
                    // });

                    console.log(`save chapter ${comic.comicName} successfully`);
                }),
            );

            //@ts-ignore
            data = await paginate(10, index, data?.after);
        }
    } catch (err) {
        console.log(`error convertFaunaToMongo ${err}`);
    }
}
