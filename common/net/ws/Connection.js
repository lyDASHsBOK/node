/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-4
 * Time: 下午1:52
 * Write the description in this section.
 */
var BOK = require('../../bok/BOK');
var EventDispatcher = require('../../bok/EventDispatcher');

module.exports = Connection;

BOK.inherits(Connection, EventDispatcher);
function Connection(socket) {
    EventDispatcher.call(this);
    this.socket_ = socket;
    
    //hook socket up with all "onXXXX" functions
    var regX = /^on([A-Z].*[^_])$/;
    BOK.each(this.constructor.prototype, function(item, key){
        if(regX.test(key)) {
            this.socket_.on(key.replace(regX, '$1').toLowerCase(), BOK.createDelegate(this, function(data){
                console.log('Socket['+this.socket_.id+'] received message: '+key);
                console.log(data);
            }));
            this.socket_.on(key.replace(regX, '$1').toLowerCase(), BOK.createDelegate(this, item));
        }
    }, this);
}

Connection.Event = {
    DISCONNECTED: 'disconnected'
};

Connection.prototype.getSocket = function() {
    return this.socket_;
};

Connection.prototype.getSocketID = function() {
    return this.socket_.id;
};

/**
 * Listen to given event from client using listener
 * @deprecated
 * @param {string} event
 * @param {Function} listener
 * */
Connection.prototype.onEvent_ = function(event, listener) {
    this.socket_.on(event, BOK.createDelegate(this, listener));
};

/**
 * Send event to client with data.
 * @param {string} event
 * @param {Object=} data (optional)
 * */
Connection.prototype.send_ = function(event, data) {
    console.log('socket['+this.socket_.id+'] send: '+event);
    console.log(data);
    this.socket_.emit(event, data);
};

/**
 * Send event to client with data.
 * @param {string} channel
 * @param {string} event
 * @param {Object=} data (optional)
 * */
Connection.prototype.broadcast_ = function(channel, event, data) {
    console.log('socket broadcast: '+event);
    console.log("channel: "+channel);
    console.log(data);
    this.socket_.broadcast.to(channel).emit(event, data);
};

/**
 * Event listener
 * */
Connection.prototype.onDisconnect = function() {
    this.dispatchEvent(Connection.Event.DISCONNECTED);
};