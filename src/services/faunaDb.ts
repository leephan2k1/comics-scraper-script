import { faunaClient, faunaQuery as q } from '../config';
import logEvents from '../utils/logEvents';

export default function faunaDb() {
    return {
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

        saveDocument: async (collection: string, doc: object) => {
            try {
                const data = await faunaClient.query(
                    q.Create(q.Collection(collection), {
                        data: {
                            ...doc,
                            createdAt: Date.now(),
                        },
                    }),
                );

                return data;
            } catch (err) {
                logEvents('faunadb', `save ${doc} error`);
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
                        q.Function('upsert'),
                        q.Ref(q.Collection(collection), docId),
                        collection,
                        {
                            data: {
                                ...doc,
                                createdAt: Date.now(),
                            },
                        },
                    ),
                );

                return data;
            } catch (err) {
                logEvents('faunadb', String(err));
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

        paginate: async (limit: number, after?: any) => {
            try {
                const data = await faunaClient.query(
                    q.Map(
                        q.Paginate(q.Match(q.Index('all_comics')), {
                            size: limit,
                            after,
                        }),
                        q.Lambda('X', q.Get(q.Var('X'))),
                    ),
                );

                return data;
            } catch (err) {
                return null;
            }
        },
    };
}
