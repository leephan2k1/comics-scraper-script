import { faunaClient, faunaQuery as q } from '../config';
import logEvents from '../utils/logEvents';

export default function faunaDb() {
    return {
        saveDocument: async (collection: string, doc: object) => {
            try {
                const data = await faunaClient.query(
                    q.Create(q.Collection(collection), {
                        data: {
                            ...doc,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        },
                    }),
                );

                return data;
            } catch (err) {
                return null;
            }
        },

        upsertDocument: async (
            collection: string,
            docId: string,
            doc: object,
        ) => {
            try {
                const data = await faunaClient.query(
                    q.Call(
                        Function('upsert'),
                        //@ts-ignore
                        q.Ref(q.Collection(collection), docId),
                        {
                            data: {
                                ...doc,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                            },
                        },
                    ),
                );

                return data;
            } catch (err) {
                logEvents(String(err));
            }
        },

        getDocument: async (index: string, searchTerms: string) => {
            try {
                const data = await faunaClient.query(
                    q.Get(q.Match(q.Index(index), searchTerms)),
                );

                return data;
            } catch (err) {
                return null;
            }
        },

        paginate: async (limit: number) => {
            try {
                const data = await faunaClient.query(
                    q.Map(
                        q.Paginate(q.Match(q.Index('all_comics')), {
                            size: 50,
                        }),
                        q.Lambda('X', q.Get(q.Var('X'))),
                    ),
                );

                return data;
            } catch (err) {
                return null;
            }
        },

        getDocumentId: async (index: string, searchTerms: string) => {
            try {
                const objId = await faunaClient.query(
                    q.Let(
                        {
                            doc: q.Get(q.Match(q.Index(index), searchTerms)),
                        },
                        {
                            id: q.Select(['ref', 'id'], q.Var('doc')),
                        },
                    ),
                );
                //@ts-ignore
                return objId.id;
            } catch (err) {
                return null;
            }
        },
    };
}
