'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'StatusEvents',
        'StatusEvents_ListingId_fkey',
        { transaction }
      );
      await queryInterface.addConstraint('StatusEvents', {
        type: 'foreign key',
        fields: ['ListingId'],
        name: 'StatusEvents_ListingId_fkey',
        references: {
          table: 'Listings',
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
        'users',
        'users_address_id_fkey',
        { transaction }
      );
      await queryInterface.addConstraint('StatusEvents', {
        type: 'foreign key',
        fields: ['ListingId'],
        name: 'StatusEvents_ListingId_fkey',
        references: {
          table: 'StatusEvents',
          field: 'id',
        },
        transaction
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
