'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StatusEvents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      },
      publishStatus: {
        type: Sequelize.ENUM,
        values: ['On Market', 'Off Market']
      }

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('StatusEvents');
  }
};

