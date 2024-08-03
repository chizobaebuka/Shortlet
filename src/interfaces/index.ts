// interfaces/countryInterface.ts

export interface IName {
    common: string;
    official: string;
    nativeName: {
        [key: string]: {
            official: string;
            common: string;
        };
    };
}

export interface IDemonym {
    [key: string]: {
        f: string;
        m: string;
    };
}

export interface ICurrency {
    [key: string]: {
        name: string;
        symbol: string;
    };
}

export interface ILanguages {
    [key: string]: string;
}

export interface ITranslations {
    [key: string]: {
        official: string;
        common: string;
    };
}

export interface IRegionalBloc {
    [key: string]: {
        acronym: string;
        name: string;
        otherAcronyms: string[];
        otherNames: string[];
    };
}

export interface IMaps {
    googleMaps: string;
    openStreetMaps: string;
}

export interface ICar {
    signs: string[];
    side: string;
}

export interface IFlags {
    png: string;
    svg: string;
}

export interface ICountry {
    id: number;
    name: IName;
    topLevelDomain: string[];
    alpha2Code: string;
    alpha3Code: string;
    callingCodes: string[];
    capital: string[];
    altSpellings: string[];
    region: string;
    subregion: string;
    population: number;
    latlng: number[];
    demonym?: IDemonym;
    area?: number;
    gini?: number;
    timezones?: string[];
    borders?: string[];
    nativeName?: { [key: string]: { official: string; common: string } };
    numericCode?: string;
    currencies?: ICurrency;
    languages?: ILanguages;
    translations?: ITranslations;
    flag?: string;
    regionalBlocs?: IRegionalBloc;
    cioc?: string;
    maps?: IMaps;
    coatOfArms?: object; // Define more specifically if you know the structure
    startOfWeek?: string;
    capitalInfo?: { latlng: number[] };
    continents?: string[];
    car?: ICar;
    flags?: IFlags;
}

export interface FetchCountriesResult {
    data: any[];
    totalCount: number;
    totalNumberOfPages: number;
    currentPage: number;
    nextPage: number | null;
    itemsPerPage: number;
}

export interface IQuery {
    page?: number;
    limit?: number;
    fields?: string;
    region?: string;
    population?: number;
}

export interface IRegionData {
    region: string;
    countries: ICountry[];
    totalPopulation: number;
}

export interface ILanguageData {
    language: string;
    countries: string[];
    totalSpeakers: number;
}

export interface IStatistics {
    totalCountries: number;
    largestCountryByArea: { name: string; area: number } | null;
    smallestCountryByPopulation: { name: string; population: number } | null;
    mostWidelySpokenLanguage: { language: string; totalSpeakers: number } | null;
}
