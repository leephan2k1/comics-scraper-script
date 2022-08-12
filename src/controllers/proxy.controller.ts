import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

function proxyController() {
    const corsAnywhere = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { src, url } = req.query;

            const options = {
                responseType: 'stream',
                headers: {
                    referer: String(url),
                    origin: String(url),
                },
            } as const;

            const response = await axios.get(String(src), options);

            return response.data.pipe(res);
        } catch (err) {
            console.log(err);
        }
    };

    return { corsAnywhere };
}

export default proxyController;
