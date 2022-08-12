export interface NTMangaPreview {
    newChapter: string | undefined;
    thumbnail: string | null | undefined;
    view: string | undefined;
    name: string;
    updatedAt: string | undefined;
    slug: string;
    status: string | null;
    author: string | null;
    genres: string[] | null;
    otherName?: string | null;
    review: string | null;
    sourcesAvailable?: Source[];
}

export type Source_Type = 'OTK' | 'LHM' | 'T24' | 'NTC';

export interface Comic_Chapters {
    comicSlug: string;
    comicName: string;
    source: string;
    chapters_list: {
        sourceName: string;
        chapters: Chapter[];
    }[];
}

export interface Chapter_Pages {
    chapterSlug: string;
    pages: Page_Image[];
    comicSlug: string;
    comicName: string;
    source: string;
}

export interface Page_Image {
    id: string;
    src: string;
    fallbackSrc?: string;
}

export interface Chapter {
    chapterId: string;
    chapterSlug: string;
    chapterNumber: string;
    chapterTitle: string;
    updatedAt: string;
    view: string;
}

export interface Genres_NT {
    id: string;
    value: string;
    label: string;
}

export interface Source {
    sourceName: string;
    sourceSlug: string;
}

export interface NtDataList {
    mangaData: MangaPreview[];
    totalPages: number;
}

export interface LHSearch {
    id: number;
    name: string;
    cover_url: string;
    pilot: string;
    url: string;
}

export interface BTSearch {
    title: string;
    slug: string;
    id: string;
}

export interface MyAniSearch {
    id: string;
    type: string;
    name: string;
    url: string;
    image_url: string;
    thumbnail_url: string;
    payload: PayloadMyAni;
    es_score: number;
}

export interface PayloadMyAni {
    media_type: string;
    start_year: number;
    published: string;
    score: string;
    status: string;
}

export interface Myanimelist {
    mal_id: number;
    mal_url: string;
    images: { [key: string]: Image };
    title: string;
    title_japanese: string;
    published: string;
    score: number;
    rank: number;
    authors: Author[];
    genres: Author[];
    characters: Character[];
    recommendations: Recommendation[];
}

export interface Author {
    mal_id: number;
    type?: string;
    name: string;
    url: string;
    images?: Images;
}

export interface Images {
    jpg: Jpg;
    webp: Webp;
}

export interface Jpg {
    image_url: string;
}

export interface Webp {
    image_url: string;
    small_image_url: string;
}

export interface Character {
    character: Author;
    role: Role;
}

export enum Role {
    Main = 'Main',
    Supporting = 'Supporting',
}

export interface Image {
    image_url: string;
    small_image_url?: string;
    large_image_url?: string;
}

export interface Recommendation {
    entry: Entry;
    url: string;
    votes: number;
}

export interface Entry {
    mal_id: number;
    url: string;
    images: { [key: string]: Image };
    title: string;
}
