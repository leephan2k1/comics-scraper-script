import dotenv from 'dotenv';
import faunadb from 'faunadb';

dotenv.config();

const faunaKey = process.env.FAUNADB_SECRET_KEY as string;

export const faunaClient = new faunadb.Client({
    secret: faunaKey,
    domain: 'db.fauna.com',
});

export const faunaQuery = faunadb.query;
