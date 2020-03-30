'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('Units', { 
          id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },
          description: {
              type: Sequelize.STRING
          },
          numUnits: {
              type: Sequelize.INTEGER
          },
          space: {
              type: Sequelize.INTEGER 
          },
          income: {
              type: Sequelize.DECIMAL(13,4)
          },
          createdAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          ListingVersionId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                  model: 'ListingVersions',
                  key: 'id'
              }
          }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Units');
  }
};
