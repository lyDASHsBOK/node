/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-6-30
 * Time: 下午4:32
 * Write the description in this section.
 */
var http = require('http');
var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost:27017/test');

var errorHandler = require('../common/midware/ErrorHandler');
var enableCORS = require('../common/midware/cors');

//2
var app = express();

var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.set('port', 8090);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


app.use(methodOverride());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(enableCORS);

//listen to all routes
require('../common/net/http/RankRoutes')(app, db);


//use error handler
app.use(errorHandler);


