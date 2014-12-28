/**
 * Created by Envee.
 *
 * Date: 14-11-24
 * Time: am11:16
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

module.exports = MessageLobby;
var BOK = require('../../common/bok/BOK'),
    BaseLobby = require('../../common/net/ws/BaseLobby'),
    MessageCon = require('../connection/MessageCon');

BOK.inherits(MessageLobby, BaseLobby);

/**
 *
 * @param {Object} daoListObj
 * @constructor
 */
function MessageLobby(daoListObj){
    BaseLobby.call(this);
    this.userConnections_ = {};
    this.gameUserDao = daoListObj.gameUserDao;
    this.messageDao = daoListObj.messageDao;
    this.addEventListener(BaseLobby.Event.NEW_CONNECTION, BOK.createDelegate(this, this.onNewConnection_));
}

MessageLobby.prototype.onNewConnection_ = function(e){
    var con = e.body;
};

/**
 * @override
 * This function have to be implemented by sub class
 * @param {socket.io} socket
 * @return {Connection}
 * */
MessageLobby.prototype.createConnectionInstance_ = function(socket) {
    return new MessageCon(socket, this);
};

MessageLobby.prototype.recordUserConnection = function(userData, userSocket) {
    console.log('[MESSAGE]: User *' + userData.name + '* (id:' + userData.id + ', socket ID:'+userSocket.id+') connected to message.');
    this.userConnections_[userData.id] = userData;
};

MessageLobby.prototype.retrieveUserConnection = function(id) {
    console.log('retrieve UserCon: '+id, this.userConnections_);
    return this.userConnections_[id];
};

/**
 * @param  {string} id // user id
 * @return {Object}  Data format:
 *  {
 *      socketID: {string}
 *  }
 * */
MessageLobby.prototype.isUserInMessage = function(id) {
    return this.userConnections_[id];
};

/**
 *
 * @param {string} id
 */
MessageLobby.prototype.userLeftMessage = function(id) {
    var userDetail = this.userConnections_[id];
    if(userDetail) {
        console.log('[MESSAGE]: User *'+userDetail.name+'* left message.');
        delete this.userConnections_[id];
    }
};





