'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Condos', {
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
      fees: {
        type: Sequelize.DECIMAL(8,2)
      },
      taxes: {
        type: Sequelize.DECIMAL(8,2)
      },
      ListingVersionId: {
       type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ListingVersions',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    return queryInterface.dropTable('Condos');
  }
};
