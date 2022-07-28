import Scraper from '../libs/Scraper';
import { AxiosRequestConfig } from 'axios';
import { isExactMatch } from '../utils/stringHandler';
import { MyAniSearch } from '../type';
import logEvents from '../utils/logEvents';
import puppeteer from 'puppeteer';
import { normalizeString } from '../utils/stringHandler';

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

            if (!exactMatch) {
                logEvents('comics', `${q} search failed`);
            }

            return exactMatch;
        } catch (err) {
            logEvents('comics', `${q} search failed`);
            return null;
        }
    }

    public async getInfo(mal_id: string) {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://myanimelist.net/manga/${mal_id}`);

            const image = await page.$eval(
                '#content > table > tbody > tr > td.borderClass > div > div:nth-child(1) > a > img',
                (dom) => {
                    return dom.getAttribute('data-src');
                },
            );

            const score = await page.$eval(
                '#content > table > tbody > tr > td:nth-child(2) > div.rightside.js-scrollfix-bottom-rel > table > tbody > tr:nth-child(1) > td > div.pb24 > div.di-t.w100.mt12 > div > div.stats-block.po-r.clearfix > div.fl-l.score > div',
                (dom) => {
                    return dom.textContent?.trim();
                },
            );

            const published = await page.$eval('.leftside', (dom) => {
                const titleContainer = dom.querySelectorAll('.spaceit_pad');

                let published = '';

                titleContainer.forEach((e) => {
                    const typeDom = e.querySelector('.dark_text');
                    if (typeDom) {
                        //@ts-ignore
                        const type = typeDom?.textContent.trim();

                        switch (type) {
                            case 'Published:':
                                //@ts-ignore
                                published = e.textContent.slice(11).trim();
                                break;
                        }
                    }
                });

                return published;
            });

            const titles = await page.$eval('.leftside', (dom) => {
                const titleContainer = dom.querySelectorAll('.spaceit_pad');

                let title_synonyms = '';
                let title_japanese = '';
                let title_english = '';

                titleContainer.forEach((e) => {
                    const typeDom = e.querySelector('.dark_text');
                    if (typeDom) {
                        //@ts-ignore
                        const type = typeDom?.textContent.trim();

                        switch (type) {
                            case 'Synonyms:':
                                //@ts-ignore
                                title_synonyms = e.textContent.trim().slice(10);

                                break;
                            case 'Japanese:':
                                //@ts-ignore
                                title_japanese = e.textContent.trim().slice(10);

                                break;
                            case 'English:':
                                //@ts-ignore
                                title_english = e.textContent.trim().slice(9);

                                break;
                        }
                    }
                });

                return {
                    title_synonyms,
                    title_japanese,
                    title_english,
                };
            });

            let description: string | undefined = '';

            //avoid missing desc
            try {
                description = await page.$eval(
                    '#content > table > tbody > tr > td:nth-child(2) > div.rightside.js-scrollfix-bottom-rel > table > tbody > tr:nth-child(1) > td > span',
                    (dom) => {
                        return dom.textContent?.trim();
                    },
                );
            } catch (err) {}

            const popularity = await page.$eval(
                '#content > table > tbody > tr > td:nth-child(2) > div.rightside.js-scrollfix-bottom-rel > table > tbody > tr:nth-child(1) > td > div.pb24 > div.di-t.w100.mt12 > div > div.stats-block.po-r.clearfix > div.po-a.di-ib.ml12.pl20.pt8 > span.numbers.popularity > strong',
                (dom) => {
                    return dom.textContent?.trim();
                },
            );

            const ranked = await page.$eval(
                '#content > table > tbody > tr > td:nth-child(2) > div.rightside.js-scrollfix-bottom-rel > table > tbody > tr:nth-child(1) > td > div.pb24 > div.di-t.w100.mt12 > div > div.stats-block.po-r.clearfix > div.po-a.di-ib.ml12.pl20.pt8 > span.numbers.ranked > strong',
                (dom) => dom.textContent?.trim(),
            );

            const charactersLink = await page.$eval(
                '#horiznav_nav > ul > li:nth-child(2) > a',
                (dom) => dom.getAttribute('href'),
            );
            const charaterPage = await browser.newPage();
            await charaterPage.goto(`${this.baseUrl}${charactersLink}`);

            let characters: {
                cover: string | null | undefined;
                mal_url: string | null | undefined;
                name: string | undefined;
                role: string | undefined;
            }[] = [];

            //avoid missing characters
            try {
                characters = await charaterPage.$eval(
                    '#manga-character-container',
                    (dom) => {
                        const characterContainer =
                            dom.querySelectorAll('table');

                        return [...characterContainer].map((e) => {
                            const cover = e
                                .querySelector('.picSurround img')
                                ?.getAttribute('data-src');

                            const mal_url = e
                                .querySelector('.picSurround a')
                                ?.getAttribute('href');

                            const name = e
                                .querySelector('h3')
                                ?.textContent?.trim();

                            const role = e
                                .querySelector(
                                    'tbody > tr > td:nth-child(2) .spaceit_pad small',
                                )
                                ?.textContent?.trim();

                            return {
                                cover,
                                mal_url,
                                name,
                                role,
                            };
                        });
                    },
                );
            } catch (err) {}

            const recommendations = await page.$eval(
                '.anime-slide.js-anime-slide',
                (dom) => {
                    const rcmContainer = dom.querySelectorAll('.btn-anime');

                    return [...rcmContainer].map((e) => {
                        const title = e
                            .querySelector('.title.fs10')
                            ?.textContent?.trim();

                        const cover = e
                            .querySelector('.link.bg-center.ga-click img')
                            ?.getAttribute('data-src');

                        const coverFallback = e
                            .querySelector('.link.bg-center.ga-click img')
                            ?.getAttribute('src');

                        const url = e
                            .querySelector('.link.bg-center.ga-click')
                            ?.getAttribute('href');

                        return {
                            title,
                            cover,
                            coverFallback,
                            url,
                        };
                    });
                },
            );

            const picturesLink = await page.$eval(
                '#horiznav_nav > ul > li:nth-child(10) > a',
                (dom) => dom.getAttribute('href'),
            );
            const picPage = await browser.newPage();
            await picPage.goto(`${this.baseUrl}${picturesLink}`);

            const pictures = await picPage.$$eval('.picSurround', (dom) => {
                return dom.map((e) => {
                    return {
                        large: e.querySelector('a')?.getAttribute('href'),
                        small: e
                            .querySelector('a img')
                            ?.getAttribute('data-src'),
                    };
                });
            });

            await browser.close();
            return {
                cover: image,
                score,
                titles,
                description: normalizeString(String(description)),
                published,
                ranked,
                popularity,
                characters,
                recommendations,
                pictures,
            };
        } catch (err) {
            console.log(err);
            logEvents('comic_desc', `${mal_id} --- ${err}`);
        }
    }
}

// public async getInfo(id: string) {
//     try {
//         //rate limit: https://jikan.docs.apiary.io/#introduction/information/bulk-requests
//         await sleep(4000);

//         const { data: dataFull } = await axios.get(
//             `https://api.jikan.moe/v4/manga/${id}/full`,
//         );

//         await sleep(4000);

//         const { data: dataCharacters } = await axios.get(
//             `https://api.jikan.moe/v4/manga/${id}/characters`,
//         );

//         await sleep(4000);

//         const { data: dataRecommendations } = await axios.get(
//             `https://api.jikan.moe/v4/manga/${id}/recommendations`,
//         );

//         return {
//             mal_id: dataFull.data?.mal_id,
//             mal_url: dataFull.data?.url,
//             images: dataFull.data?.images,
//             title: dataFull.data?.title,
//             title_japanese: dataFull.data?.title_japanese,
//             published: dataFull.data?.published?.string,
//             score: dataFull.data?.score,
//             rank: dataFull.data?.rank,
//             authors: dataFull.data?.authors,
//             genres: dataFull.data?.genres,
//             characters: dataCharacters.data,
//             recommendations: dataRecommendations.data,
//         };
//     } catch (err) {
//         console.error(err);
//         return null;
//     }
// }
