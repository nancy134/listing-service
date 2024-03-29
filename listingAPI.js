const models = require("./models");
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const unitService = require("./unit");
const spaceService = require("./space");
const portfolioService = require("./portfolio");
const tenantService = require("./tenant");
const imageService = require("./image");
const attachmentService = require("./attachment");
const jwt = require("./jwt");
const utilities = require("./utilities");
const listingUserService = require("./listingUser");
const userService = require("./user");
const condoService = require("./condo");

exports.indexListingAPI = function(req){
    var paginationParams = utilities.getPaginationParams(req);
    var whereClauses = listingVersionService.buildListingWhereClauses(req, "allListings"); 
    return new Promise(function(resolve, reject){
        listingVersionService.index(paginationParams, whereClauses).then(function(listingVersions){
            resolve(listingVersions);
        }).catch(function(err){
            reject(err);
        });
       
    });
}


exports.indexUserListingAPI = function(req){
    return new Promise(function(resolve, reject){
        var cognitoId = req.params.cognitoId;
        var paginationParams = utilities.getPaginationParams(req);
        var whereClauses = listingVersionService.buildListingWhereClauses(req, "embedListings");
        userService.findAllByCognitoId(cognitoId).then(function(users){
            listingVersionService.index(paginationParams, whereClauses, users).then(function(listingVersion){
                resolve(listingVersion);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexListingMeAPI = function(req){
    return new Promise(function(resolve, reject){
        var authParams = jwt.getAuthParams(req);
        jwt.verifyToken(authParams).then(function(jwtResult){
            var paginationParams = utilities.getPaginationParams(req);
            var cognitoId  = jwtResult["cognito:username"];
            var whereClauses = listingVersionService.buildListingWhereClauses(req, "myListings");
            userService.getAllAssociates(cognitoId).then(function(users){
                listingVersionService.index(paginationParams, whereClauses, users).then(function(listingVersion){
                    resolve(listingVersion);
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

exports.indexMarkersListingAPI = function(req){
    var paginationParams = utilities.getPaginationParams(req);
    var whereClauses = listingVersionService.buildListingWhereClauses(req, "allListings");
    return new Promise(function(resolve, reject){
        listingVersionService.indexMarkers(paginationParams, whereClauses).then(function(markings){
            resolve(markings);
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexUserMarkersListingAPI = function(req){
    return new Promise(function(resolve, reject){
        var paginationParams = utilities.getPaginationParams(req);
        var cognitoId = req.params.cognitoId;
        var whereClauses = listingVersionService.buildListingWhereClauses(req, "embedListings");
        userService.findAllByCognitoId(cognitoId).then(function(users){
            listingVersionService.indexMarkers(paginationParams, whereClauses, users).then(function(listingVersion){
                resolve(listingVersion);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.indexMarkersListingMeAPI = function(req){
    return new Promise(function(resolve, reject){
        var authParams = jwt.getAuthParams(req);
        jwt.verifyToken(authParams).then(function(jwtResult){
            var paginationParams = utilities.getPaginationParams(req);
            var cognitoId = jwtResult["cognito:username"];
            var whereClauses = listingVersionService.buildListingWhereClauses(req, "myListings");
            userService.getAllAssociates(cognitoId).then(function(users){
                listingVersionService.indexMarkers(paginationParams, whereClauses, users).then(function(markings){
                    resolve(markings);
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

exports.findListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingVersionService.find(id).then(function(listingVersion){
            resolve(listingVersion);
        }).catch(function(err){
            reject(err);
        });
    }).catch(function(err){
        reject(err);
    });
}

exports.createListingAPI = function(authParams, body){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            var sequelize = models.sequelize;
            sequelize.transaction().then(function(t){
                listingService.create({},t).then(function(listing){
                    body.ListingId = listing.id;
                    body.owner = jwtResult["cognito:username"]; 
                    listingVersionService.create(body, t).then(function(listingVersion){
                        var listingBody = {
                            latestDraftId: listingVersion.id
                        };
                        listingService.update(listingVersion.ListingId,listingBody, t).then(function(updatedListing){
                            listingUserService.createMe(authParams, listingVersion.id, t).then(function(listingUser){
                                t.commit();
                                listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                                    resolve(finalListingVersion);
                                }).catch(function(err){
                                    t.rollback();
                                    reject(err);
                                });
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        }).catch(function(err){
                            t.rollback();
                            reject(err);
                        });
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
                }).catch(function(err){
                    t.rollback();
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

exports.deleteListingAPI = function(listingId){
    return new Promise(function(resolve, reject){
        var sequelize = models.sequelize;
        sequelize.transaction().then(function (t) {
            var body = {
                latestDraftId: null,
                latestApprovedId: null
            };
            listingService.update(listingId, body, t).then(function(result){
                listingVersionService.deleteAllByListingId(listingId, t).then(function(result){
                    // Find and delete Listing
                    listingService.delete(listingId, t).then(function(result){
                        t.commit();
                        resolve(result);
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
            
                }).catch(function(err){
                    t.rollback(); 
                    reject(err);
                });
            }).catch(function(err){
                t.rollback();
                reject(err);
            });
            return null;
        }).catch(function(err){
            t.rollback();
            reject(err);
        });
    });
}

exports.deleteListingDraftAPI = function(id){
    return new Promise(function(resolve, reject){
        var sequelize = models.sequelize;
        sequelize.transaction().then(function(t){
            var attributes = ["publishStatus", "ListingId"];
            listingVersionService.findAttributes(id, attributes).then(function(listingVersion){
                if (listingVersion.publishStatus === "Draft"){
                    var listingBody = {
                        latestDraftId: null
                    };
                    listingService.update(listingVersion.ListingId, listingBody, t).then(function(listing){
                        listingVersionService.delete(id, t).then(function(deletedListingVersion){
                            t.commit();
                            resolve(deletedListingVersion);
                        }).catch(function(err){
                            t.rollback();
                            reject(err);
                        });
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
                } else {
                    t.rollback();
                    reject("Listing is not a Draft");
                }
            }).catch(function(err){
                t.rollback();
                reject(err);
            });
        }); 
    });
}

exports.moderateListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            if (listing.latestDraftId){
                var body = {
                    publishStatus: "Under Review"
                };
                listingVersionService.update(listing.latestDraftId, body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject("No version in Draft mode to moderate");
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.approveListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            if (listing.latestDraftId ){
                var body = {
                    publishStatus: "Approved"
                };
                listingVersionService.update(listing.latestDraftId, body).then(function(listingVersion){
                    body = {
                        latestDraftId: null,
                        latestApprovedId: listingVersion.id
                    };
                    listingService.update(id, body).then(function(updatedListing){
                        listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                            resolve(finalListingVersion);
                        }).catch(function(err){
                            reject(err);
                        });

                    }).catch(function(err){
                        reject(err);
                    });
                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject("No version in draft mode to moderate");
            } 
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.updateListingAPI = function(id, body){
    return new Promise(function(resolve, reject){
        var sequelize = models.sequelize;
        sequelize.transaction().then(function (t) {
            listingService.find(id, t).then(function(listing){
                if (listing.latestDraftId){
                    listingVersionService.update(listing.latestDraftId,body,t).then(function(listingVersion){
                        listingVersionService.find(listingVersion.id, t).then(function(finalListingVersion){
                            t.commit();
                            resolve(finalListingVersion);
                        })
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
                } else {
                    listingVersionService.copy(listing.latestApprovedId,t).then(function(listingVersion){
                        listingVersionService.update(listingVersion.id, body,t).then(function(newListingVersion){
                            var listingBody = {
                                latestDraftId: listingVersion.id
                            };
                            listingService.update(listingVersion.ListingId, listingBody,t).then(function(newListing){
                                listingVersionService.find(listingVersion.id, t).then(function(finalListingVersion){
                                    t.commit();
                                    resolve(finalListingVersion);
                                });
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        }).catch(function(err){
                            t.rollback();
                            reject(err);
                        });
                    }).catch(function(err){
                        t.rollback()
                        reject(err)
                    });
                }
            }).catch(function(err){
                t.rollback()
                reject(err)
            });
            return null;
        }).catch(function (err) {
            t.rollback();
            reject(err);
        });
    });
}

exports.publishListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            if (listing.latestApprovedId){
                var body = {
                    publishStatus: "On Market"
                };
                listingVersionService.update(listing.latestApprovedId, body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });

                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject("No approved listin to put on market");
            }
        }).catch(function(err){
            reject(err);
        }); 
    });
}

exports.publishDirectListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){

            var latestDraftId = listing.latestDraftId;
            var latestApprovedId = listing.latestApprovedId;
            
            if (listing.latestDraftId){
                var body = {
                    publishStatus: "On Market"
                };
                listingVersionService.update(listing.latestDraftId, body).then(function(listingVersion){

                    if (latestApprovedId){
                        var body = {
                            publishStatus: "Archived"
                        };
                        listingVersionService.update(latestApprovedId,body).then(function(archivedListingVersion){
                            var listingBody = {
                                latestDraftId: null,
                                latestApprovedId: listingVersion.id
                            };
                            listingService.update(listingVersion.ListingId, listingBody).then(function(newListing){
                                listingVersionService.find(newListing.latestApprovedId).then(function(finalListingVersion){
                                    resolve(finalListingVersion);
                                }).catch(function(err){
                                    reject(err);
                                });
                            }).catch(function(err){
                                reject(err);
                            });
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {


                        var listingBody = {
                            latestDraftId: null,
                            latestApprovedId: listingVersion.id
                        };
                        listingService.update(listingVersion.ListingId, listingBody).then(function(newListing){
                    
                            listingVersionService.find(newListing.latestApprovedId).then(function(finalListingVersion){
                                resolve(finalListingVersion);
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
            } else if (listing.latestApprovedId){
                var body = {
                    publishStatus: "On Market"
                };
                listingVersionService.update(listing.latestApprovedId, body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });

                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject("No approved listing to put on market");
            }
        }).catch(function(err){
            reject(err);
        }); 
    });
}

exports.unPublishListingAPI = function(id){
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            if (listing.latestApprovedId){
                var body = {
                    publishStatus: "Off Market"
                };
                listingVersionService.update(listing.latestApprovedId, body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });

                }).catch(function(err){
                    reject(err);
                });
            } else {
                reject("No approved listin to put on market");
            }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getListingVersionsAdmin = function(req){
    return new Promise(function(resolve, reject){
       var authParams = jwt.getAuthParams(req);
       jwt.verifyToken(authParams).then(function(jwtResult){ 
           if (jwt.isAdmin(jwtResult)){
               var paginationParams = utilities.getPaginationParams(req);
               var whereClauses = listingVersionService.buildAdminListingWhereClauses(req);
               listingVersionService.indexAdmin(paginationParams, whereClauses).then(function(listingVersions){
                   resolve(listingVersions);
               }).catch(function(err){
                   reject(err);
               });
           } else {
               reject(utilities.notAuthorized());
           }
        }).catch(function(err){
            reject(err);
        });
    });
}

exports.getListingsAdmin = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
       listingService.indexAdmin(page, limit, offset, where).then(function(listings){
           resolve(listings);
       }).catch(function(err){
           reject(err);
       });
    });
}

exports.createAssociationAPI = function(body, associatedTable){
    return new Promise(function(resolve, reject){

        if (associatedTable === "unit"){
            var createAssociatedRecord = unitService.createUnit;
        }
        if (associatedTable === "space"){
            var createAssociatedRecord = spaceService.createSpace;
        }
        if (associatedTable === "portfolio"){
            var createAssociatedRecord = portfolioService.createPortfolio;
        }
        if (associatedTable === "tenant"){
            var createAssociatedRecord = tenantService.createTenant;
        }
        if (associatedTable === "image"){
            var createAssociatedRecord = imageService.createImage;
        }
        if (associatedTable === "attachment"){
            var createAssociatedRecord = attachmentService.createAttachment;
        }
        if (associatedTable === "broker"){
            var createAssociatedRecord = listingUserService.createBroker;
        }
        if (associatedTable === "condo"){
            var createAssociatedRecord = condoService.createCondo;
        }

        var sequelize = models.sequelize;
        sequelize.transaction().then(function(t){
            var attributes = ["ListingId"];
            listingVersionService.findAttributes(body.ListingVersionId, attributes, t).then(function(listingVersion){
                listingService.find(listingVersion.ListingId, t).then(function(listing){
                    if (listing.latestDraftId){
                        createAssociatedRecord(body, t).then(function(newAssociation){
                            t.commit();
                            resolve(newAssociation);
                        }).catch(function(err){
                            t.rollback();
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId, t).then(function(copied){
                             body.ListingVersionId = copied.id;
                             createAssociatedRecord(body, t).then(function(newAssociation){
                                 var listingBody = {
                                     latestDraftId: copied.id
                                 };
                                 listingService.update(copied.ListingId, listingBody, t).then(function(updatedListing){
                                     t.commit();
                                     resolve(newAssociation);
                                 }).catch(function(err){
                                     t.rollback();
                                     reject(err);
                                 });
                             }).catch(function(err){
                                 t.rollback();
                                 reject(err);
                             });
                         }).catch(function(err){
                             t.rollback();
                             reject(err);
                         });
                    }
                }).catch(function(err){
                    t.rollback();
                    reject(err);
                });
            }).catch(function(err){
                t.rollback();
                reject(err);
            });
        });
    });
}

exports.updateAssociationAPI = function(id, body, associatedTable){
    return new Promise(function(resolve, reject){
        if (associatedTable === "unit"){
            var findAssociatedRecord = unitService.find;
            var updateAssociatedRecord = unitService.update;
            var findWithPreviousAssociatedRecord = unitService.findWithPrevious;
        }
        if (associatedTable === "space"){
            var findAssociatedRecord = spaceService.find;
            var updateAssociatedRecord = spaceService.updateSpace;
            var findWithPreviousAssociatedRecord = spaceService.findWithPrevious;
        }
        if (associatedTable === "portfolio"){
            var findAssociatedRecord = portfolioService.find;
            var updateAssociatedRecord = portfolioService.update;
            var findWithPreviousAssociatedRecord = portfolioService.findWithPrevious;
        }
        if (associatedTable === "tenant"){
            var findAssociatedRecord = tenantService.find;
            var updateAssociatedRecord = tenantService.update;
            var findWithPreviousAssociatedRecord = tenantService.findWithPrevious;
        }
        if (associatedTable === "image"){
            var findAssociatedRecord = imageService.find;
            var updateAssociatedRecord = imageService.updateImage;
            var findWithPreviousAssociatedRecord = imageService.findWithPrevious;
        }
        if (associatedTable === "attachment"){
            var findAssociatedRecord = attachmentService.find;
            var updateAssociatedRecord = attachmentService.updateAttachment;
            var findWithPreviousAssociatedRecord = attachmentService.findWithPrevious;
        }
        if (associatedTable === "broker"){
            var findAssociatedRecord = listingUserService.find;
            var updateAssociatedRecord = listingUserService.update;
            var findWithPreviousAssociatedRecord = listingUserService.findWithPrevious;
        }
        if (associatedTable === "condo"){
            var findAssociatedRecord = condoService.find;
            var updateAssociatedRecord = condoService.update;
            var findWithPreviousAssociatedRecord = condoService.findWithPrevious;
        }

        var sequelize = models.sequelize;
        sequelize.transaction().then(function(t){
            findAssociatedRecord(id,t).then(function(associatedRecord){
                var attributes = ["ListingId"];
                listingVersionService.findAttributes(associatedRecord.ListingVersionId,attributes, t).then(function(listingVersion){
                    listingService.find(listingVersion.ListingId, t).then(function(listing){
                        if (listing.latestDraftId){
                            updateAssociatedRecord(id, body, t).then(function(associatedRecord){
                                t.commit();
                                resolve(associatedRecord);
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        } else {
                            listingVersionService.copy(listing.latestApprovedId, t).then(function(copied){
                                findWithPreviousAssociatedRecord(id,t).then(function(foundAssociatedRecord){
                                    delete body.ListingVersionId;
                                    delete body.id;
                                    delete body.PreviousVersionId;
                                    updateAssociatedRecord(foundAssociatedRecord.id, body, t).then(function(updatedAssociatedRecord){
                                        var listingBody = {
                                            latestDraftId: copied.id
                                        };
                                        listingService.update(copied.ListingId, listingBody, t).then(function(updatedListing){
                                            t.commit();
                                            resolve(updatedAssociatedRecord);
                                        }).catch(function(err){
                                            t.rollback();
                                            reject(err);
                                        });
                                    }).catch(function(err){
                                        t.rollback();
                                        reject(err);
                                    });
                                }).catch(function(err){
                                    t.rollback();
                                    reject(err);
                                });
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        }
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
                }).catch(function(err){
                    t.rollback(); 
                    reject(err);
                });
            }).catch(function(err){
                t.rollback();
                reject(err);
            });
        });
    });
}

exports.deleteAssociationAPI = function(id, associatedTable){
    return new Promise(function(resolve, reject){
        if (associatedTable === "unit"){
            var findAssociatedRecord = unitService.find;
            var deleteAssociatedRecord = unitService.destroy;
            var findWithPreviousAssociatedRecord = unitService.findWithPrevious;
        }
        if (associatedTable === "space"){
            var findAssociatedRecord = spaceService.find;
            var deleteAssociatedRecord = spaceService.deleteSpace;
            var findWithPreviousAssociatedRecord = spaceService.findWithPrevious;
        }
        if (associatedTable === "portfolio"){
            var findAssociatedRecord = portfolioService.find;
            var deleteAssociatedRecord = portfolioService.destroy;
            var findWithPreviousAssociatedRecord = portfolioService.findWithPrevious;
        }
        if (associatedTable === "tenant"){
            var findAssociatedRecord = tenantService.find;
            var deleteAssociatedRecord = tenantService.deleteTenant;
            var findWithPreviousAssociatedRecord = tenantService.findWithPrevious;
        }
        if (associatedTable === "image"){
            var findAssociatedRecord = imageService.find;
            var deleteAssociatedRecord = imageService.deleteImage;
            var findWithPreviousAssociatedRecord = imageService.findWithPrevious;
        }
        if (associatedTable === "attachment"){
            var findAssociatedRecord = attachmentService.find;
            var deleteAssociatedRecord = attachmentService.deleteAttachment;
            var findWithPreviousAssociatedRecord = attachmentService.findWithPrevious;
        };
        if (associatedTable === "broker"){
            var findAssociatedRecord = listingUserService.find;
            var deleteAssociatedRecord = listingUserService.deleteBroker;
            var findWithPreviousAssociatedRecord = listingUserService.findWithPrevious;
        }
        if (associatedTable === "condo"){
            var findAssociatedRecord = condoService.find;
            var deleteAssociatedRecord = condoService.deleteCondo;
            var findWithPreviousAssociatedRecord = condoService.findWithPrevious;
        }

        var sequelize = models.sequelize;
        sequelize.transaction().then(function(t){
            findAssociatedRecord(id,t).then(function(associatedRecord){
                var attributes = ["ListingId"];
                listingVersionService.findAttributes(associatedRecord.ListingVersionId,attributes, t).then(function(listingVersion){
                    listingService.find(listingVersion.ListingId, t).then(function(listing){
                        if (listing.latestDraftId){
                            deleteAssociatedRecord(id, t).then(function(associatedRecord){
                                t.commit();
                                resolve(listing);
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        } else {
                            listingVersionService.copy(listing.latestApprovedId, t).then(function(copied){
                                findWithPreviousAssociatedRecord(id,t).then(function(foundAssociatedRecord){
                                    deleteAssociatedRecord(foundAssociatedRecord.id, t).then(function(deletedResult){
                                        var listingBody = {
                                            latestDraftId: copied.id
                                        };
                                        listingService.update(copied.ListingId, listingBody, t).then(function(updatedListing){
                                            t.commit();
                                            resolve(updatedListing);
                                        }).catch(function(err){
                                            t.rollback();
                                            reject(err);
                                        });
                                    }).catch(function(err){
                                        t.rollback();
                                        reject(err);
                                    });
                                }).catch(function(err){
                                    t.rollback();
                                    reject(err);
                                });
                            }).catch(function(err){
                                t.rollback();
                                reject(err);
                            });
                        }
                    }).catch(function(err){
                        t.rollback();
                        reject(err);
                    });
                }).catch(function(err){
                    t.rollback(); 
                    reject(err);
                });
            }).catch(function(err){
                t.rollback();
                reject(err);
            });
        });
    });
}

exports.getListingsUsersAssociatesMe = function(authParams){
    return new Promise(function(resolve, reject){
        jwt.verifyToken(authParams).then(function(jwtResult){
            var cognitoId  = jwtResult["cognito:username"];
            userService.getAllAssociates2(cognitoId, "record").then(function(associates){
                resolve(associates);
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

