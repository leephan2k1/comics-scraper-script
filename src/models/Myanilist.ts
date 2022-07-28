import Scraper from '../libs/Scraper';
import { AxiosRequestConfig } from 'axios';
import { isExactMatch } from '../utils/stringHandler';
import { MyAniSearch } from '../type';
import axios from 'axios';

export default class BtModal extends Scraper {
    private static instance: BtModal;

    private constructor(
        baseUrl: string,
        axiosConfig?: AxiosRequestConfig,
        timeout?: number,
    ) {
        super(baseUrl, axiosConfig, timeout);
    }

    public static Instance(
        baseUrl: string,
        axiosConfig?: AxiosRequestConfig,
        timeout?: number,
    ) {
        if (!this.instance) {
            this.instance = new this(baseUrl, axiosConfig, timeout);
        }

        return this.instance;
    }

    public async search(q: string): Promise<MyAniSearch | null> {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/search/prefix.json`,
                {
                    params: {
                        type: 'manga',
                        keyword: q.trim().toLowerCase(),
                    },
                },
            );

            let exactMatch = null;
            //@ts-ignore
            data.categories[0].items.forEach((e) => {
                console.log(e.name);
                if (
                    isExactMatch(
                        q.trim().toLowerCase(),
                        e.name.trim().toLowerCase(),
                    )
                ) {
                    exactMatch = e;
                    return;
                }
            });

            return exactMatch;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async getInfo(id: string) {
        try {
            const { data: dataFull } = await axios.get(
                `https://api.jikan.moe/v4/manga/${id}/full`,
            );

            const { data: dataCharacters } = await axios.get(
                `https://api.jikan.moe/v4/manga/${id}/characters`,
            );

            const { data: dataRecommendations } = await axios.get(
                `https://api.jikan.moe/v4/manga/${id}/recommendations`,
            );

            return {
                mal_id: dataFull.data?.mal_id,
                mal_url: dataFull.data?.url,
                images: dataFull.data?.images,
                title: dataFull.data?.title,
                title_japanese: dataFull.data?.title_japanese,
                published: dataFull.data?.published?.string,
                score: dataFull.data?.score,
                rank: dataFull.data?.rank,
                authors: dataFull.data?.authors,
                genres: dataFull.data?.genres,
                characters: dataCharacters.data,
                recommendations: dataRecommendations.data,
            };
        } catch (err) {
            console.error(err);
        }
    }
}
