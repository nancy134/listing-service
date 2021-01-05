const listingVersionService = require("./listingVersion");
const statusEventService = require("./statusEvent");
const { Pool } = require("pg");
const Cursor = require("pg-cursor");
const sns = require("./sns");
const jwt = require("./jwt");

const connectionString = process.env.DATABASE_URL;

exports.getLastOnMarketEvent = function(ListingId, dateBefore, billingCycleStart, billingCycleEnd, billingCycleId){
    statusEventService.findLastOnMarketEvent(ListingId, dateBefore).then(function(lastOnMarketEvent){
        // If On Market event is earlier than billing cycle start
        // then billing record start equals billing cycle start
        var start = lastOnMarketEvent.createdAt;
        if (Date.parse(lastOnMarketEvent.createdAt) < Date.parse(billingCycleStart)){
            start = billingCycleStart;
        }


        // If now is greater than billing cycle end
        var end = dateBefore;
        if (Date.parse(dateBefore) > Date.parse(billingCycleEnd)){
           end = billingCycleEnd;
        } else {
           end = dateBefore;
        }

        // If On Market event is later than billing cycle end
        if (Date.parse(start) < Date.parse(billingCycleEnd)) {
            var billingRecord = {
                BillingCycleId: billingCycleId,
                start: start,
                end: end,
                ListingId: lastOnMarketEvent.ListingId,
                owner: lastOnMarketEvent.owner
            };
            sns.billingEvent(billingRecord);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function processRows(rows, billingCycleStart, billingCycleEnd, billingCycleId){
    for (var i=0; i < rows.length; i++){
        var date = new Date().toISOString();
        module.exports.getLastOnMarketEvent(rows[i].ListingId, date, billingCycleStart, billingCycleEnd, billingCycleId);
    }
}

exports.calcOnMarketListings = function(billingCycleStart, billingCycleEnd, billingCycleId){
    const batchSize = 5;
    return new Promise(function(resolve, reject){
        const pool = new Pool({connectionString});
        pool.connect((err, client, release) => {
            if(err) reject(err); 
            
            var query = 'SELECT * FROM "ListingVersions" WHERE "ListingVersions"."publishStatus"=\'On Market\' ';

            const cursor = client.query(new Cursor(query));

            cursor.read(batchSize, (err, rows) => {
                if (err) reject(err);
                if (rows.length > 0)  processRows(rows, billingCycleStart, billingCycleEnd, billingCycleId); 
                cursor.read(batchSize, (err, rows) => {
                    if (err) reject(err);
                    if (rows.length > 0)  processRows(rows, billingCycleStart, billingCycleEnd, billingCycleId); 
                    else {
                        client.release();
                        resolve("finished");
                    }
                });
            });

        });
    });
}
function processOffMarketRows(rows, billingCycleStart, billingCycleEnd, billingCycleId){
    for (var i=0; i< rows.length; i++){
        module.exports.getLastOnMarketEvent(rows[i].ListingId, rows[i].createdAt, billingCycleStart, billingCycleEnd, billingCycleId);
    }
}
exports.calcOffMarketListings = function(billingCycleStart, billingCycleEnd, billingCycleId){
    const batchSize = 5;
    return new Promise(function(resolve, reject){
        const pool = new Pool({connectionString});
        pool.connect((err, client, release) => {
            if (err) reject(err);
            var billingCycleStart = "2020-12-15T05:00:01.000Z";
            var query = 'SELECT * FROM "StatusEvents" WHERE "StatusEvents"."publishStatus" = \'Off Market\' AND "StatusEvents"."createdAt" > \''+ billingCycleStart + '\'';

            const cursor = client.query(new Cursor(query));

            cursor.read(batchSize, (err, rows) => {
                if (err) reject(err);
                if (rows && rows.length > 0) processOffMarketRows(rows, billingCycleStart, billingCycleEnd, billingCycleId);
                cursor.read(batchSize, (err, rows) => {
                    if (err) reject(err);
                    if (rows && rows.length > 0) processOffMarketRows(rows, billingCycleStart, billingCycleEnd, billingCycleId);
                    else {
                        client.release();
                        resolve("finished");
                    }
                });
            });
          
        });
    }); 
}

exports.playBillingCycle = function(authParams, billingCycleStart, billingCycleEnd, billingCycleId){
    module.exports.calcOnMarketListings(billingCycleStart, billingCycleEnd, billingCycleId).then(function(result){
        module.exports.calcOffMarketListings(billingCycleStart, billingCycleEnd, billingCycleId).then(function(result){
        }).catch(function(err){
            console.log(err);
        });
    }).catch(function(err){
        console.log(err);
    });
}

 
