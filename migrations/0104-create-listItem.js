'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ListItems', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            order: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            ListId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Lists',
                    key: 'id'
                }
            },
            ListingId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Listings',
                    key: 'id'
                }
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('ListItems');
    }
};
