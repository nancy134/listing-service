'use strict';
module.exports = (sequelize, DataTypes) => {
  const Condo = sequelize.define('Condo', {
    unit: DataTypes.STRING,
    size: DataTypes.INTEGER,
    fees: DataTypes.DECIMAL(8,2),
    taxes: DataTypes.DECIMAL(8,2),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Condo.associate = function(models) {
     Condo.belongsTo(models.ListingVersion);
     Condo.belongsTo(models.Condo, {foreignKey: 'PreviousVersionId'});
  };
  return Condo;
};
