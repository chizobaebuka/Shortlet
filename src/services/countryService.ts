import { Op, WhereOptions } from 'sequelize';
import Country from '../db/models/country';
import { getCache, setCache } from '../utils/cache';
import { FetchCountriesResult, ICountry, ILanguageData, IQuery, IRegionData, IStatistics } from '../interfaces';

const CACHE_TTL_SECONDS = 3600;

const ALLOWED_ATTRIBUTES = Object.keys(Country.getAttributes());

const buildAttributes = (fields?: string): string[] | undefined => {
  if (!fields) return undefined;
  const requested = fields.split(',').map((f) => f.trim()).filter(Boolean);
  const valid = requested.filter((f) => ALLOWED_ATTRIBUTES.includes(f));
  return valid.length > 0 ? valid : undefined;
};

const displayName = (name: any): string => (name && typeof name === 'object' ? name.common : name);

/**
 * All reads below hit Postgres directly (indexed, paginated queries), with
 * Redis as a cache-aside layer. The external REST Countries API is only
 * ever called by the migration job (see externalApiService).
 */
const fetchAllCountries = async ({
  page = 1,
  limit = 10,
  fields,
  region,
  population,
}: IQuery): Promise<FetchCountriesResult> => {
  const cacheKey = `countries:${page}:${limit}:${fields || ''}:${region || ''}:${population ?? ''}`;
  const cached = await getCache<FetchCountriesResult>(cacheKey);
  if (cached) return cached;

  const where: WhereOptions = {};
  if (region) where.region = region;
  if (population !== undefined) where.population = population;

  const offset = (page - 1) * limit;

  const { rows, count } = await Country.findAndCountAll({
    where,
    attributes: buildAttributes(fields),
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  const totalNumberOfPages = Math.ceil(count / limit);
  const nextPage = page < totalNumberOfPages ? page + 1 : null;

  const result: FetchCountriesResult = {
    totalCount: count,
    totalNumberOfPages,
    currentPage: page,
    nextPage,
    itemsPerPage: limit,
    data: rows,
  };

  await setCache(cacheKey, result, CACHE_TTL_SECONDS);
  return result;
};

const fetchCountryDetails = async (code: string): Promise<Country | null> => {
  const normalizedCode = code.toUpperCase();
  const cacheKey = `country:${normalizedCode}`;
  const cached = await getCache<Country>(cacheKey);
  if (cached) return cached;

  const country = await Country.findOne({
    where: {
      [Op.or]: [{ alpha2Code: normalizedCode }, { alpha3Code: normalizedCode }],
    },
  });

  if (!country) return null;

  await setCache(cacheKey, country, CACHE_TTL_SECONDS);
  return country;
};

const getRegions = async ({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<IRegionData[]> => {
  const cacheKey = `regions:${page}:${limit}`;
  const cached = await getCache<IRegionData[]>(cacheKey);
  if (cached) return cached;

  // Grouping is done over the whole table (not a page slice) so region
  // totals/membership are accurate; pagination applies to the resulting
  // (small) list of regions instead.
  const countries = await Country.findAll({
    attributes: ['id', 'name', 'alpha2Code', 'region', 'population', 'flag'],
    order: [['region', 'ASC']],
  });

  const regionMap: { [region: string]: IRegionData } = {};

  countries.forEach((row) => {
    const country = row.toJSON() as ICountry;
    const { region, population } = country;
    if (!region) return;

    if (!regionMap[region]) {
      regionMap[region] = { region, countries: [], totalPopulation: 0 };
    }

    regionMap[region].countries.push(country);
    regionMap[region].totalPopulation += population || 0;
  });

  const allRegions = Object.values(regionMap);
  const start = (page - 1) * limit;
  const result = allRegions.slice(start, start + limit);

  await setCache(cacheKey, result, CACHE_TTL_SECONDS);
  return result;
};

const getLanguagesData = async ({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<ILanguageData[]> => {
  const cacheKey = `languages:${page}:${limit}`;
  const cached = await getCache<ILanguageData[]>(cacheKey);
  if (cached) return cached;

  const countries = await Country.findAll({
    attributes: ['name', 'population', 'languages'],
  });

  const languageMap: { [language: string]: ILanguageData } = {};

  countries.forEach((row) => {
    const country = row.toJSON() as { name: any; population: number; languages: { [key: string]: string } | null };
    if (!country.languages) return;

    Object.keys(country.languages).forEach((language) => {
      if (!languageMap[language]) {
        languageMap[language] = { language, countries: [], totalSpeakers: 0 };
      }
      languageMap[language].countries.push(displayName(country.name));
      languageMap[language].totalSpeakers += country.population || 0;
    });
  });

  const allLanguages = Object.values(languageMap);
  const start = (page - 1) * limit;
  const result = allLanguages.slice(start, start + limit);

  await setCache(cacheKey, result, CACHE_TTL_SECONDS);
  return result;
};

const getStatistics = async (): Promise<IStatistics> => {
  const cacheKey = 'statistics';
  const cached = await getCache<IStatistics>(cacheKey);
  if (cached) return cached;

  // Statistics are inherently a global aggregate, so this always scans the
  // whole (small, indexed-elsewhere) table rather than a paginated slice.
  const countries = await Country.findAll({
    attributes: ['name', 'area', 'population', 'languages'],
  });

  const statistics: IStatistics = {
    totalCountries: countries.length,
    largestCountryByArea: null,
    smallestCountryByPopulation: null,
    mostWidelySpokenLanguage: null,
  };

  let largestArea = 0;
  let smallestPopulation = Infinity;
  const languageMap: { [language: string]: number } = {};

  countries.forEach((row) => {
    const country = row.toJSON() as { name: any; area: number | null; population: number; languages: { [key: string]: string } | null };
    const name = displayName(country.name);

    if (country.area && country.area > largestArea) {
      largestArea = country.area;
      statistics.largestCountryByArea = { name, area: country.area };
    }

    if (country.population < smallestPopulation) {
      smallestPopulation = country.population;
      statistics.smallestCountryByPopulation = { name, population: country.population };
    }

    if (country.languages) {
      Object.keys(country.languages).forEach((language) => {
        languageMap[language] = (languageMap[language] || 0) + (country.population || 0);
      });
    }
  });

  const mostWidelySpokenLanguage = Object.entries(languageMap).reduce(
    (max, [language, totalSpeakers]) => (totalSpeakers > max.totalSpeakers ? { language, totalSpeakers } : max),
    { language: '', totalSpeakers: 0 }
  );

  statistics.mostWidelySpokenLanguage = mostWidelySpokenLanguage.totalSpeakers > 0 ? mostWidelySpokenLanguage : null;

  await setCache(cacheKey, statistics, CACHE_TTL_SECONDS);
  return statistics;
};

export default { fetchAllCountries, fetchCountryDetails, getRegions, getLanguagesData, getStatistics };
