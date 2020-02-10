'use strict';
module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define('Portfolio', {
    tenant: DataTypes.STRING,
    buildingSize: DataTypes.INTEGER,
    lotSize: DataTypes.INTEGER,
    type: { 
        type: DataTypes.ENUM,
        values: ['Commercial', 'Vacant', 'Mixed Use']
    }
  }, {});
  Portfolio.associate = function(models) {
     Portfolio.belongsTo(models.Listing);
  };
  return Portfolio;
};
