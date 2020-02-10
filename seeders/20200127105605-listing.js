'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('Listings', [
      {
        address: '240-256 Moody St',
        city: 'Waltham',
        state: 'Massachusetts',
        shortDescription: 'Single-story downtown block with two restaurants and tea shop.',
        yearBuilt: 1920,
        lotSize: 0.48,
	totalAvailableSpace: 30570,
        parking: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        address: '440 Totten Pond Rd',
        city: 'Waltham',
        state: 'Massachusetts',
        shortDescription: '4 story professional office building with ample parking and on-site management. Provides easy access to RTE 128/95.',
        yearBuilt: 1969,
	totalAvailableSpace: 13000,
        zone: 'B',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        address: '384 Main St',
        city: 'Waltham',
        state: 'Massachusetts',
        yearBuilt: 1948,
        totalBuildingSize: 22960,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        address: '24 Crescent St',
        city: 'Waltham',
        state: 'Massachusetts', 
        yearBuilt: 1962,
        totalBuildingSize: 25824,
	totalAvailableSpace: 3948,
        zone: 'C',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        address: '375 Main St',
        city: 'Waltham',
        state: 'Massachusetts',
        listingPrice: 1495000,
        pricePerFoot: 873,
        propertyType: 'Retail',
        lotSize: 0.19,
        floors: 1,
        yearBuilt: 1960,
        parking: 5,
        driveInDoors: 2,
        createdAt: new Date(),
        updatedAt: new Date()

      }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Listings', null, {});
  }
};
