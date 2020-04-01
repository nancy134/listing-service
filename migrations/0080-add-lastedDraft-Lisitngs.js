module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn(
      'Listings',
      'latestDraftId',
      {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'ListingVersions',
              key: 'id'
          }
       }
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn(
      'Listings',
      'latestDraftId'
    );
  }
}
