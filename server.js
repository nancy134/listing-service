'ause strict';

const express = require('express');
const Sequelize = require('sequelize');
const models = require("./models");
const bodyParser = require('body-parser');
const cors = require('cors');
const imageService = require('./image');
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
const { Op } = require("sequelize");
const _ = require("lodash");


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

function desymbolize(o) {
  if (Array.isArray(o)) {
    return o.map(desymbolize);
  } else if (typeof o != "object") {
    return o;
  } else {
    let d = Object.assign(Object.create(Object.getPrototypeOf(o)), o);
    Object.getOwnPropertySymbols(o).forEach(k => {
      d[`<${Symbol.keyFor(k)}>`] = o[k];
      delete d[k];
    });
    Object.keys(d).forEach(k => d[k] = desymbolize(d[k]));
    return d;
  }
}

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
app.get('/', (req, res) => {
  res.send("listing service");
});

app.get('/listings', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    var spaceWhere = null;

    // Listing Type
    var listingTypes = null;
    if (req.query.ListingType){
       if (req.query.ListingType !== 'All'){
           listingTypes = [req.query.ListingType];
       }
    }

    // Location
    var contains = "";
    if (req.query.lat0){
    var lat0 = req.query.lat0;
    var lng0 = req.query.lng0;
    var lat1 = req.query.lat1;
    var lng1 = req.query.lng1;
    var a = lat0 + " " + lng0;
    var b = lat1 + " " + lng0;
    var c = lat1 + " " + lng1;
    var d = lat0 + " " + lng1;
    var e = lat0 + " " + lng0;
    var boundingBox = `${a},${b},${c},${d},${e}`;
    var geom = Sequelize.fn('ST_GEOMFROMTEXT', boundingBox);
    contains = Sequelize.fn(
        'ST_CONTAINS',
        Sequelize.fn('ST_POLYFROMTEXT', `POLYGON((${a},${b},${c},${d},${e}))`),
        Sequelize.col('location')
    );
    }
    // Owner & publishStatus
    if (req.query.owner){
        where = {
            owner: req.query.owner,
            [Op.or]: [
                {publishStatus: 'Draft'}, 
                {[Op.and]: [ 
                   {publishStatus: 'On Market'},
                   {'$listing.latestDraftId$': null},
                   contains
                ]} 
            ],
        };
    } else {
        where = {
            [Op.and]: [
                {publishStatus: 'On Market'},
                contains
            ]
        };
    }

    if (listingTypes) where.listingType = {[Op.or]: listingTypes};

    var spaceWhere = null;
    var spaceAndClause = {};

    // Use
    if (req.query.spaceUse){
        spaceAndClause.use = { [Op.or]: req.query.spaceUse} 
    }

    // Size
    if (req.query.minSize && req.query.maxSize){
        spaceAndClause.size = {[Op.gte]: req.query.minSize, [Op.lte]: req.query.maxSize};
    } else if (req.query.minSize && !req.query.maxSize){
        spaceAndClause.size = {[Op.gte]: req.query.minSize};
    } else if (!req.query.minSize && req.query.maxSize){
        spaceAndClause.size = {[Op.lte]: req.query.maxSize};
    }

    // Price 
    if (req.query.minRate && req.query.maxRate){
        spaceAndClause.price = {[Op.gte]: req.query.minRate, [Op.lte]: req.query.maxRate};
    } else if (req.query.minRate && !req.query.maxRate){
        spaceAndClause.price = {[Op.gte]: req.query.minRate};
    } else if (!req.query.minRate && req.query.maxRate){
        spaceAndClause.price = {[Op.lte]: req.query.maxRate};
    }
    var isEmpty = _.isEmpty(spaceAndClause); 
    if (!isEmpty){
        spaceWhere = {
            [Op.and]: spaceAndClause
        };
        sW = desymbolize(spaceWhere);
    }
   
    var getListingsPromise = listingAPIService.indexListingAPI(page, limit, offset, where, spaceWhere);
    getListingsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        res.status(400).send(err);
    });
});

app.get('/admin/listings', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
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
    var getListingVersionsPromise = listingAPIService.getListingVersionsAdmin(page, limit, offset, where);
    getListingVersionsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("Error /admin/listingVersions: "+err);
        res.status(400).send(err);
    });
});

app.post('/upload', upload.single('image'), function(req, res, next) {
  var body = {
      ListingVersionId: req.body.listing_id,
      path: req.file.path,
      originalname: req.file.originalname,
      table: 'listing',
      tableId: req.body.listing_id
  };
  var createAPIPromise = imageService.createAPI(body);
  createAPIPromise.then(function(image){
      console.log("image; "+JSON.stringify(image));
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
        propertyTypes: models.ListingVersion.rawAttributes.propertyType.values,
        spaceTypes: models.Space.rawAttributes.type.values,
        spaceUses: models.Space.rawAttributes.use.values,
        spaceDivisibles: models.Space.rawAttributes.divisible.values,
        portfolioTypes: models.Portfolio.rawAttributes.type.values,
        amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values

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

app.get('/tenants/:id', (req, res) => {
    console.log("req.params.id: "+req.params.id);
    var getTenantPromise = tenantService.find(req.params.id);
    getTenantPromise.then(function(tenant){
        console.log('tenant: '+tenant);
        res.json(tenant);
    }).catch(function(err){
        console.log("err: "+err);
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
    console.log("req.params.id: "+req.params.id);
    var deleteListingPromise = listingAPIService.deleteListingAPI(req.params.id);
    deleteListingPromise.then(function(result){
       console.log("server: deleteListing: result: "+JSON.stringify(result));
       res.json(result);
    }).catch(function(err){
       console.log("server.delete listing err: "+err);
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
   var createListingPromise = listingAPIService.createListingAPI(req.body);
   createListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
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
 var publishListingPromise = listingAPIService.publishDirectListingAPI(req.params.id);
   publishListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("/listings/:id/directPublications error: "+err);
       res.state(500).send(err);
   });
});

app.delete('/listings/:id/publications', (req, res) => {
   var unpublishListingPromise = listingAPIService.unPublishListingAPI(req.params.id);
   unpublishListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("DELETE/listings/:id/publications error: "+err);
       res.state(500).send(err);
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
    var deleteSpacePromise = spaceService.destroy(req.params.id);
    deleteSpacePromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        var ret = formatError(err);
        res.state(400).json(ret);
    });
});
app.listen(PORT, HOST);
