'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Listings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      tenant: {
        type: Sequelize.STRING
      },
      shortDescription: {
        type: Sequelize.STRING
      },
      yearBuilt: {
        type: Sequelize.INTEGER
      },
      totalBuildingSize: {
        type: Sequelize.INTEGER
      },
      lotSize: {
        type: Sequelize.FLOAT
      },
      totalAvailableSpace: {
        type: Sequelize.INTEGER
      },
      zone: {
        type: Sequelize.STRING
      },
      parking: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Listings');
  }
};
