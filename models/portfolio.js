'use strict';
module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define('Portfolio', {
    tenant: DataTypes.STRING,
    buildingSize: DataTypes.INTEGER,
    lotSize: DataTypes.INTEGER,
    type: { 
        type: DataTypes.ENUM,
        values: ['Commercial', 'Vacant', 'Mixed Use']
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Portfolio.associate = function(models) {
     Portfolio.belongsTo(models.ListingVersion);
     Portfolio.belongsTo(models.Portfolio, {foreignKey: 'PreviousVersionId'});
  };
  return Portfolio;
};
