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
              type: Sequelize.DECIMAL(10,2)
          },
          type: {
              type: Sequelize.ENUM,
              values: ['Commercial', 'Vacant', 'Mixed Use']
          },
          PreviousVersionId: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                  model: 'Portfolios',
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
              reference: {
                  model: 'ListingVersions',
                  key: 'id'
              }
          }
      });
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('Portfolios');
  }
};
