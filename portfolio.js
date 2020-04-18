const models = require("./models")
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");

var find = function(id){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
           where: {
               id: id
           }
        }).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

var findWithPrevious = function(id){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
            where: {
                PreviousVersionId: id
            }
        }).then(function(portfolio){
            resolve(portfolio);
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

var update = function(id, body){
    return new Promise(function(resolve, reject){
        models.Portfolio.update(
            body,
            {returning: true, where: {id: id}}
        ).then(function([rowsUpdate, [portfolio]]){
            resolve(portfolio);
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
            attributes: ['id', 'tenant', 'buildingSize', 'type', 'ListingVersionId','PreviousVersionId']
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
        create(body).then(function(portfolio){
            resolve(portfolio);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.copyPortfolio = function(id, ListingVersionId){
    return new Promise(function(resolve, reject){
        models.Portfolio.findOne({
           where: {
               id: id
           }
        }).then(function(portfolio){
            var body = portfolio.get({plain: true});
            delete body["id"];
            body.ListingVersionId = ListingVersionId;
            body.PreviousVersionId = id;
            for (var propName in body) {
                if (body[propName] === null || body[propName] === undefined) {
                    delete body[propName];
                }
            }
            create(body).then(function(portfolio){
                resolve(portfolio);
            }).catch(function(err){
                reject(err);
            });
            return null;
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.createAPI = function(body){
    return new Promise(function(resolve, reject){
        listingVersionService.find(body.ListingVersionId).then(function(listingVersion){
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                if (listing.latestDraftId){
                    create(body).then(function(portfolio){
                        resolve(portfolio);
                    }).catch(function(err){
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         body.ListingVersionId = copied.id;
                         create(body).then(function(createdPortfolio){
                             var listingBody = {
                                latestDraftId: copied.id
                             };
                             listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                 resolve(createdPortfolio);
                             }).catch(function(err){
                                 reject(err);
                             });
                         }).catch(function(err){
                             reject(err);
                         });
                     }).catch(function(err){
                         reject(err);
                     }); 
                }
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateAPI = function(id, body){
    return new Promise(function(resolve, reject){
        find(id).then(function(portfolio){
            listingVersionService.find(portfolio.ListingVersionId).then(function(listingVersion){
                listingService.find(listingVersion.listing.ListingId).then(function(listing){
                    if (listing.latestDraftId){
                        update(id, body).then(function(portfolio){
                            resolve(portfolio);
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPrevious(id).then(function(foundPortfolio){
                                delete body.ListingVersionId;
                                delete body.id;
                                update(foundPortfolio.id, body).then(function(updatedPortfolio){
                                    var listingBody = {
                                        latestDraftId: copied.id
                                    };
                                    listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                        resolve(updatedPortfolio);
                                    }).catch(function(err){
                                        reject(err);
                                    });
                                }).catch(function(err){
                                    reject(err);
                                });
                            }).catch(function(err){
                                reject(err);
                            });
                        }).catch(function(err){
                            reject(err);
                        });
                    }
                }).catch(function(err){
                    reject(err);
                }); 
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}
