const listingVersionService = require("./listingVersion");
const statusEventService = require("./statusEvent");
const { Pool } = require("pg");
const Cursor = require("pg-cursor");

const connectionString = process.env.DATABASE_URL;

exports.getLastOnMarketEvent = function(ListingId, dateBefore, billingCycleStart, billingCycleEnd){
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
                start: start,
                end: end,
                ListingId: lastOnMarketEvent.ListingId,
                owner: lastOnMarketEvent.owner
            };
            console.log(billingRecord);
        }
    }).catch(function(err){
        console.log(err);
    });
}

function processRows(rows, billingCycleStart, billingCycleEnd){
    for (var i=0; i < rows.length; i++){
        var date = new Date().toISOString();
        console.log(date);
        module.exports.getLastOnMarketEvent(rows[i].ListingId, date, billingCycleStart, billingCycleEnd);
    }
}

exports.calcOnMarketListings = function(billingCycleStart, billingCycleEnd){
    const batchSize = 5;
    return new Promise(function(resolve, reject){
        const pool = new Pool({connectionString});
        pool.connect((err, client, release) => {
            if(err) reject(err); 
            
            var query = 'SELECT * FROM "ListingVersions" WHERE "ListingVersions"."publishStatus"=\'On Market\' ';

            const cursor = client.query(new Cursor(query));

            cursor.read(batchSize, (err, rows) => {
                if (err) reject(err);
                if (rows.length > 0)  processRows(rows, billingCycleStart, billingCycleEnd); 
                cursor.read(batchSize, (err, rows) => {
                    if (err) reject(err);
                    if (rows.length > 0)  processRows(rows, billingCycleStart, billingCycleEnd); 
                    else {
                        client.release();
                        resolve("finished");
                    }
                });
            });

        });
    });
}
function processOffMarketRows(rows, billingCycleStart, billingCycleEnd){
    for (var i=0; i< rows.length; i++){
        module.exports.getLastOnMarketEvent(rows[i].ListingId, rows[i].createdAt, billingCycleStart, billingCycleEnd);
    }
}
exports.calcOffMarketListings = function(billingCycleStart, billingCycleEnd){
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
                if (rows && rows.length > 0) processOffMarketRows(rows, billingCycleStart, billingCycleEnd);
                cursor.read(batchSize, (err, rows) => {
                    if (err) reject(err);
                    if (rows && rows.length > 0) processOffMarketRows(rows, billingCycleStart, billingCycleEnd);
                    else {
                        client.release();
                        resolve("finished");
                    }
                });
            });
          
        });
    }); 
}

exports.playBillingCycle = function(billingCycleStart, billingCycleEnd){
    module.exports.calcOnMarketListings(billingCycleStart, billingCycleEnd).then(function(result){
        module.exports.calcOffMarketListings(billingCycleStart, billingCycleEnd).then(function(result){
            console.log(result);
        }).catch(function(err){
            console.log(err);
        });
        console.log(result);
    }).catch(function(err){
        console.log(err);
    });
}

 
