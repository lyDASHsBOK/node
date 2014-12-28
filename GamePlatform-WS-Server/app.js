/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-11-3
 * Time: 下午5:44
 * Write the description in this section.
 */


var port = process.env.PORT ||  8081;


var ioSocket = require('socket.io').listen(port),
    mongo = require('mongodb'),
    db = require('monk')('localhost:27017/test'),
    Server = require('./server/Server');

//config
ioSocket.set('log level', 1);

var server = new Server(ioSocket, db);

console.log('Game Server is running on http://localhost:' + port);
