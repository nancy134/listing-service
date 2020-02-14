'use strict';
module.exports = (sequelize, DataTypes) => {
  const Space = sequelize.define('Space', {
    unit: DataTypes.STRING,
    size: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    type: DataTypes.STRING,
    use: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Space.associate = function(models) {
     Space.belongsTo(models.Listing);
     Space.hasMany(models.Image, {as: 'images'});
  };
  return Space;
};
