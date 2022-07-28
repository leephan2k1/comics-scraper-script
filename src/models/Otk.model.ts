import Scraper from '../libs/Scraper';
import { parse } from 'node-html-parser';
import { AxiosRequestConfig } from 'axios';
import { normalizeString, isExactMatch } from '../utils/stringHandler';

export default class OTKModel extends Scraper {
    private static instance: OTKModel;

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

    public async search(q: string) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/Home/Search`,
                {
                    params: {
                        search: q.trim().toLowerCase(),
                    },
                },
            );

            const document = parse(data);

            const containers = document.querySelectorAll(
                '.collection-body .col-lg-1-5.col-md-2.col-sm-3.col-xs-4.col-xs-4-5',
            );

            const exactMatchs = containers.map((e) => {
                const title = e.querySelector(
                    '.text-overflow.capitalize',
                )?.textContent;

                if (
                    title?.trim().toLocaleLowerCase() ===
                    q.trim().toLocaleLowerCase()
                ) {
                    return {
                        title: normalizeString(title),
                        slug: e.querySelector('a')?.getAttribute('href'),
                    };
                }
            });

            return exactMatchs;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
