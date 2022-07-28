import Scraper from '../libs/Scraper';
import { AxiosRequestConfig } from 'axios';
import { parse } from 'node-html-parser';
import { normalizeString, isExactMatch } from '../utils/stringHandler';

export default class _24HModel extends Scraper {
    private static instance: _24HModel;

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
                `${this.baseUrl}/tim-kiem/${encodeURIComponent(q)}`,
            );

            const document = parse(data);

            const containers = document.querySelectorAll('.item-medium');

            const exactMatch = containers.map((e) => {
                const title = e.querySelector('.item-title')?.textContent;

                if (
                    isExactMatch(
                        String(title?.trim().toLowerCase()),
                        q.trim().toLocaleLowerCase(),
                    )
                ) {
                    return {
                        title,
                        slug: e.querySelector('a')?.getAttribute('href'),
                    };
                }
            });

            return exactMatch.length ? exactMatch[0] : null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
