'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'ListingVersions',
          'taxes',
          Sequelize.DECIMAL(11,2) 
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'ListingVersions',
          'taxes',
          Sequelize.DECIMAL(13,4)
      );
  }
};
