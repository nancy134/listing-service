const models = require("./models")

var find = function(portfolio){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
           where: {
               id: portfolio.id
           }
        }).then(function(portfolio){
            ret = {
                portfolio: portfolio
            }
            resolve(ret);
        }).catch(function(err){
            reject(err);
        });
    });
}

var create = function(body){
    return new Promise(function(resolve, reject){
        models.Portfolio.create(body).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var update = function(update){
    return new Promise(function(resolve, reject){
        models.Portfolio.update(
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
        models.Portfolio.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            attributes: ['id', 'tenant', 'buildingSize', 'type', 'ListingVersionId']
        }).then(portfolios => {
            var ret = {
                page: page,
                perPage: limit,
                portfolios: portfolios 
            };
            resolve(ret);
        }).catch(err => {
            reject(err);
        });
    });
}

exports.getPortfolios = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        index(page, limit, offset, where).then(function(portfolios){
            resolve(portfolios);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updatePortfolio = function(updateData){
    return new Promise(function(resolve, reject){
        update(updateData)
        .then(find)
        .then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createPortfolio = function(body){
    return new Promise(function(resolve, reject){
        create(body)
        .then(find)
        .then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}
