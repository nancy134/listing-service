'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Attachments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            url: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            order: {
                type: Sequelize.INTEGER
            },
            ListingVersionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'ListingVersions',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            PreviousVersionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Attachments',
                    key: 'id'
                }
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
        return queryInterface.dropTable('Attachments');
    }
};
