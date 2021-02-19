'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'ListItems',
        'ListItems_ListId_fkey',
        { transaction }
      );
      await queryInterface.addConstraint('ListItems', {
        type: 'foreign key',
        fields: ['ListId'],
        name: 'StatusEvents_ListId_fkey',
        references: {
          table: 'Lists',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'ListItems',
        'LIstItems_ListId_fkey',
        { transaction }
      );
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
