import dotenv from 'dotenv';
import faunadb from 'faunadb';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const faunaKey = process.env.FAUNADB_SECRET_KEY as string;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY as string;
const cloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY as string;
const mongodbRemoteURI = String(process.env.MONGODB_URI);

export const PORT = process.env.PORT || 5002;

export const faunaClient = new faunadb.Client({
    secret: faunaKey,
    domain: 'db.fauna.com',
});

export const mongoDbLocalClient = mongoose.createConnection(
    `mongodb://127.0.0.1:27017/kyoto-manga-data`,
);

export const mongoDbRemoteClient = mongoose.createConnection(mongodbRemoteURI, {
    dbName: 'kyoto-manga-db',
});

cloudinary.config({
    cloud_name: 'dsoxko2mu',
    api_key: cloudinaryApiKey,
    api_secret: cloudinarySecretKey,
    secure: true,
});

export const cloudinaryClient = cloudinary;

export const faunaQuery = faunadb.query;
