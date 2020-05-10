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
        type: Sequelize.DECIMAL(8,2)
      },
      type: {
        type: Sequelize.ENUM,
        values: ['Full Gross', 'Modified Gross', 'Triple Net']
      },
      use: {
        type: Sequelize.ENUM,
        values: ['Office', 'Retail', 'Flex', 'Warehouse', 'Restaurant', 'Specialty']
      },
      description: {
        type: Sequelize.STRING
      },
      driveInDoors: {
        type: Sequelize.INTEGER
      },
      floors: {
        type: Sequelize.INTEGER
      },
      divisible: {
        type: Sequelize.ENUM,
        values: ['Yes', 'No']
      },
      loadingDocks: {
        type: Sequelize.INTEGER
      },
      leaseTerm: {
        type: Sequelize.STRING
      },
      ceilingHeight: {
        type: Sequelize.DECIMAL(8,2)
      },
      availableDate: {
        type: Sequelize.DATE
      },
      nets: {
        type: Sequelize.DECIMAL(8,2)
      },
      class: {
        type: Sequelize.STRING
      },
      ListingVersionId: {
       type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ListingVersions',
          key: 'id'
        }
      },
      PreviousVersionId: {
       type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Spaces',
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
