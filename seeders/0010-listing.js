'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('Listings', [
      {
       createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       createdAt: new Date(),
        updatedAt: new Date()
      }

      ], {});
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Listings', null, {});
  }
};
