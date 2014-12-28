/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-7
 * Time: 上午10:22
 * Write the description in this section.
 */

var port = process.env.PORT || 8081;


var ioSocket = require('socket.io').listen(port),
    mongo = require('mongodb'),
    db = require('monk')('localhost:27017/test'),
    Server = require('./server/Server');

//config
ioSocket.set('log level', 1);

var server = new Server(ioSocket, db);

console.log('Your application is running on http://localhost:' + port);
