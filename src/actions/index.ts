import Comics from '../models';
import faunaDb from '../services/faunaDb';
import logEvents from '../utils/logEvents';

const { getComics, getComicsInfo } = Comics();
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
        // let count = 0;
        let data = await paginate(50);

        //@ts-ignore
        while (data.after[0]) {
            //@ts-ignore
            data = await paginate(50, data.after);

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
