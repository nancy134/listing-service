'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('Tenants', { 
          id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },
          tenant: {
              type: Sequelize.STRING
          },
          space: {
              type: Sequelize.INTEGER
          },
          baseRent: {
              type: Sequelize.DECIMAL(8,2)
          },
          leaseEnds: {
              type: Sequelize.DATE
          },
          PreviousVersionId: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                  model: 'Tenants',
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
              }
          } 
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Tenants');
  }
};
