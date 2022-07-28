import Comics from '../models';
import faunaDb from '../services/faunaDb';
import logEvents from '../utils/logEvents';

const { getComics } = Comics();
const { getDocumentId, saveDocument } = faunaDb();

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
                        await logEvents(`save ${comic.name} failed!`);
                    }
                }
            }),
        );
}
