/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-28
 * Time: 下午3:17
 * Write the description in this section.
 */
module.exports = MessageLobby;
var BOK = require('../../common/bok/BOK'),
    BaseLobby = require('../../common/net/ws/BaseLobby'),
    MessageCon = require('../connection/MessageCon');

BOK.inherits(MessageLobby, BaseLobby);

/**
 * @param {ReportingDao} reportDao
 * @param {ServiceDao} serviceDao
 * */
function MessageLobby(reportDao, serviceDao){
    BaseLobby.call(this);

    this.reportDao = reportDao;
    this.serviceDao = serviceDao;

    this.clientLocked_ = false;
    this.sysLockMsg_ = {};
    this.userConnections_ = {};
}

/**
 * @override
 * This function have to be implemented by sub class
 * @param {socket.io} socket
 * @return {Connection}
 * */
MessageLobby.prototype.createConnectionInstance_ = function(socket) {
    return new MessageCon(socket, this);
};

/**
 * @param {Object} msg Data format:
 *  {
 *      title: {string}
 *      message: {string}
 *  }
 * */
MessageLobby.prototype.lockClient = function(msg) {
    this.clientLocked_ = true;
    this.sysLockMsg_ = msg;
};

MessageLobby.prototype.unlockClient = function() {
    this.clientLocked_ = false;
};

MessageLobby.prototype.isClientLocked = function() {
    return this.clientLocked_;
};

MessageLobby.prototype.getSysLockMsg = function() {
    return this.sysLockMsg_;
};

MessageLobby.prototype.recordUserConnection = function(id, con) {
    this.userConnections_[id] = con;
};

MessageLobby.prototype.retrieveUserConnection = function(id) {
    console.log('retrieve UserCon: '+id, this.userConnections_);
    return this.userConnections_[id];
};




