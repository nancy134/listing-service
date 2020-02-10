'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const models = require("./models");
const bodyParser = require('body-parser');
const cors = require('cors');
const imageService = require('./image');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

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

app.post('/upload', upload.single('image'), function(req, res, next) {

  models.Image.create({
      ListingId: req.body.listing_id
  }).then(image => {
      console.log("image.id: "+image.id);
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

  /*
  var uploadPromise = image.uploadFile('/usr/app/','image1.jpg','listing','1','1');
  uploadPromise.then(function(result){
      res.json(result);
  }).catch(function(err){
      res.send(err);
  });
  */
});

app.get('/listings', (req, res) => {
    var limit = req.query.perPage;
    var offset = (parseInt(req.query.page)-1)*parseInt(req.query.perPage);
    console.log("limit: "+limit+" offset: "+offset);
    models.Listing.findAndCountAll({
        distinct: true,
        limit: limit,
        offset: offset,
        attributes: ['id','address', 'city','state','yearBuilt'],
        include: [
        {
            model: models.Image, 
            as: 'images',
            attributes: ['id','url']
        },
        {
            model: models.Space,
            as: 'spaces',
            attributes: ['price', 'size']
        }
        ]
    }).then(listings => {
        res.json({
            page: req.query.page,
            perPage: req.query.perPage,
            listings: listings
        });
    }).catch(err => { 
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

app.get('/listing/:id', (req,res) => {
    models.Listing.findOne({
        where: {
            id: req.params.id
        },
        include: [
        {
            model: models.Image,
            as: 'images',
            attributes: ['id','url']
        },
        {
            model: models.Space,
            as: 'spaces',
            attributes: ['unit','price', 'size','type','use']
        }
        ]
    }).then(listing => {
        res.json(listing);
    });
});

app.post('/image', (req, res) => {
   var description = req.body.description;
   var ListingId = req.body.listingId;
   models.Image.create({
       description: description,
       ListingId: ListingId
   }).then(image => {
       res.json(image);
   }).catch(err => {
       res.json(err);
   });
});

app.put('/listing/:id', (req, res) => {
    console.log("req.params.id: "+req.params.id);
    console.log("req.body: "+req.body);
    models.Listing.update(
        req.body,
        {where: {id: req.params.id}}
    ).then(function(result){
        console.log("updatedListing: "+JSON.stringify(result));
        res.json(result)
    }).catch(function(err){
        console.log("err: "+err);
    });
});

app.post('/listing', (req, res) => {
   var tenant = req.body.tenant;
   var email = req.body.email;
   var address = req.body.address;
   var city = req.body.city;
   var state = req.body.state;
   models.Listing.create({
       tenant: tenant,
       email: email,
       address: address,
       city: city,
       state: state
   }).then(listing => {
       res.json(listing);
   });
});
app.listen(PORT, HOST);
