'use strict';
module.exports = (sequelize, DataTypes) => {
    const StatusEvent = sequelize.define('StatusEvent', {
        publishStatus: {
            type: DataTypes.ENUM,
            values: ['On Market', 'Off Market']
        },
        owner: {
            type: DataTypes.STRING
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {});
    StatusEvent.associate = function(models) {
        StatusEvent.belongsTo(models.Listing, {as: 'listing', foreignKey: 'ListingId'});
    };
    return StatusEvent;
};
