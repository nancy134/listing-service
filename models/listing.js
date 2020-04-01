'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
  }, {});
  Listing.associate = function(models){
      Listing.hasMany(models.ListingVersion, {as: 'versions'});
      Listing.belongsTo(models.ListingVersion, {as: 'latestDraftVersion', foreignKey: 'latestDraftId'});
  };
  return Listing;
};
