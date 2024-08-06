import axios from 'axios';
import dotenv from 'dotenv';
import { FetchCountriesResult, ICountry, ILanguageData, IQuery, IRegionData, IStatistics } from '../interfaces';
import Country from '../db/models/country';
import redisClient from '../db/redisClient';
import { FindOptions } from 'sequelize';
import logger from '../utils/logger';

dotenv.config();

const API_URL = process.env.API_URL 

const getAllCountries = async () => {
  try {
    let url = `${API_URL}/all`
    const response = await axios.get(url);
    const data = response.data;
    return data
  } catch (err: any) {
    console.error('Error getting all countries from REST Countries API:', err.message);
    throw new Error('Error getting all countries from REST Countries API:');
  }
}

const migrateCountriesData = async () => {
  try {
    // Fetch all countries
    const response = await getAllCountries();
    const countries = response ? response : undefined; 

    // Ensure countries is an array
    if (!Array.isArray(countries)) {
      throw new Error('Fetched data is not an array');
    }

    // Prepare data for bulk insertion
    const countryData = countries.map((country: any) => ({
      name: country.name ? country.name.common || null : null,
      topLevelDomain: country.tld || [],
      alpha2Code: country.cca2 || '',
      alpha3Code: country.cca3 || '',
      callingCodes: country.idd ? country.idd.suffixes || [] : [],
      capital: country.capital || [],
      altSpellings: country.altSpellings || [],
      region: country.region || '',
      subregion: country.subregion || null,
      population: country.population || 0,
      latlng: country.latlng || [],
      demonym: country.demonyms ? Object.values(country.demonyms)[0] || null : null,
      area: country.area || null,
      gini: country.gini || null,
      timezones: country.timezones || [],
      borders: country.borders || [],
      nativeName: country.name ? country.name.nativeName ? Object.values(country.name.nativeName)[0] || null : null : null,
      numericCode: country.ccn3 || null,
      currencies: country.currencies ? Object.values(country.currencies)[0] || null : null,
      languages: country.languages ? Object.values(country.languages)[0] || null : null,
      translations: country.translations ? Object.values(country.translations)[0] || null : null,
      flag: country.flag || '',
      regionalBlocs: country.regionalBlocs || null,
      cioc: country.cioc || null,
      maps: country.maps || null,
      coatOfArms: country.coatOfArms || null,
      startOfWeek: country.startOfWeek || null,
      capitalInfo: country.capitalInfo || null,
      continents: country.continents || [],
      car: country.car || null,
      flags: country.flags || null,
    }));

    // Perform bulk insert
    await Country.bulkCreate(countryData, {
      updateOnDuplicate: [
        'name', 'topLevelDomain', 'alpha2Code', 'alpha3Code', 'callingCodes',
        'capital', 'altSpellings', 'region', 'subregion', 'population',
        'latlng', 'demonym', 'area', 'gini', 'timezones', 'borders',
        'nativeName', 'numericCode', 'currencies', 'languages', 'translations',
        'flag', 'regionalBlocs', 'cioc', 'maps', 'coatOfArms', 'startOfWeek',
        'capitalInfo', 'continents', 'car', 'flags'
      ]
    });

    console.log('Data migration completed.');
  } catch (err: any) {
    console.error('Error migrating countries data:', err.message);
  }
};

const fetchAllCountries = async ({
  page = 1,
  limit = 10,
  fields,
  region,
  population,
}: IQuery): Promise<FetchCountriesResult> => {
  try {
    const cacheKey = `countries:${page}:${limit}:${fields || ''}:${region || ''}:${population || ''}`;
    
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning data from cache');
      return JSON.parse(cachedData);
    }
    
    // Calculate the range for pagination
    const start = (page - 1) * limit;
    const end = start + limit;

    // Construct the URL with query parameters
    let url = `${API_URL}/all`;
    const queryParams: string[] = [];

    if (fields) {
      queryParams.push(`fields=${fields}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    // Fetch the data from the API
    const response = await axios.get(url);
    const data = response.data;

    // Apply filters if provided
    let filteredData = data;

    if (region) {
      filteredData = filteredData.filter((country: any) => country.region === region);
    }

    if (population) {
      filteredData = filteredData.filter((country: any) => country.population === population);
    }

    // Calculate total number of pages
    const totalCount = filteredData.length;
    const totalNumberOfPages = Math.ceil(totalCount / limit);

    // Paginate the filtered data
    const paginatedData = filteredData.slice(start, end);

    // Determine the next page
    const nextPage = page < totalNumberOfPages ? page + 1 : null;

    // Return the paginated data and pagination info
    const result = {
      totalCount,
      totalNumberOfPages,
      currentPage: page,
      nextPage,
      itemsPerPage: limit, 
      data: paginatedData,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache for 1 hour
    
    return result;
  } catch (error: any) {
    console.error('Error fetching data from REST Countries API:', error.message);
    throw new Error('Error fetching data from REST Countries API');
  }
};

const fetchCountryDetails = async (code: string): Promise<any> => {
  try {
    const cacheKey = `country:${code}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      logger.info('Returning country details from cache');
      return JSON.parse(cachedData);
    }

    const url = `${API_URL}/alpha/:${code}`;
    console.log({ url })

    // Fetch data from the REST Countries API
    const response = await axios.get(url);
    const data = response.data;

    await redisClient.set(cacheKey, JSON.stringify(data), { EX: 3600 }); // Cache for 1 hour

    return data;
  } catch (error: any) {
    console.error('Error fetching country details from REST Countries API:', error.message);
    throw new Error('Error fetching country details from REST Countries API');
  }
};

const getRegions = async ({ page, limit }: { page?:number, limit?: number }): Promise<IRegionData[]> => {
  try {
    const cacheKey = `regions:${page}:${limit}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Returning region data from cache');
      return JSON.parse(cachedData);
    }

    const { data: countries } = await fetchAllCountries({ page: page, limit: limit });

    // Initialize a map to hold region data
    const regionMap: { [region: string]: IRegionData } = {};

    countries.forEach((country: ICountry) => {
      const { region, population } = country;

      if (!regionMap[region]) {
        regionMap[region] = {
          region,
          countries: [],
          totalPopulation: 0,
        };
      }

      regionMap[region].countries.push(country);
      regionMap[region].totalPopulation += population;
    });

    const result = Object.values(regionMap);

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache for 1 hour

    return result;
  } catch (error: any) {
    console.error('Error fetching and processing countries data:', error.message);
    throw new Error('Error fetching and processing countries data');
  }
};

const getLanguagesData = async ({ page, limit }: { page?: number, limit?: number }): Promise<ILanguageData[]> => {
  try {
    const cacheKey = `languages:${page}:${limit}`;
    logger.info('Cache key generated', { cacheKey });

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      logger.info('Returning data from cache', { cacheKey });
      return JSON.parse(cachedData);
    }

    const { data: countries } = await fetchAllCountries({ page, limit });

    const languageMap: { [language: string]: ILanguageData } = {};

    countries.forEach((country: any) => {
      if (country.languages) {
        const countriesList = Object.keys(country.languages);
        countriesList.forEach((language) => {
          if (!languageMap[language]) {
            languageMap[language] = {
              language,
              countries: [],
              totalSpeakers: 0,
            };
          }
          languageMap[language].countries.push(country.name);
          languageMap[language].totalSpeakers += country.population;
        });
      }
    });

    const result = Object.values(languageMap);

    // Optional: Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache for 1 hour

    return result;
  } catch (error: any) {
    logger.error('Error processing language data', { error: error.message });
    throw new Error('Error processing language data');
  }
};

const getStatistics = async ({ page, limit }: { page?: number; limit?: number }): Promise<IStatistics> => {
  try {
    const cacheKey = `statistics:${page}:${limit}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Returning statistics data from cache');
      return JSON.parse(cachedData);
    }

    const { data: countries } = await fetchAllCountries({ page, limit });

    // Initialize statistics
    const statistics: IStatistics = {
      totalCountries: countries.length,
      largestCountryByArea: null,
      smallestCountryByPopulation: null,
      mostWidelySpokenLanguage: null,
    };

    // Variables to keep track of statistics
    let largestArea = 0;
    let smallestPopulation = Infinity;
    const languageMap: { [language: string]: number } = {};

    // Process each country
    for (const country of countries) {
      // Update largest country by area
      if (country.area && country.area > largestArea) {
        largestArea = country.area;
        statistics.largestCountryByArea = { name: country.name, area: country.area };
      }

      // Update smallest country by population
      if (country.population < smallestPopulation) {
        smallestPopulation = country.population;
        statistics.smallestCountryByPopulation = { name: country.name, population: country.population };
      }

      // Update language statistics
      if (country.languages) {
        for (const language of Object.keys(country.languages)) {
          languageMap[language] = (languageMap[language] || 0) + country.population;
        }
      }
    }

    // Find the most widely spoken language
    const mostWidelySpokenLanguage = Object.entries(languageMap).reduce(
      (max, [language, totalSpeakers]) => (totalSpeakers > max.totalSpeakers ? { language, totalSpeakers } : max),
      { language: '', totalSpeakers: 0 }
    );

    statistics.mostWidelySpokenLanguage = mostWidelySpokenLanguage.totalSpeakers > 0 ? mostWidelySpokenLanguage : null;

    await redisClient.set(cacheKey, JSON.stringify(statistics), { EX: 3600 }); 

    console.log('Statistics data has been cached');
    return statistics;
  } catch (error: any) {
    console.error('Error processing statistics data:', error.message);
    throw new Error('Error processing statistics data');
  }
};

export default { fetchAllCountries, fetchCountryDetails, getRegions, getLanguagesData, getStatistics, migrateCountriesData };
