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
          leaseEnds: {
              type: Sequelize.DATE
          },
          createdAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          ListingId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                  model: 'Listings',
                  key: 'id'
              }
          } 
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Tenants');
  }
};
