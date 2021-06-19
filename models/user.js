'user strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: DataTypes. STRING,
        cognitoId: DataTypes.STRING,
        role: {
            type: DataTypes.ENUM,
            values: ["Agent", "Broker", "Administrator", "Principal", "Client"]
        }
    },{});

    User.associate = function(models){
        User.belongsToMany(models.ListingVersion, {
            through: models.ListingUser,
            as: 'listings',
            foreignKey: 'UserId'
        });
    };

    return User;
}

