'use strict';
module.exports = (sequelize, DataTypes) => {
    const ListItem = sequelize.define('ListItem', {
        order: DataTypes.INTEGER,
        owner: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {});
    ListItem.associate = function(models){
        ListItem.belongsTo(models.List, {as: 'listItem', foreignKey: 'ListId'});
        ListItem.belongsTo(models.Listing, {as: 'listing', foreignKey: 'ListingId'});
    };
    return ListItem;
};
