/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-21
 * Time: 下午3:25
 * Write the description in this section.
 */
var BOK = require('../../bok/BOK'),
    Connection = require('./Connection'),
    EventDispatcher = require('../../bok/EventDispatcher');

module.exports = BaseLobby;

BOK.inherits(BaseLobby, EventDispatcher);
/**
 * @constructor
 * @param {string=} name (optional) the default name is the name of constructor
 * */
function BaseLobby(name) {
    EventDispatcher.call(this);

    /** @type {Array} contains {Connection}*/
    this.connections_ = {};
    this.name = name || this.constructor.name;
}

BaseLobby.Event = {
    /**
     * Body: {Connection} reference of the new connection instance.
     * */
    NEW_CONNECTION: 'newConnection'
};

/**
 * @param {string} id
 * @return {Connection}
 * */
BaseLobby.prototype.getConnectionById = function(id) {
    return this.connections_[id];
};

/**
 * @abstract
 * This function have to be implemented by sub class
 * @param {socket.io} socket
 * @return {Connection}
 * */
BaseLobby.prototype.createConnectionInstance_ = function(socket) {
    throw Error('BaseLobby.createConnectionInstance_: invoking abstract function. This function has to be implemented.');
};

/**
 * This function is called by BaseLobbyServer when a new socket connection made to server
 * @param {socket.io} socket
 * @return {Connection}
 * */
BaseLobby.prototype.newConnectionFromServer = function(socket) {
    var con = this.createConnectionInstance_(socket);
    con.addEventListener(Connection.Event.DISCONNECTED, BOK.createDelegate(this, this.onDisconnect_));
    this.connections_[con.getSocketID()] = con;

    this.dispatchEvent(BaseLobby.Event.NEW_CONNECTION, con);

    return con;
};

/**
 * Event listener
 * */
BaseLobby.prototype.onDisconnect_ = function(e) {
    var socketID = e.target.getSocketID();
    console.log('Connection ['+socketID+'] left lobby *'+this.name+'*');
    delete this.connections_[socketID];
};
