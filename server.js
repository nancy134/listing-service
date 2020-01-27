'use strict';

const express = require('express');
const Sequelize = require('sequelize');
const ListingModel = require('./models/listing');
const bodyParser = require('body-parser');
const cors = require('cors');
const image = require('./image');
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

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
  console.log('req.body.type: '+req.body.type);
  res.send(req.file);

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
    const sequelize = new Sequelize(process.env.DATABASE_URL);
    const Listing = ListingModel(sequelize, Sequelize);
    Listing.findAll().then(listings => res.json(listings))
});

app.get('/listing/:id', (req,res) => {
    const sequelize = new Sequelize(process.env.DATABASE_URL);
    const Listing = ListingModel(sequelize, Sequelize);
    Listing.findOne({
        where: {
            id: req.params.id
        }
    }).then(listing => res.json(listing));
});

app.post('/listing', (req, res) => {
   var tenant = req.body.tenant;
   var email = req.body.email;
   var address = req.body.address;
   var city = req.body.city;
   var state = req.body.state;
   const sequelize = new Sequelize(process.env.DATABASE_URL);
   const Listing = ListingModel(sequelize, Sequelize);
   Listing.create({
       tenant: tenant,
       email: email,
       address: address,
       city: city,
       state: state
   }).then(listing => {
       console.log("listing.id: "+listing.id);
       res.json(listing);
   });
});
app.listen(PORT, HOST);
