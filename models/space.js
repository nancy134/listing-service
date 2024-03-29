'use strict';
module.exports = (sequelize, DataTypes) => {
  const Space = sequelize.define('Space', {
    unit: DataTypes.STRING,
    size: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(8,2),
    priceUnit: {
        type: DataTypes.ENUM,
        values: ['/sf/yr', '/sf/mo', '/mo', '/yr']
    },
    type: {
        type: DataTypes.ENUM,
        values: ['Full Gross', 'Modified Gross', 'Triple Net']
    },
    use: {
        type: DataTypes.ENUM,
        values: [
            'Office',
            'Retail',
            'Flex',
            'Warehouse',
            'Restaurant',
            'Specialty',
            'Land',
            'Multifamily',
            'Investment',
            'Condo',
            'Automotive',
            'Medical',
            'Coworking',
            'Industrial',
            'Mixed Use'
        ]
    },
    description: DataTypes.TEXT,
    driveInDoors: DataTypes.INTEGER,
    floors: DataTypes.INTEGER,
    divisible: { 
        type: DataTypes.ENUM,
        values: ['Yes', 'No']
    },
    loadingDocks: DataTypes.INTEGER,
    leaseTerm: DataTypes.STRING,
    ceilingHeight: DataTypes.DECIMAL(8,2),
    availableDate: DataTypes.DATE,
    nets: DataTypes.DECIMAL(8,2),
    class: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  Space.associate = function(models) {
     Space.belongsTo(models.ListingVersion);
     Space.belongsTo(models.Space, {foreignKey: 'PreviousVersionId'});
     Space.hasMany(models.Image, {as: 'images'});
  };
  return Space;
};
