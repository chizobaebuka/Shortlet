import axios from 'axios';
import dotenv from 'dotenv';
import Country from '../db/models/country';
import logger from '../utils/logger';

dotenv.config();

const API_URL = process.env.API_URL;

const UPSERT_COLUMNS = [
  'name', 'topLevelDomain', 'alpha2Code', 'alpha3Code', 'callingCodes',
  'capital', 'altSpellings', 'region', 'subregion', 'population',
  'latlng', 'demonym', 'area', 'gini', 'timezones', 'borders',
  'nativeName', 'numericCode', 'currencies', 'languages', 'translations',
  'flag', 'regionalBlocs', 'cioc', 'maps', 'coatOfArms', 'startOfWeek',
  'capitalInfo', 'continents', 'car', 'flags',
];

const getAllCountriesFromApi = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (err: any) {
    logger.error('Error fetching all countries from REST Countries API', { error: err.message });
    throw new Error('Error fetching all countries from REST Countries API');
  }
};

const migrateCountriesData = async (): Promise<{ count: number }> => {
  const countries = await getAllCountriesFromApi();

  if (!Array.isArray(countries)) {
    throw new Error('Fetched data is not an array');
  }

  // Full objects are preserved here (not reduced to a single entry) so that
  // downstream aggregation (e.g. per-language speaker counts) sees every key.
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
    demonym: country.demonyms || null,
    area: country.area || null,
    gini: country.gini || null,
    timezones: country.timezones || [],
    borders: country.borders || [],
    nativeName: country.name ? country.name.nativeName || null : null,
    numericCode: country.ccn3 || null,
    currencies: country.currencies || null,
    languages: country.languages || null,
    translations: country.translations || null,
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
  })).filter((country) => country.alpha3Code);

  await Country.bulkCreate(countryData, {
    updateOnDuplicate: UPSERT_COLUMNS,
    conflictAttributes: ['alpha3Code'],
  });

  logger.info('Country data migration completed', { count: countryData.length });

  return { count: countryData.length };
};

export default { migrateCountriesData };
