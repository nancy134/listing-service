'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
  }, {});
  Listing.associate = function(models){
      Listing.hasMany(models.ListingVersion, {as: 'versions'});
  };
  return Listing;
};
