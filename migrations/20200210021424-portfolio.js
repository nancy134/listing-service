'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('Portfolios', {
          id: {
             allowNull: false,
             autoIncrement: true,
             primaryKey: true,
             type: Sequelize.INTEGER 
          },
          tenant: {
              type: Sequelize.STRING
          },
          buildingSize: {
              type: Sequelize.INTEGER
          },
          lotSize: {
              type: Sequelize.INTEGER
          },
          type: {
              type: Sequelize.ENUM,
              values: ['Commercial', 'Vacant', 'Mixed Use']
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
              reference: {
                  model: 'Listings',
                  key: 'id'
              }
          }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Portfolios');
  }
};
