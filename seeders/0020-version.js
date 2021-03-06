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
        publishStatus: "Approved",
        amenities: Sequelize.literal(`ARRAY['Fitness Center','Air Conditioning']::"enum_ListingVersions_amenities"[]`),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 1,
        address: '240-256 Moody St',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        shortDescription: 'Single-story downtown block with two restaurants and tea shop. Updated version',
        yearBuilt: 1920,
        lotSize: 0.48,
	totalAvailableSpace: 33000,
        parking: 6,
        owner: "nancy_piedra@yahoo.com",
        publishStatus: "Draft",
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
        publishStatus: "Approved",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ListingId: 2,
        address: '440 Totten Pond Rd',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        shortDescription: '4 story professional office building with ample parking and on-site management. Provides easy access to RTE 128/95. Updated version',
        yearBuilt: 1969,
	totalAvailableSpace: 15000,
        zone: 'B',
        owner: "nancy_piedra@hotmail.com",
        publishStatus: "Draft",
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
        publishStatus: "Under Review",
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
        publishStatus: "Off Market",
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
        publishStatus: "On Market",
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        ListingId: 6,
        address: '77 Rumford Ave',
        city: 'Waltham',
        state: 'Massachusetts',
        listingType: 'For Lease',
        shortDescription: 'Prime office suite consisting of reception/waiting area, two conference rooms, 4 private offices, kitchenette with break room, server/storage room and open work space. Suite gets nice natural light.',
        yearBuilt: 1982,
        totalAvailableSpace: 27373,
        parking: 60,
        owner: "paulp@sabrerealtygroup.com",
        publishStatus: "On Market",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('ListingVersions', null, {});
  }
};
