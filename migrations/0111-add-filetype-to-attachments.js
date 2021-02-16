'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
      return queryInterface.addColumn(
          'Attachments',
          'fileType',
          {
              type: Sequelize.STRING
          }
      );
  },

  down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn(
          'Attachments',
          'fileType'
      );
  }
};
