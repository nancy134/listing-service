'/ause strict';

const express = require('express');
const Sequelize = require('sequelize');
const models = require("./models");
const bodyParser = require('body-parser');
const cors = require('cors');
const imageService = require('./image');
const attachmentService = require('./attachment');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const listingService = require('./listing');
const spaceService = require('./space');
const unitService = require('./unit');
const tenantService = require('./tenant');
const portfolioService = require('./portfolio');
const listingAPIService = require('./listingAPI');
const listingServices = require("./listing");
const listingVersionService = require("./listingVersion");
const statusEventService = require("./statusEvent");
const listService = require("./list");
const listItemService = require("./listItem");
const billingCalculationService = require("./billingCalculation");
const jwt = require("./jwt");
const utilities = require("./utilities");

const { Op } = require("sequelize");


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

function formatError(err){
    if (err.message){
        var ret = {
            message: err.message
        };
    } else {
        var ret = {
            message: err
        };
    }
    return(ret);
}
function errorResponse(res, err){
    if (err.statusCode){
        res.status(err.statusCode).send(err);
    } else {
        res.status(400).send(err);
    }
}
app.get('/', (req, res) => {
  res.send("listing service");
});

app.get('/listings', (req, res) => {
    listingAPIService.indexListingAPI(req).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/listings/me', (req, res) => {
    listingAPIService.indexListingMeAPI(req).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/listingMarkers', (req, res) => {
    listingAPIService.indexMarkersListingAPI(req).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/listingMarkers/me', (req, res) => {
    listingAPIService.indexMarkersListingMeAPI(req).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/admin/listings', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    if (req.query.ListingId){
        where = {id: req.query.ListingId};
    }
    var getListingsPromise = listingAPIService.getListingsAdmin(page, limit, offset, where);
    getListingsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).send(err);
    });
});
app.get('/admin/listingVersions', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    if (req.query.ListingId){
        where = {ListingId: req.query.ListingId};
    }
    var getListingVersionsPromise = listingAPIService.getListingVersionsAdmin(page, limit, offset, where);
    getListingVersionsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).send(err);
    });
});

app.post('/upload', upload.single('image'), function(req, res, next) {
  var body = {
      ListingVersionId: req.body.listing_id,
      path: req.file.path,
      originalname: req.file.originalname,
      table: 'listing',
      tableId: req.body.listing_id,
      order: req.body.order
  };
  var createAPIPromise = imageService.createAPI(body);
  createAPIPromise.then(function(image){
      res.json(image);
  }).catch(function(err){
      res.json(err);
  });
});

app.get('/image/:id', (req,res) => {
    models.Image.findOne({
        where: {
            id: req.params.id
        }
    }).then(image => {
        res.json(image);
    }).catch(err => {
        res.json(err);
    });

});

app.get('/enums', (req, res) => {
    res.json({
        states: models.ListingVersion.rawAttributes.state.values,
        listingTypes: models.ListingVersion.rawAttributes.listingType.values,
        //propertyTypes: models.ListingVersion.rawAttributes.propertyType.values,
        spaceTypes: models.Space.rawAttributes.type.values,
        spaceUses: models.Space.rawAttributes.use.values,
        spaceDivisibles: models.Space.rawAttributes.divisible.values,
        portfolioTypes: models.Portfolio.rawAttributes.type.values,
        amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values,
        priceUnits: models.Space.rawAttributes.priceUnit.values,
        propertyTypes: models.ListingVersion.rawAttributes.propertyTypes.type.options.type.values

    });
});

app.get('/spaceUses', (req, res) => {
    res.json({
        spaceUses: models.Space.rawAttributes.use.values
    });
});

app.get('/listingTypes', (req, res) => {
    res.json({
        listingTypes: models.ListingVersion.rawAttributes.listingType.values
    });
});

app.post('/image', (req, res) => {
   var description = req.body.description;
   var ListingVersionId = req.body.listingId;
   models.Image.create({
       description: description,
       ListingVersionId: ListingVersionId
   }).then(image => {
       res.json(image);
   }).catch(err => {
       res.json(err);
   });
});

app.get('/listing/:listing_id/spaces', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = {ListingVersionId: req.params.listing_id};
    var getSpacesPromise = spaceService.getSpaces(page, limit, offset, where);
    getSpacesPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });  
});
app.get('/listing/:listing_id/units', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = {ListingVersionId: req.params.listing_id};
    var getUnitsPromise = unitService.getUnits(page, limit, offset, where);
    getUnitsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/listing/:listing_id/tenants', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = {ListingVersionId: req.params.listing_id};
    var getTenantsPromise = tenantService.getTenants(page, limit, offset, where);
    getTenantsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/listing/:listing_id/portfolios', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = {ListingVersionId: req.params.listing_id};
    var getPortfoliosPromise = portfolioService.getTenants(page, limit, offset, where);
    getPortfoliosPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/spaces', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;;
    if (req.query.owner) where = { owner: req.query.owner};
    var getSpacesPromise = spaceService.getSpaces(page, limit, offset, where);
    getSpacesPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});


app.get('/units', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;;
    var getUnitsPromise = unitService.getUnits(page, limit, offset, where);
    getUnitsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/tenants', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;;
    var getTenantsPromise = tenantService.getTenants(page, limit, offset, where);
    getTenantsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/images', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    var getImagesPromise = imageService.getImages(page, limit, offset, where);
    getImagesPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.get('/addresses', (req, res) => {
    var address = req.query.address;
    var city = req.query.city;
    var state = req.query.state;
    var owner = req.query.owner;
    var getAddressPromise = listingVersionService.findAddress(address,city,state, owner);
    getAddressPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).json(err); 
    });
});

app.get('/tenants/:id', (req, res) => {
    var getTenantPromise = tenantService.find(req.params.id);
    getTenantPromise.then(function(tenant){
        res.json(tenant);
    }).catch(function(err){
        res.status(400).json(err);
    });
});
app.get('/portfolios', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;;
    var getPortfoliosPromise = portfolioService.getPortfolios(page, limit, offset, where);
    getPortfoliosPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
        res.send(err);
    });
});
app.get('/listings/:id', (req, res) => {
    var getListingPromise = listingAPIService.findListingAPI(req.params.id);
    getListingPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});
app.put('/listings/:id', (req, res) => {
    var updateListingPromise = listingAPIService.updateListingAPI(req.params.id, req.body);
    updateListingPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).json(err);
        console.log("err: "+err);
    });
});
app.delete('/listings/:id', (req, res) => {
    var deleteListingPromise = listingAPIService.deleteListingAPI(req.params.id);
    deleteListingPromise.then(function(result){
       res.json(result);
    }).catch(function(err){
       res.status(400).json(err);
    });
});

app.delete('/listingVersions/:id', (req, res) => {
    var deleteListingVersionPromise = listingAPIService.deleteListingDraftAPI(req.params.id);
    deleteListingVersionPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        res.status(400).json(err);
    });
});

app.delete('/images/:id', (req, res) => {
    var deleteImagePromise = imageService.deleteAPI(req.params.id);
    deleteImagePromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).json(err);
    });
});

app.put('/spaces/:id', (req, res) => {
    var updateData = {
        id: req.params.id,
        body: req.body
    }
    //var updateSpacePromise = spaceService.updateSpace(updateData);
    updateSpacePromise = spaceService.updateAPI(req.params.id, req.body);
    updateSpacePromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.put('/units/:id', (req, res) => {
    var updateUnitPromise = unitService.updateAPI(req.params.id, req.body);
    updateUnitPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.put('/tenants/:id', (req, res) => {
    var updateTenantPromise = tenantService.updateAPI(req.params.id, req.body);
    updateTenantPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.put('/portfolios/:id', (req, res) => {
    var updatePortfolioPromise = portfolioService.updateAPI(req.params.id, req.body);
    updatePortfolioPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);

    });
});

app.put('/images/:id', (req, res) => {
    var updateImagePromise = imageService.updateAPI(req.params.id, req.body);
    updateImagePromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.post('/listings', (req, res) => {
   var authParams = jwt.getAuthParams(req);
   var createListingPromise = listingAPIService.createListingAPI(authParams, req.body);
   createListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log(err);
       res.status(500).send(err);
   });
});

app.post('/listings/:id/moderations', (req, res) => {
   var moderateListingPromise = listingAPIService.moderateListingAPI(req.params.id);
   moderateListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       res.status(500).send(err);
   });
});

app.post('/listings/:id/approvals', (req, res) => {
   var approveListingPromise = listingAPIService.approveListingAPI(req.params.id);
   approveListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("/listings/:id/approvals error: "+err);
       res.status(500).send(err);
   });
});

app.post('/listings/:id/publications', (req, res) => {
 var publishListingPromise = listingAPIService.publishListingAPI(req.params.id);
   publishListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("/listings/:id/publications error: "+err);
       res.state(500).send(err);
   });
});

app.post('/listings/:id/directPublications', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    listingAPIService.publishDirectListingAPI(req.params.id).then(function(publishResult){
        var body = {
            ListingId: req.params.id,
            publishStatus: "On Market",
            owner: publishResult.listing.owner
        }
        statusEventService.create(body).then(function(statusResult){
            res.json(publishResult);
        }).catch(function(err){
            var ret = formatError(err);
            res.status(400).json(ret);
        });
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.delete('/listings/:id/publications', (req, res) => {
   var authParams = jwt.getAuthParams(req);
   listingAPIService.unPublishListingAPI(req.params.id).then(function(publishResult){
       var body = {
           ListingId: req.params.id,
           publishStatus: "Off Market",
           owner: publishResult.listing.owner
       };
       statusEventService.create(body).then(function(statusResult){
           res.json(publishResult);
       }).catch(function(err){
           var ret = formatError(err);
           res.status(400).json(ret);
       });
   }).catch(function(err){
       var ret = formatError(err);
       res.status(400).json(err);
   });
});
/*
app.post('/listing/:id/draft', (req, res) => {
    var createNewDraftPromise = listingService.createNewDraftAPI(req.params.id);
    createNewDraftPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});
*/
app.post('/spaces', (req, res) => {
    var createSpacePromise = spaceService.createAPI(req.body);
    createSpacePromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/units', (req, res) => {
    var createUnitPromise = unitService.createAPI(req.body);
    createUnitPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.post('/tenants', (req, res) => {
    var createTenantPromise = tenantService.createAPI(req.body);
    createTenantPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.post('/portfolios', (req, res) => {
    var createPortfolioPromise = portfolioService.createAPI(req.body);
    createPortfolioPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.delete('/spaces/:id', (req, res) => {
    var deleteSpacePromise = spaceService.deleteAPI(req.params.id);
    deleteSpacePromise.then(function(result){
        console.log("server:delete:spaces: "+JSON.stringify(result));
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.post('/statusEvents', (req, res) => {
    statusEventService.create(req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.get('/statusEvents', (req, res) => {
    var page = req.query.page || 1;
    var limit = req.query.perPage || 20;
    var offset = (parseInt(page)-1)*parseInt(limit);
    var where = null; 
    statusEventService.index(page, limit, offset, where).then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

//////////////////////////////////
// lists and listItems
//////////////////////////////////

app.post('/lists/me', (req, res) => {
   var authParams = jwt.getAuthParams(req);
   listService.createMe(authParams, req.body).then(function(result){
       res.json(result);
   }).catch(function(err){
       errorResponse(res, err);
   });
});

app.put('/lists/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    listService.updateMe(authParams, req.params.id, req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.delete('/lists/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    listService.deleteMe(authParams, req.params.id).then(function(result){
        res.json(result);
    }).catch(function(err){
        errorResponse(res, err);
    });
});

app.get('/lists/me', (req, res) => {
   var authParams = jwt.getAuthParams(req);
   var paginationParams = utilities.getPaginationParams(req);
   listService.indexMe(authParams, paginationParams).then(function(result){
       res.json(result);
   }).catch(function(err){
       errorResponse(res, err);
   });
});

app.post('/lists/:ListId/listItems/me', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    var listId = req.params.ListId;
    listItemService.createMe(authParams, listId, req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.get('/lists/:ListId/listItems/me', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    var paginationParams = utilities.getPaginationParams(req);
    var ListId = req.params.ListId;
    listItemService.indexMe(ListId, authParams, paginationParams).then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log(err);
        errorResponse(res, err);
    });
});

app.delete('/listItems/:id', (req, res) => {
    var authParams = jwt.getAuthParams(req);
    listItemService.deleteListItemMe(req.params.id, authParams).then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(500).json(ret);
    }); 
});

app.post('/billingCycles/play', (req, res) => {
    var billingCycleStart = req.body.start;
    var billingCycleEnd = req.body.end;
    var billingCycleId = req.body.id;
    var authParams = jwt.getAuthParams(req);
    jwt.verifyToken(authParams).then(function(jwtResult){
        if (jwt.isAdmin(jwtResult)){
            billingCalculationService.playBillingCycle(authParams, billingCycleStart, billingCycleEnd, billingCycleId);
            res.send("billing cycle calculation started");
        } else {
            ret = utilities.notAuthorizedResponse();
            reject(ret);
        }
    }).catch(function(err){
        res.send(err);
    });
});

//////////////
//
// Attachments
//
//////////////
app.post('/uploadAttachment', upload.single('attachment'), function(req, res, next) {
  console.log("uploadAttachment()");
  var body = {
      ListingVersionId: req.body.listing_id,
      path: req.file.path,
      originalname: req.file.originalname,
      table: 'listing',
      tableId: req.body.listing_id,
      order: req.body.order,
      name: req.body.name
  };
  console.log("body:");
  console.log(body);
  attachmentService.createAPI(body).then(function(attachment){
      res.json(attachment);
  }).catch(function(err){
      res.json(err);
  });
});

app.delete('/attachments/:id', (req, res) => {
    attachmentService.deleteAPI(req.params.id).then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).json(err);
    });
});

app.put('/attachments/:id', (req, res) => {
    attachmentServce.updateAPI(req.params.id, req.body).then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.status(400).json(ret);
    });
});

app.listen(PORT, HOST);
