'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
  }, {});
  Listing.associate = function(models){
      Listing.hasMany(models.ListingVersion, {as: 'versions'});
      Listing.hasMany(models.StatusEvent, {as: 'statusEvents'});
      Listing.belongsTo(models.ListingVersion, {as: 'latestDraftVersion', foreignKey: 'latestDraftId'});
      Listing.belongsTo(models.ListingVersion, {as: 'latestApprovedVersion', foreignKey: 'latestApprovedId'});
  };
  return Listing;
};
