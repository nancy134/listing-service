'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ListingVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Header
      address: { 
        type: Sequelize.STRING
      },
      city: {  
        type: Sequelize.STRING
      },
      state: { 
        type: Sequelize.ENUM,
        values: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
      },
      landlordExpenses: {
        type: Sequelize.ARRAY(Sequelize.ENUM({
          values: ['Sewer', 'Snow', 'Electric', 'Gas', 'Garbage', 'Water']
        }))
      },
      tenantExpenses: {
        type: Sequelize.ARRAY(Sequelize.ENUM({
          values: ['Sewer', 'Snow', 'Electric', 'Gas', 'Garbage', 'Water']
        }))
      },
      zip: {  
        type: Sequelize.STRING
      },
      displayAddress: {  
        type: Sequelize.STRING
      },

      // Overview
      shortDescription: {
        type: Sequelize.STRING
      },
      longDescription: {
        type: Sequelize.STRING
      },
      listingType: {
        type: Sequelize.ENUM,
        values: ['For Sale', 'For Lease']
      },
      listingPrice: {
        type: Sequelize.DECIMAL(13, 4)
      },

      // Building Details
      propertyType: {
        type: Sequelize.ENUM,
        values: ['Office', 'Coworking', 'Industrial', 'Retail', 'Restaurant', 'Flex', 'Medical', 'Land']
      },
      totalBuildingSize: {
        type: Sequelize.INTEGER
      },
      lotSize: {
        type: Sequelize.DECIMAL(8,2)
      },
      taxes: {
        type: Sequelize.DECIMAL(8,2)
      },
      parking: {
        type: Sequelize.INTEGER
      },
      floors: {
        type: Sequelize.INTEGER
      },
      totalNumberOfUnits: {
        type: Sequelize.INTEGER
      },
      buildingClass: {
        type: Sequelize.STRING
      },
      ceilingHeight: {
        type: Sequelize.DECIMAL(4,1)
      },
      driveInDoors: {
        type: Sequelize.INTEGER
      },
      loadingDocks: {
        type: Sequelize.INTEGER
      },
      yearBuilt: {
        type: Sequelize.INTEGER
      },
      zone: {
        type: Sequelize.STRING
      },
      totalAvailableSpace: {
        type: Sequelize.INTEGER
      },
      nets: {
        type: Sequelize.DECIMAL(9,2)
      },

      // Building Income/Expense
      grossIncome: {
        type: Sequelize.DECIMAL(13,4)
      },
      netIncome: {
        type: Sequelize.DECIMAL(13,4)
      },
      capRate: {
        type: Sequelize.DECIMAL(13,4)
      },
      taxes: {
        type: Sequelize.DECIMAL(13,4)
      },
      pricePerFoot: {
        type: Sequelize.DECIMAL(13,4)
      },
      maintenance: {
        type: Sequelize.DECIMAL(13,4)
      },
      utilities: {
        type: Sequelize.DECIMAL(13,4)
      },
      hvac: {
        type: Sequelize.DECIMAL(13,4)
      },
      security: {
        type: Sequelize.DECIMAL(13,4)
      },
      hoaFees: {
        type: Sequelize.DECIMAL(13,4)
      },

      // Other
      owner: {
        type: Sequelize.STRING
      },
      // Amenities
      amenities: {
        type: Sequelize.ARRAY(Sequelize.ENUM({ 
        values: ['Fitness Center', 'Air Conditioning', 'Food Service', 'Shared Conference Room', 'Pylon Signage', 'Concierge Service', 'Lobby', 'Covered Parking', '24 Hour Access', 'Banking', 'Bus Line', 'Commuter Train', 'On-Site Propert Manager', 'Sky Lights', 'Fenced Lot']
        }))
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ListingVersions');
  }
};
