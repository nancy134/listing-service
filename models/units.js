'use strict';
module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    description: DataTypes.STRING,
    numUnits: DataTypes.INTEGER,
    space: DataTypes.INTEGER,
    income: DataTypes.DECIMAL(13,4)
  }, {});
  Unit.associate = function(models) {
     Unit.belongsTo(models.Listing);
  };
  return Unit;
};
