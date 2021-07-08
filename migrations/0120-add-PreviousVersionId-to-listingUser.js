'use strict';

module.exports = {
    up: function(queryInterface, Sequelize){
        return queryInterface.addColumn(
            'ListingUsers',
            'PreviousVersionId',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "ListingUsers",
                    key: 'id'
                }
            }
        );
    },
    down: function(queryInterface, Sequelize){
        return queryInterface.removeColumn(
            'ListingUsers',
            'PreviousVersionId'
        );
    }
};
