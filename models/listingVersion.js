'use strict';
module.exports = (sequelize, DataTypes) => {
  const ListingVersion = sequelize.define('ListingVersion', {
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
    location: DataTypes.GEOMETRY('POINT'),
    // Overview
    shortDescription: DataTypes.STRING,
    longDescription: DataTypes.TEXT,
    listingType: {
        type: DataTypes.ENUM,
        values: ['For Sale', 'For Lease']
    },
    listingPrice: DataTypes.DECIMAL(13,4),

    // Building Details
    propertyType: {
        type: DataTypes.ENUM,
        values: ['Office', 'Coworking', 'Industrial', 'Retail', 'Restaurant', 'Flex', 'Medical', 'Land', 'Mixed Use']
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
    hoaFees: DataTypes.DECIMAL(13,4),

    // Other
    owner: DataTypes.STRING,
    publishStatus: {
        type: DataTypes.ENUM,
        values: ['Draft', 'Under Moderation', 'Approved', 'On Market', 'Off Market', 'Archived']
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    //Amenities
    amenities: {
      type: DataTypes.ARRAY(DataTypes.ENUM({
        values: ['Fitness Center', 'Air Conditioning', 'Food Service', 'Shared Conference Room', 'Pylon Signage', 'Concierge Service', 'Lobby', 'Covered Parking', '24 Hour Access', 'Banking', 'Bus Line', 'Commuter Train', 'On-Site Propert Manager', 'Sky Lights', 'Fenced Lot']
      }))
    },

  }, {});
  ListingVersion.associate = function(models) {
    ListingVersion.belongsTo(models.Listing, {as: 'listing', foreignKey: 'ListingId'});
    ListingVersion.hasMany(models.Image, {as: 'images'});
    ListingVersion.hasMany(models.Space, {as: 'spaces'});
    ListingVersion.hasMany(models.Unit, {as: 'units'});
    ListingVersion.hasMany(models.Tenant, {as: 'tenants'});
    ListingVersion.hasMany(models.Portfolio, {as: 'portfolios'});
  };
  return ListingVersion;
};
