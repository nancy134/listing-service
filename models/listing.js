'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    // Header
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: { 
        type: DataTypes.ENUM,
        values: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
    }, 
    landlordExpenses: {
      type: DataTypes.ARRAY(DataTypes.ENUM({
        values: ['Sewer', 'Snow', 'Electric', 'Gas', 'Garbase', 'Water']
      }))
    },
    tenantExpenses: {
      type: DataTypes.ARRAY(DataTypes.ENUM({
        values: ['Sewer', 'Snow', 'Electric', 'Gas', 'Garbase', 'Water']
      }))
    },
    zip: DataTypes.STRING,
    displayAddress: DataTypes.STRING,

    // Overview
    shortDescription: DataTypes.STRING,
    longDescription: DataTypes.STRING,
    listingType: {
        type: DataTypes.ENUM,
        values: ['For Sale', 'For Lease']
    },
    listingPrice: DataTypes.DECIMAL(13,4),

    // Building Details
    propertyType: {
        type: DataTypes.ENUM,
        values: ['Office', 'Coworking', 'Industrial', 'Retail', 'Restaurant', 'Flex', 'Medical', 'Land']
    },
    totalBuildingSize: DataTypes.INTEGER,
    lotSize:  DataTypes.DECIMAL(8,2),
    taxes: DataTypes.DECIMAL(8,2),
    parking:  DataTypes.INTEGER,
    floors: DataTypes.INTEGER,
    totalNumberOfUnits: DataTypes.INTEGER,
    buildingClass: DataTypes.STRING,
    ceilingHeight: DataTypes.DECIMAL(8,2),
    driveInDoors: DataTypes.INTEGER,
    loadingDocks: DataTypes.INTEGER,
    yearBuilt: DataTypes.INTEGER,
    zone: DataTypes.INTEGER,
    totalAvailableSpace: DataTypes.INTEGER,
    nets: DataTypes.DECIMAL(9,2),

    // Building Income/Expense
    grossIncome: DataTypes.DECIMAL(13,4),
    netIncome: DataTypes.DECIMAL(13,4),
    capRate: DataTypes.DECIMAL(13,4),
    taxes: DataTypes.DECIMAL(13,4),
    pricePerFoot: DataTypes.DECIMAL(13,4),
    maintenance: DataTypes.DECIMAL(13,4),
    utilities: DataTypes.DECIMAL(13,4),
    hvac: DataTypes.DECIMAL(13,4),
    security: DataTypes.DECIMAL(13,4),
    hoaFees: DataTypes.DECIMAL(13,4)

  }, {});
  Listing.associate = function(models) {
    Listing.hasMany(models.Image, {as: 'images'});
    Listing.hasMany(models.Space, {as: 'spaces'});
  };
  return Listing;
};
