import Comics from '../models';
import faunaDb from '../services/faunaDb';
import logEvents from '../utils/logEvents';
import { Comic_Chapters } from 'type';

const { getComics, getComicsInfo, getChapters } = Comics();
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
            pageData?.map(async (comic) => {
                const exitsComic = await getDocumentId(
                    'comic_by_name',
                    comic.name,
                );

                if (!exitsComic) {
                    const res = await saveDocument('comics', comic);
                    if (res) {
                        console.log(`save ${comic.name} successfull!`);
                    } else {
                        console.log(`save ${comic.name} failed!`);
                        await logEvents(
                            'faunadb',
                            `save ${comic.name} failed!`,
                        );
                    }
                }
            }),
        );
}

export async function saveDescriptionComics() {
    try {
        let data = await paginate(10);

        //@ts-ignore
        while (data.after[0]) {
            //@ts-ignore
            data = await paginate(10, data.after);

            //@ts-ignore
            await Promise.allSettled(
                //@ts-ignore
                data.data.map(async (e) => {
                    const info = await getComicsInfo(e.data.name);

                    if (info) {
                        const exitsDesc = await getDocumentId(
                            'desc_by_name',
                            e.data.name,
                        );

                        if (!exitsDesc) {
                            await saveDocument('descriptions', {
                                ...info,
                                name: e.data.name,
                                slug: e.data.slug,
                            });
                        }
                    }
                }),
            );
        }
    } catch (err) {
        console.log(err);
    }
}

export async function saveChapters() {
    try {
        let data = await paginate(10);

        //@ts-ignore
        while (data.after[0]) {
            //@ts-ignore
            data = await paginate(10, data.after);

            //@ts-ignore
            await Promise.allSettled(
                //@ts-ignore
                data.data.map(async (e) => {
                    const comic = e.data;

                    const chapters: Comic_Chapters = {
                        comicId: e.ref.id,
                        chapters_list: [],
                        comicName: comic.name,
                        comicSlug: comic.slug,
                        source: 'NTC',
                    };

                    //make sure not duplicate document:
                    const exitsDesc = await getDocumentId(
                        'chapters_by_slug',
                        comic.slug,
                    );
                    if (exitsDesc) return;

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

                    await saveDocument('chapters', chapters);

                    console.log(`save ${chapters.comicName} successfully!`);
                }),
            );
        }
    } catch (err) {
        console.log(err);
    }
}
