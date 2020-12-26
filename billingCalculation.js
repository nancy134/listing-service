const listingVersionService = require("./listingVersion");
const statusEventService = require("./statusEvent");

exports.playBillingCycle = function(){
    var page = 1;
    var limit = 10;
    var offset = (parseInt(page)-1)*parseInt(limit);

    return new Promise(function(resolve, reject){
        listingVersionService.indexOnMarket(page, limit, offset).then(function(listingVersions){
            var numListings = listingVersions.listings.count;
            for (var i=0; i<numListings; i++){
                var ListingId = listingVersions.listings.rows[i].ListingId;
                statusEventService.findLastOnMarketEvent(ListingId).then(function(lastOnMarketEvent){
                    console.log(lastOnMarketEvent);
                }).catch(function(err){
                    console.log(err);
                });
            }
            resolve(listingVersions);
        }).catch(function(err){
            reject(err);
        });
    });
}
 
