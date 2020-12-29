'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('StatusEvents', [
        {
            ListingId: 1,
            publishStatus: "On Market",
            createdAt: "2020-12-17 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-17 00:12:00 EST"
        },
        {
            ListingId: 2,
            publishStatus: "On Market",
            createdAt: "2020-12-10 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-10 00:12:00 EST"
        },
        {
            ListingId: 3,
            publishStatus: "On Market",
            createdAt: "2020-12-16 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-10 00:12:00 EST"
        },
        {
            ListingId: 3,
            publishStatus: "Off Market",
            createdAt: "2020-12-20 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-10 00:12:00 EST"
        },
        {
            ListingId: 4,
            publishStatus: "On Market",
            createdAt: "2020-12-11 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-10 00:12:00 EST"
        },
        {
            ListingId: 4,
            publishStatus: "Off Market",
            createdAt: "2020-12-18: 00:12:00 EST",
            owner: "nancy_piedra@yahoo.com",
            updatedAt: "2020-12-10 00:12:00 EST"
        }

        ], {})
    },
    down: (queryInterface, Sequelize) => {
    }
};
