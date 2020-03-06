const models = require("./models")

var find = function(unit){
    return new Promise(function(resolve, reject){
        models.Unit.findOne({
           where: {
               id: unit.id
           }
        }).then(function(unit){
            ret = {
                unit:unit 
            }
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Unit.create(body).then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(update){
    return new Promise(function(resolve, reject){
        models.Unit.update(
            update.body,
            {returning: true, where: {id: update.id}}
        ).then(function([rowsUpdate, [listing]]){
            resolve(listing);
        }).catch(function(err){
            reject(err);
        });
    });
}

var index = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        models.Unit.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'description', 'numUnits', 'space', 'income', 'ListingId']
        }).then(unit => {
            var ret = {
                page: page,
                perPage: limit,
                units: unit 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getUnits = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(units){
            resolve(units);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateUnit = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createUnit = function(body){
    return new Promise(function(resolve, reject){
        create(body)
        .then(find)
        .then(function(unit){
            resolve(unit);
        }).catch(function(err){
            reject(err);
        });
    });
}
