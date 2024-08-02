'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      topLevelDomain: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      alpha2Code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alpha3Code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      callingCodes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      capital: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      altSpellings: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subregion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      population: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      latlng: {
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        allowNull: true,
      },
      demonym: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      gini: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      timezones: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      borders: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      nativeName: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      numericCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currencies: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      languages: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      translations: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      flag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      regionalBlocs: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      cioc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      maps: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      coatOfArms: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      startOfWeek: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      capitalInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      continents: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      car: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      flags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  }
};
