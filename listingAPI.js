const models = require("./models");
const listingService = require("./listing");
const listingVersionService = require("./listingVersion");

exports.indexListingAPI = function(page, limit, offset, where){
    return new Promise(function(resolve, reject){
        listingVersionService.index(page, limit, offset, where).then(function(listingVersions){
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
            console.log("findListingAPI error 1: "+err);
            reject(err);
        });
    }).catch(function(err){
        console.log("findListingAPI error 2: "+err);
        reject(err);
    });
}

exports.createListingAPI = function(body){
    return new Promise(function(resolve, reject){
        listingService.create().then(function(listing){
            console.log("listing: "+JSON.stringify(listing));
            body.ListingId = listing.id;   
            listingVersionService.create(body).then(function(listingVersion){
                console.log("listingVersion: "+JSON.stringify(listingVersion));
                var listingBody = {
                    latestDraftId: listingVersion.id
                };
                listingService.update(listingVersion.ListingId,listingBody).then(function(updatedListing){
                    console.log("updatedListing: "+JSON.stringify(updatedListing));
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
    console.log("updateListingAPI: id: "+id);
    console.log("body: "+JSON.stringify(body));
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            console.log("updateListingAPI: listing: "+JSON.stringify(listing));
            if (listing.latestDraftId){
                listingVersionService.update(listing.latestDraftId,body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        resolve(finalListingVersion);
                    }).catch(function(err){
                        reject(err);
                    });
                }).catch(function(err){
                    reject(err);
                });
            } else {
                console.log("updateListingAPI: listing.latestApprovedId; "+listing.latestApprovedId);
                listingVersionService.copy(listing.latestApprovedId).then(function(listingVersion){
                    console.log("updateListingAPI: listingVersion.id: "+listingVersion.id);
                    console.log("body: "+JSON.stringify(body));
                    listingVersionService.update(listingVersion.id, body).then(function(newListingVersion){
                        var listingBody = {
                            latestDraftId: listingVersion.id
                        };
                        listingService.update(listingVersion.ListingId, listingBody).then(function(newListing){
                            listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                                resolve(finalListingVersion);
                            }).catch(function(err){
                                console.log("err1: "+err);
                                reject(err);
                            });
                        }).catch(function(err){
                            console.log("err2: "+err);
                            reject(err);
                        });
                    }).catch(function(err){
                        console.log("err3: "+err);
                        reject(err);
                    });
                }).catch(function(err){
                    console.log("err4: "+err);
                    reject(err);
                });
            }
        }).catch(function(err){
            console.log("err5: "+err);
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
    console.log("id: "+id);
    return new Promise(function(resolve, reject){
        listingService.find(id).then(function(listing){
            console.log("listing: "+JSON.stringify(listing));
            if (listing.latestDraftId){
                var body = {
                    publishStatus: "On Market"
                };
                listingVersionService.update(listing.latestDraftId, body).then(function(listingVersion){
                   console.log("listingVersion: "+JSON.stringify(listingVersion));
                    var listingBody = {
                        latestDraftId: null,
                        latestApprovedId: listingVersion.id
                    };
                    listingService.update(listingVersion.ListingId, listingBody).then(function(newListing){
                        console.log("newListing: "+JSON.stringify(newListing));
                    
                        listingVersionService.find(newListing.latestApprovedId).then(function(finalListingVersion){
                            console.log("finalListingVerion: "+JSON.stringify(finalListingVersion));
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
            } else if (listing.latestApprovedId){
                var body = {
                    publishStatus: "On Market"
                };
                listingVersionService.update(listing.latestApprovedId, body).then(function(listingVersion){
                    listingVersionService.find(listingVersion.id).then(function(finalListingVersion){
                        console.log("finalListingVerion: "+JSON.stringify(finalListingVersion));
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

