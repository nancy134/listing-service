'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query('UPDATE "Listings" SET "latestApprovedId"=8 WHERE id=6;');
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Listings', null, {});
  }
};

