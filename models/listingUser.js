'use strict';

module.exports = (sequelize, DataTypes) => {
    const ListingUser = sequelize.define('ListingUser', {
    },{});

    ListingUser.associate = function(models){
        ListingUser.belongsTo(models.User,{ as: 'user', foreignKey: 'UserId'});
        ListingUser.belongsTo(models.ListingVersion, {as: 'listing', foreignKey: 'ListingVersionId'});
    };

    return ListingUser;
}
