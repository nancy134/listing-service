'use strict';
module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    description: DataTypes.STRING,
    numUnits: DataTypes.INTEGER,
    space: DataTypes.INTEGER,
    income: DataTypes.DECIMAL(8,2),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Unit.associate = function(models) {
     Unit.belongsTo(models.ListingVersion);
     Unit.belongsTo(models.Unit, {foreignKey: 'PreviousVersionId'});
  };
  return Unit;
};
