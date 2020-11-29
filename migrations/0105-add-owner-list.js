'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'Lists',
          'owner',
          {
              type: Sequelize.STRING
          }
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'Lists',
          'owner'
      );
  }
};
