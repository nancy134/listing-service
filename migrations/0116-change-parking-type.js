'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'ListingVersions',
          'parking',
          Sequelize.STRING 
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'ListingVersions',
          'parking',
          Sequelize.INTEGER
      );
  }
};
