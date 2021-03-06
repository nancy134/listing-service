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
              type: Sequelize.DECIMAL(8,2)
          },
          PreviousVersionId: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                  model: 'Units',
                  key: 'id'
              }
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
              },
              onDelete: 'CASCADE'
          }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Units');
  }
};
