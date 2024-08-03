import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';


class Country extends Model {
  public id!: number;
  public name!: { common: string; official: string; nativeName: { [key: string]: { official: string; common: string } } };
  public topLevelDomain!: string[];
  public alpha2Code!: string;
  public alpha3Code!: string;
  public callingCodes!: string[];
  public capital!: string[];
  public altSpellings!: string[];
  public region!: string;
  public subregion!: string;
  public population!: number;
  public latlng!: number[];
  public demonym!: { [key: string]: { f: string; m: string } };
  public area!: number;
  public gini!: number;
  public timezones!: string[];
  public borders!: string[];
  public nativeName!: { [key: string]: { official: string; common: string } };
  public numericCode!: string;
  public currencies!: { [key: string]: { name: string; symbol: string } };
  public languages!: { [key: string]: string };
  public translations!: { [key: string]: { official: string; common: string } };
  public flag!: string;
  public regionalBlocs!: { [key: string]: { acronym: string; name: string; otherAcronyms: string[]; otherNames: string[] } };
  public cioc!: string;
  public maps!: { googleMaps: string; openStreetMaps: string };
  public coatOfArms!: object;
  public startOfWeek!: string;
  public capitalInfo!: { latlng: number[] };
  public continents!: string[];
  public car!: { signs: string[]; side: string };
  public flags!: { png: string; svg: string };
}

Country.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  topLevelDomain: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  alpha2Code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alpha3Code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  callingCodes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  capital: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  altSpellings: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subregion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  latlng: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: true,
  },
  demonym: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  gini: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  timezones: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  borders: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  nativeName: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  numericCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currencies: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  languages: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  translations: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  regionalBlocs: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  cioc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  maps: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  coatOfArms: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  startOfWeek: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  capitalInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  continents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  car: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  flags: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'countryData',
  timestamps: true,
});

export default Country;