/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-28
 * Time: 下午2:53
 * Write the description in this section.
 */
module.exports = ChatLobby;
var BOK = require('../../../bok/BOK'),
    BaseLobby = require('../../../net/ws/BaseLobby'),
    ChatCon = require('./ChatCon');

BOK.inherits(ChatLobby, BaseLobby);

/**
 * @param {GuestDao} guestDao
 * @param {ChatDao} chatDao
 * */
function ChatLobby(guestDao, chatDao){
    BaseLobby.call(this);

    this.guestDao = guestDao;
    this.chatDao = chatDao;
    this.publicChannel_ = 'public';
    this.userInChat_ = {};
}

/**
 * @override
 * This function have to be implemented by sub class
 * @param {socket.io} socket
 * @return {Connection}
 * */
ChatLobby.prototype.createConnectionInstance_ = function(socket) {
    return new ChatCon(socket, this);
};


/**
 * @return {string}
 * */
ChatLobby.prototype.getPublicChannel = function() {
    return this.publicChannel_;
};

/**
 * @return {Object}  Data format:
 *  {
 *      socketID: {string}
 *  }
 * */
ChatLobby.prototype.isUserInChat = function(id) {
    return this.userInChat_[id];
};

ChatLobby.prototype.logChatMsg = function(from, to, msg) {
    this.chatDao.addChatLog(from, to, msg);
};

ChatLobby.prototype.userLeftChat = function(id) {
    var userDetail = this.userInChat_[id];
    if(userDetail) {
        console.log('[CHAT]: User *'+userDetail.name+'* left chat.');
        delete this.userInChat_[id];
    }
};

ChatLobby.prototype.userJoinChat = function(userData, userSocket) {
    console.log('[CHAT]: User *' + userData.name + '* (id:' + userData.id + ', socket ID:'+userSocket.id+') connected to chat.');
    this.userInChat_[userData.id] = userData;
};

ChatLobby.prototype.getUserInChat = function() {
    return this.userInChat_;
};




