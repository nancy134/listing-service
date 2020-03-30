'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Spaces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unit: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.FLOAT
      },
      type: {
        type: Sequelize.ENUM,
        values: ['Full Gross', 'Modified Gross', 'NNN']
      },
      use: {
        type: Sequelize.ENUM,
        values: ['Office', 'Retail', 'Flex', 'Warehouse', 'Restaurant', 'Specialty']
      },
      ListingVersionId: {
       type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ListingVersions',
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
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Spaces');
  }
};
