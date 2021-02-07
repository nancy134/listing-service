'use strict';

module.exports = {
    up: function(queryInterface, Sequelize){
        return queryInterface.addColumn(
            'ListItems',
            'owner',
            {
                type: Sequelize.STRING
            }
        );
    },

    down: function(queryInterface, Sequelize){
        return queryInterface.removeColumn(
            'ListItems',
            'owner'
        );
    }
};
