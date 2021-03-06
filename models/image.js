'use strict';
const s3Service = require("../s3");

module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        url: DataTypes.STRING,
        order: DataTypes.INTEGER,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        hooks: {
            afterDestroy: function(instance, options){
                var url = instance.get('url');
                s3Service.deleteFromS3(url);
            }
        } 
    });
    Image.associate = function(models) {
        Image.belongsTo(models.ListingVersion);
        Image.belongsTo(models.Space);
        Image.belongsTo(models.Image, {foreignKey: 'PreviousVersionId'});
    };
    return Image;
};
