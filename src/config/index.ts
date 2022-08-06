import dotenv from 'dotenv';
import faunadb from 'faunadb';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const faunaKey = process.env.FAUNADB_SECRET_KEY as string;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY as string;
const cloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY as string;

export const PORT = process.env.PORT || 5002;

export const faunaClient = new faunadb.Client({
    secret: faunaKey,
    domain: 'db.fauna.com',
});

cloudinary.config({
    cloud_name: 'lee1002',
    api_key: cloudinaryApiKey,
    api_secret: cloudinarySecretKey,
    secure: true,
});

export const cloudinaryClient = cloudinary;

export const faunaQuery = faunadb.query;
