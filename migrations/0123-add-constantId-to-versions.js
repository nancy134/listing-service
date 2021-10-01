'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'ListingVersions',
          'constantContactId',
          {
              type: Sequelize.STRING
          }
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'ListingVersions',
          'constantContactId'
      );
  }
};
