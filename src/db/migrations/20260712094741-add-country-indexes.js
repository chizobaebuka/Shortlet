'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Prior migrations had no unique constraint to upsert against, so repeated
    // /migrate calls could have inserted duplicate rows per alpha3Code. Clear
    // those out (keeping the most recently updated row) before enforcing uniqueness.
    await queryInterface.sequelize.query(`
      DELETE FROM "countryData" a USING "countryData" b
      WHERE a."alpha3Code" = b."alpha3Code"
      AND a."id" < b."id";
    `);

    await queryInterface.addConstraint('countryData', {
      fields: ['alpha3Code'],
      type: 'unique',
      name: 'countryData_alpha3Code_unique',
    });
    await queryInterface.addIndex('countryData', ['alpha2Code'], {
      name: 'countryData_alpha2Code_idx',
    });
    await queryInterface.addIndex('countryData', ['region'], {
      name: 'countryData_region_idx',
    });
    await queryInterface.addIndex('countryData', ['population'], {
      name: 'countryData_population_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('countryData', 'countryData_population_idx');
    await queryInterface.removeIndex('countryData', 'countryData_region_idx');
    await queryInterface.removeIndex('countryData', 'countryData_alpha2Code_idx');
    await queryInterface.removeConstraint('countryData', 'countryData_alpha3Code_unique');
  },
};
