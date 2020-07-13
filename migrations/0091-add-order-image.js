'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'Images',
          'order',
          Sequelize.INTEGER 
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'Images',
          'order'
      );
  }
};
