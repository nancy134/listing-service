'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    tenant: DataTypes.STRING,
    space: DataTypes.INTEGER,
    leaseEnds: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Tenant.associate = function(models) {
     Tenant.belongsTo(models.ListingVersion);
  };
  return Tenant;
};
