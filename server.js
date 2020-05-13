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

    // Owner & publishStatus
    if (req.query.owner){
        where = {
            owner: req.query.owner,
            [Op.or]: [
                {publishStatus: 'Draft'}, 
                {[Op.and]: [ 
                   {publishStatus: 'On Market'},
                   {'$listing.latestDraftId$': null}
                ]} 
            ],
        };
    } else {
        where = {
            publishStatus: 'On Market',
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
    
    //-------------------------
    /*
    var spaceUseWhereClause = null;
    if (req.query.spaceUse ||
        req.query.minSize ||
        req.query.maxSize ||
        req.query.minPrice ||
        req.query.maxPrice){
    spaceUseWhereClause = models.Space.rawAttributes.use.values;
    if (req.query.spaceUse){
        spaceUseWhereClause = req.query.spaceUse;
    }

    var minSize = 0;
    if (req.query.minSize){
        gminSize = req.query.minSize;
    }
    var maxSize = 999999;
    if (req.query.maxSize){
        maxSize = req.query.maxSize;
    }

    var minRate = 0;
    var maxRate = 999999;
    if (req.query.minRate){
        minRate = req.query.minRate;
    };
    if (req.query.maxRate){
        maxRate = req.query.maxRate;
    }

    spaceWhere = {
        [Op.and]: {
            use: { [Op.or]: spaceUseWhereClause}, 
            size: {
                [Op.gte]: minSize,
                [Op.lte]: maxSize 
            },
            price: {
                [Op.gte]: minRate,
                [Op.lte]: maxRate
            }
        }
    };
    }
    */
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

  imageService.createAPI(
      req.body.listing_id,
      req.file.path, 
      req.file.originalname,
      'listing',
      req.body.listing_id)
      .then(function(image){
          res.json(image);
      }).catch(function(err){
          res.json(err);
      });
});

app.get('/images', (req, res) => {
    models.Image.findAll().then(images => res.json(images));
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
        console.log("err: "+err);
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

app.listen(PORT, HOST);
