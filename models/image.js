'use strict';
module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    description: DataTypes.STRING
  }, {});
  Image.associate = function(models) {
     Image.belongsTo(models.Listing)
  };
  return Image;
};
