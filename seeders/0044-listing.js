'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.query('UPDATE "Listings" SET "latestApprovedId"=6 WHERE id=4;');
  },
  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Listings', null, {});
  }
};

