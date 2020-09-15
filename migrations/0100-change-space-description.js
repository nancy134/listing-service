'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'Spaces',
          'description',
          Sequelize.TEXT 
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.changeColumn(
          'Spaces',
          'description',
          Sequelize.STRING
      );
  }
};
