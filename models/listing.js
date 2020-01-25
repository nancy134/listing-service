'use strict';
module.exports = (sequelize, DataTypes) => {
  const Listing = sequelize.define('Listing', {
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    email: DataTypes.STRING,
    tenant: DataTypes.STRING
  }, {});
  Listing.associate = function(models) {
    // associations can be defined here
  };
  return Listing;
};