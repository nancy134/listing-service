'use strict';
const s3Service = require("../s3");

module.exports = (sequelize, DataTypes) => {
    const Attachment = sequelize.define('Attachment', {
        url: DataTypes.STRING,
        order: DataTypes.INTEGER,
        name: DataTypes.STRING,
        fileType: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        hooks: {
            afterDestroy: function(instance, options){
                var url = instance.get('url');
                s3Service.deleteFromS3(url);
            },
        }
    });
    Attachment.associate = function(models) {
        Attachment.belongsTo(models.ListingVersion);
        Attachment.belongsTo(models.Attachment, {foreignKey: 'PreviousVersionId'});
    };
    return Attachment;
};
