'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'ListingVersions',
          'propertyTypes',
          {
              type: Sequelize.ARRAY(Sequelize.ENUM({
                  values: [
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
                      'Multifamilty',
                      'Investment',
                      'Condo',
                      'Automotive'
                  ]
              }))
          }
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'ListingVersions',
          'propertyTypes'
      );
  }
};
