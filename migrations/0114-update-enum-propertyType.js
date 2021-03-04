'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'ListingVersions',
      columnName: 'propertyType',
      newValues: [
          'Office',
          'Coworking',
          'Industrial',
          'Retail',
          'Restaurant',
          'Flex',
          'Medical',
          'Land',
          'Mixed Use',
          'Warehouse',
          'Specialty',
          'Multifamily',
          'Investment',
          'Condo',
          'Automotive' 
      ]
    });
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'ListingVersions',
      columnName: 'propertyType',
      newValues: [
          'Office', 
          'Coworking', 
          'Industrial', 
          'Retail', 
          'Restaurant', 
          'Flex', 
          'Medical', 
          'Land', 
          'Mixed Use'
      ]
    });
  }
};

