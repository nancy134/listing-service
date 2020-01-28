'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.bulkInsert('Spaces', [
      {
        unit: '1st Fl-Ste 248',
        size: 1152,
        price: 20.0,
        type: 'NNN',
        use: 'Restaurant',
        ListingId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        unit: '4th Floor',
        size: 1547,
        price: 22.85,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
 
      },
      {
        unit: '1st Floor',
        size: 1200,
        price: 15.00,
        type: 'NNN',
        use: 'Specialty',
        ListingId: 3,
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        unit: '1st Floor Suite 102',
        size: 701,
        price: 14.12,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
 
      },
      {
        unit: '1st Floor Suite 103',
        size: 650,
        price: 20.0,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 4,
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        unit: '3rd Floor Suite 303',
        size: 834,
        price: 19.03,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 4,
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        unit: '4th Floor Suite 403',
        size: 770,
        price: 19.03,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 4,
        createdAt: new Date(),
        updatedAt: new Date()

      },
      {
        unit: '4th Floor Suite 403',
        size: 993,
        price: 20.0,
        type: 'Modified Gross',
        use: 'Office',
        ListingId: 4,
        createdAt: new Date(),
        updatedAt: new Date()

      }

      ], {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Spaces', null, {});
  }
};
