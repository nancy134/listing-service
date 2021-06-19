'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ListingUsers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            ListingVersionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ListingVersions',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            UserId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('ListingUsers');
    } 
}
