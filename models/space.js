'use strict';
module.exports = (sequelize, DataTypes) => {
  const Space = sequelize.define('Space', {
    unit: DataTypes.STRING,
    size: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    type: {
        type: DataTypes.ENUM,
        values: ['Full Gross', 'Modified Gross', 'NNN']
    },
    use: {
        type: DataTypes.ENUM,
        values: ['Office', 'Retail', 'Flex', 'Warehouse', 'Restaturant', 'Specialty']
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Space.associate = function(models) {
     Space.belongsTo(models.Listing);
     Space.hasMany(models.Image, {as: 'images'});
  };
  return Space;
};
