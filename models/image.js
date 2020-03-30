'use strict';
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    url: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Image.associate = function(models) {
     Image.belongsTo(models.ListingVersion);
     Image.belongsTo(models.Space);
  };
  return Image;
};
