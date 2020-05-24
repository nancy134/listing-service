const models = require("./models");
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");
const unitService = require("./unit");

exports.indexListingAPI = function(page, limit, offset, where, spaceWhere){
    return new Promise(function(resolve, reject){
        listingVersionService.index(page, limit, offset, where, spaceWhere).then(function(listingVersions){
            resolve(listingVersions);
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

exports.createListingAPI = function(body){
    return new Promise(function(resolve, reject){
        listingService.create().then(function(listing){
            body.ListingId = listing.id;   
            listingVersionService.create(body).then(function(listingVersion){
                var listingBody = {
                    latestDraftId: listingVersion.id
                };
                listingService.update(listingVersion.ListingId,listingBody).then(function(updatedListing){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });
                }).catch(function(err){
                });
            }).catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
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
    var sequelize = models.sequelize;
    return new Promise(function(resolve, reject){
        sequelize.transaction().then(function (t) {
            listingService.find(id).then(function(listing){
                if (listing.latestDraftId){
                    listingVersionService.update(listing.latestDraftId,body,t).then(function(listingVersion){
                        listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
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
                                listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
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

exports.getListingVersionsAdmin = function(page, limit, offset, where){
    console.log("listingAPI.getListingVersionsAdmin");
    return new Promise(function(resolve, reject){
       listingVersionService.indexAdmin(page, limit, offset, where).then(function(listingVersions){
           resolve(listingVersions);
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

exports.createAssociationAPI = function(body, associatedTable){ // CHANGED
    return new Promise(function(resolve, reject){

        if (associatedTable === "unit"){
            var createAssociatedRecord = unitService.createUnit;
        }
        listingVersionService.find(body.ListingVersionId).then(function(listingVersion){
            listingService.find(listingVersion.listing.ListingId).then(function(listing){
                if (listing.latestDraftId){
                        createAssociatedRecord(body).then(function(newAssociation){ // CHANGED
                            resolve(newAssociation); // CHANGED
                        }).catch(function(err){
                            reject(err);
                        });
                } else {
                    listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                         body.ListingVersionId = copied.id;
                             createAssociatedRecord(body).then(function(newAssociation){ // CHANGED
                                 var listingBody = {
                                     latestDraftId: copied.id
                                 };
                                 listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                     resolve(newAssociation);  // CHANGED
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

exports.updateAssociationAPI = function(id, body, associatedTable){
    return new Promise(function(resolve, reject){
        if (associatedTable === "unit"){
            var findAssociatedRecord = unitService.find;
            var updateAssociatedRecord = unitService.update;
            var findWithPreviousAssociatedRecord = unitService.findWithPrevious;
        }
        findAssociatedRecord(id).then(function(associatedRecord){
            listingVersionService.find(associatedRecord.ListingVersionId).then(function(listingVersion){
                listingService.find(listingVersion.listing.ListingId).then(function(listing){
                    if (listing.latestDraftId){
                        console.log("body: "+JSON.stringify(body));
                        updateAssociatedRecord(id, body).then(function(associatedRecord){
                            resolve(associatedRecord);
                        }).catch(function(err){
                            reject(err);
                        });
                    } else {
                        listingVersionService.copy(listing.latestApprovedId).then(function(copied){
                            findWithPreviousAssociatedRecord(id).then(function(foundAssociatedRecord){
                                delete body.ListingVersionId;
                                delete body.id;
                                updateAssociatedRecord(foundAssociatedRecord.id, body).then(function(updatedAssociatedRecord){
                                    var listingBody = {
                                        latestDraftId: copied.id
                                    };
                                    listingService.update(copied.ListingId, listingBody).then(function(updatedListing){
                                        resolve(updatedAssociatedRecord);
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

