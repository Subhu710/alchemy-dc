/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
require('dotenv').config({silent: true});

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express(),
  da = require('./routes/da.js'),
  multer = require('multer');

//app.set('view engine','ejs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ storage: storage })

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

/*app.get('/',function(req,res){
  res.render(__dirname + '/public/index');
})
*/

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

//app.post('/convert', upload.single('file'), dc.convert);
app.post('/', upload.single('file'), da.entities);


