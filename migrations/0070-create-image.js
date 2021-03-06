'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING
      },
      ListingVersionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ListingVersions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      SpaceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Spaces',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      PreviousVersionId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'Images',
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
    return queryInterface.dropTable('Images');
  }
};
