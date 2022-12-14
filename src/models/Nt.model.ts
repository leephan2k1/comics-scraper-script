import { AxiosRequestConfig } from 'axios';
import { parse } from 'node-html-parser';
import Scraper from '../libs/Scraper';
import { normalizeString } from '../utils/stringHandler';
import { NtDataList } from '../type';

export default class NtModel extends Scraper {
    private static instance: NtModel;

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

    private parseSource(document: HTMLElement): NtDataList {
        const mangaList = document.querySelectorAll(
            '#aspnetForm > main > div:nth-child(2) > div.row .item',
        );

        const mangaData = [...mangaList].map((manga) => {
            const thumbnail = this.unshiftProtocol(
                String(
                    manga.querySelector('img')?.getAttribute('data-original'),
                ) || String(manga.querySelector('img')?.getAttribute('src')),
            );

            const newChapter = manga.querySelector('ul > li > a')?.innerHTML;
            const updatedAt = manga.querySelector('ul > li > i')?.innerHTML;
            const view = manga.querySelector('pull-left > i')?.innerHTML;
            const name = normalizeString(
                String(manga.querySelector('h3 a')?.innerHTML),
            );

            const tooltip = manga.querySelectorAll('.box_li .message_main p');
            let status: string | null = '';
            let author: string | null = '';
            let genres: string[] | null = [''];
            let otherName: string | null = '';
            tooltip.forEach((item) => {
                const title = item.querySelector('label')?.textContent;
                const str = normalizeString(
                    String(item.textContent).substring(
                        String(item.textContent).lastIndexOf(':') + 1,
                    ),
                );

                switch (title) {
                    case 'Th??? lo???i:':
                        genres = str.split(', ');
                        break;
                    case 'T??c gi???:':
                        author = str;
                        break;
                    case 'T??nh tr???ng:':
                        status = str;
                        break;
                    case 'T??n kh??c:':
                        otherName = str;
                        break;
                }
            });

            const review = normalizeString(
                String(manga.querySelector('.box_li .box_text')?.textContent),
            );

            const path = String(
                manga.querySelector('h3 a')?.getAttribute('href'),
            );
            const slug = path.substring(path.lastIndexOf('/') + 1);

            return {
                status,
                author,
                genres,
                otherName,
                review,
                newChapter,
                thumbnail,
                view,
                name,
                updatedAt,
                slug,
            };
        });

        const totalPagesPath = String(
            document.querySelector('.pagination > li')?.innerHTML,
        ).trim();
        const totalPages =
            Number(
                totalPagesPath
                    .substring(totalPagesPath.lastIndexOf('/') + 1)
                    .trim(),
            ) || 1;

        return { mangaData, totalPages };
    }

    public async getTotalPages() {
        try {
            const { data } = await this.client.get(`${this.baseUrl}`);
            const document = parse(data);

            const href = document
                .querySelector(
                    '#ctl00_mainContent_ctl00_divPager > ul > li:nth-child(14) > a',
                )
                ?.getAttribute('href');

            const totalPages = href && href.slice(href.indexOf('=') + 1);

            return totalPages;
        } catch (err) {
            console.error('getTotalPages: ', err);
            return null;
        }
    }

    public async scrapePage(page: number) {
        try {
            const { data } = await this.client.get(
                `${this.baseUrl}/?page=${page}`,
            );

            const document = parse(data);

            //@ts-ignore
            return document && this.parseSource(document);
        } catch (err) {
            console.log(err);
        }
    }
}
