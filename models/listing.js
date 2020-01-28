'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    email: DataTypes.STRING,
    tenant: DataTypes.STRING,
    shortDescription: DataTypes.STRING,
    yearBuilt: DataTypes.INTEGER,
    totalBuildingSize: DataTypes.INTEGER,
    lotSize:  DataTypes.FLOAT,
    totalAvailableSpace: DataTypes.INTEGER,
    zone: DataTypes.INTEGER,
    parking:  DataTypes.INTEGER

  }, {});
  Listing.associate = function(models) {
    Listing.hasMany(models.Image, {as: 'images'});
    Listing.hasMany(models.Space, {as: 'spaces'});
  };
  return Listing;
};
