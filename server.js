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

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('listing-api.phowma.com\n');
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
        console.log("Error /admin/listings: "+err);
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

  models.Image.create({
      ListingVersionId: req.body.listing_id
  }).then(image => {
      var uploadPromise = imageService.uploadFile(
          req.file.path,
          req.file.originalname,
          'listing',
          req.body.listing_id,
          image.id);
      uploadPromise.then(function(result){
          image.url = result.Location;
          image.save().then(image => {
              res.json(image);
          }).catch(err => {
              res.json(err);
          });
      }).catch(function(err){
          res.send(err);
      });

  }).catch(err => {
      res.send(err);
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
        spaceUse: models.Space.rawAttributes.use.values,
        amenities: models.ListingVersion.rawAttributes.amenities.type.options.type.values

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

app.get('/listings', (req, res) => {
    var page = req.query.page;
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    var where = null;
    if (req.query.owner){
        where = {
            owner: req.query.owner
        };
    } else {
        where = {
            publishStatus: "On Market"
        };
    }
    var getListingsPromise = listingAPIService.indexListingAPI(page, limit, offset, where);
    getListingsPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
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
    console.log("req.params.id: "+req.params.id);
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

app.put('/unit/:id', (req, res) => {
    var updateData = {
        id: req.params.id,
        body: req.body
    }
    var updateUnitPromise = unitService.updateUnit(updateData);
    updateUnitPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.put('/tenant/:id', (req, res) => {
    var updateData = {
        id: req.params.id,
        body: req.body
    }
    var updateTenantPromise = tenantService.updateTenant(updateData);
    updateTenantPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.put('/portfolio/:id', (req, res) => {
    var updateData = {
        id: req.params.id,
        body: req.body
    }
    var updatePortfolioPromise = portfolioService.updatePortfolio(updateData);
    updatePortfolioPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/listings', (req, res) => {
   var createListingPromise = listingAPIService.createListingAPI(req.body);
   createListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("POST/listings error: "+err);
       res.status(500).send(err);
   });
});

app.post('/listings/:id/moderations', (req, res) => {
   var moderateListingPromise = listingAPIService.moderateListingAPI(req.params.id);
   moderateListingPromise.then(function(result){
       res.json(result);
   }).catch(function(err){
       console.log("POST/listings/:id/moderations error:"+err);
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

app.post('/unit', (req, res) => {
    var createUnitPromise = unitService.createUnit(req.body);
    createUnitPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/tenant', (req, res) => {
    var createTenantPromise = tenantService.createTenant(req.body);
    createTenantPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/portfolio', (req, res) => {
    var createPortfolioPromise = portfolioService.createPortfolio(req.body);
    createPortfolioPromise.then(function(result){
        res.json(result);
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.listen(PORT, HOST);
