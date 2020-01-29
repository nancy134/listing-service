'use strict';
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    url: DataTypes.STRING
  }, {});
  Image.associate = function(models) {
     Image.belongsTo(models.Listing);
     Image.belongsTo(models.Space);
  };
  return Image;
};
