/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-7
 * Time: 上午10:22
 * Write the description in this section.
 */

var port = 8081;


var ioSocket = require('socket.io').listen(port);

var GameServer = require('./server/MainServer');

//config
ioSocket.set('log level', 1);

var server = new GameServer(ioSocket);

console.log('Game Server is running on http://localhost:' + port);
