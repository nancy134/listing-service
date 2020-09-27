'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'Spaces',
          'priceUnit',
          {
              type: Sequelize.ENUM,
              values: ['/sf/yr', '/sf/mo', '/mo', '/yr'] 
          }
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'Spaces',
          'priceUnit'
      );
  }
};
