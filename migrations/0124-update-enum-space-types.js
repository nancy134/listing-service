'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Spaces',
      columnName: 'use',
      newValues: [
          'Office',
          'Retail',
          'Flex',
          'Warehouse',
          'Restaurant',
          'Specialty',
          'Land',
          'Multifamily',
          'Investment',
          'Condo',
          'Automotive',
          'Medical',
          'Coworking',
          'Industrial',
          'Mixed Use'
      ]
    });
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'Spaces',
      columnName: 'use',
      newValues: [
          'Office',
          'Retail',
          'Flex',
          'Warehouse',
          'Restaurant',
          'Specialty',
          'Land',
          'Multifamily',
          'Investment',
          'Condo',
          'Automotive',
          'Medical'
      ]
    });
  }
};

