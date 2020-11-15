'use strict';
module.exports = (sequelize, DataTypes) => {
    const List = sequelize.define('List', {
        name: DataTypes.STRING,
        order: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {});
    List.associate = function(models){
        List.hasMany(models.ListItem, {as: 'listItems'});
    };
    return List;
};
