/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-21
 * Time: 下午4:37
 * Base class for socket.io web socket server.
 * This type of server always listen to connection from '/socket' path
 * This type of server would expect a init message to register connection types.
 */

var BOK = require('../../bok/BOK');

module.exports = BaseLobbyServer;
/**
 * @constructor
 * @param {socket.io} io
 * */
function BaseLobbyServer(io) {
    this.io_ = io;

    //listen to connections from '/socket' path
    io.of('/socket').on('connection', BOK.createDelegate(this, this.onSocketConnection_));

    //init Connection class factory
    this.lobbies_ = {};
}

/**
 * @param {string} name
 * @param {BaseLobby} lobby
 * @return {BaseLobby}
 * */
BaseLobbyServer.prototype.regLobby = function(name, lobby) {
    this.lobbies_[name] = lobby;
    return lobby;
};

/**
 * Socket listener
 * */
BaseLobbyServer.prototype.onSocketConnection_ = function(socket) {
    //for data format detail please refer to message definition at the bottom of this file.
    socket.on(CLIENT2SERVER.INIT, BOK.createDelegate(this, function(data){
        BOK.each(data.types, function(type){
            var lobbyInstance = this.lobbies_[type];
            var con = lobbyInstance && lobbyInstance.newConnectionFromServer(socket);
            if(con) {
                console.log('New ws connection ['+con.constructor.name+'] established to ' + lobbyInstance.name);
            }
        }, this);

        socket.emit(SERVER2CLIENT.CONNECTION_READY, data.types);
    }));
};

var SERVER2CLIENT = {
    CONNECTION_READY: 'connectionready'
};
var CLIENT2SERVER = {
    /**
     * Data format:
     *  {
     *      types: {Array}
     *  }
     * */
    INIT: 'init'
};

