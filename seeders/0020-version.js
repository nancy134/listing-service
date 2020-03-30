'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('ListingVersions', [
      {
        ListingId: 1,
        address: '240-256 Moody St',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        shortDescription: 'Single-story downtown block with two restaurants and tea shop.',
        yearBuilt: 1920,
        lotSize: 0.48,
	totalAvailableSpace: 30570,
        parking: 6,
        owner: "nancy_piedra@yahoo.com",
        amenities: Sequelize.literal(`ARRAY['Fitness Center','Air Conditioning']::"enum_ListingVersions_amenities"[]`),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 2,
        address: '440 Totten Pond Rd',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        shortDescription: '4 story professional office building with ample parking and on-site management. Provides easy access to RTE 128/95.',
        yearBuilt: 1969,
	totalAvailableSpace: 13000,
        zone: 'B',
        owner: "nancy_piedra@hotmail.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 3,
        address: '384 Main St',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        yearBuilt: 1948,
        totalBuildingSize: 22960,
        owner: "nancy_piedra@yahoo.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 4,
        address: '24 Crescent St',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        yearBuilt: 1962,
        totalBuildingSize: 25824,
	totalAvailableSpace: 3948,
        zone: 'C',
        owner: "nancy_piedra@hotmail.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 5,
        address: '375 Main St',
        city: 'Waltham',
        state: 'Massachusetts',
        shortDescription: 'Branded gas station with 2 repair bays, plus inspection sticker service; recent new pumps and canopies.',
        listingType: 'For Sale',
        listingPrice: 1495000,
        pricePerFoot: 873,
        propertyType: 'Retail',
        lotSize: 0.19,
        floors: 1,
        yearBuilt: 1960,
        parking: 5,
        driveInDoors: 2,
        owner: "nancy_piedra@yahoo.com",
        createdAt: new Date(),
        updatedAt: new Date()

      }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('ListingVersions', null, {});
  }
};
