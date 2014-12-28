/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-4
 * Time: 下午2:35
 * Write the description in this section.
 */
var BOK = require('../../../bok/BOK'),
    Connection = require('../../../net/ws/Connection');

module.exports = ChatCon;
BOK.inherits(ChatCon, Connection);
/**
 * @param {socket.io} socket
 * @param {ChatLobby} lobby
 * */
function ChatCon(socket, lobby) {
    Connection.call(this, socket);
    this.userId_ = null;
    this.lobby_ = lobby;
}


/**
 * @param {string} msg
 * @param {number} sender User ID
 * @param {number=} receiver(optional) User ID
 * */
ChatCon.prototype.postChatMsg_ = function(msg, sender, receiver) {
    var chatData;
    var logData = {from:sender, to:receiver, msg:msg};

    //handle msg
    if(receiver) {
        //private chat
        var receiverData = this.lobby_.isUserInChat(receiver);
        if(receiverData) {
            console.log('[CHAT]: User *'+sender+'* send message to user *'+receiver+'* saying: ['+msg+']');
            chatData = {id:sender, receiverId:receiver, msg:msg};

            this.send_(SERVER2CLIENT.PRIVATE_CHAT_MSG, chatData);
            this.broadcast_(receiverData.socketID, SERVER2CLIENT.PRIVATE_CHAT_MSG, chatData);
        } else {
            console.log('[CHAT] user *'+receiver+'* not in chat list. private chat fail.');
        }
    } else {
        //public chat
        console.log('[CHAT]: User *'+sender+'* send message: ['+msg+']');

        chatData = {id:sender, msg:msg};
        this.send_(SERVER2CLIENT.PUBLIC_CHAT_MSG, chatData);
        this.broadcast_(this.lobby_.getPublicChannel(), SERVER2CLIENT.PUBLIC_CHAT_MSG, chatData);

        //update log data
        logData.to = 'PUBLIC';
    }

    //log msg to db
    this.lobby_.logChatMsg(logData.from, logData.to, logData.msg);
};

////////////////////////////////////////////Client Socket Listener/////////////////////////////////////////////////////
/**
 * */
ChatCon.prototype.onDisconnect = function() {
    console.log('User ['+this.userId_+'] disconnect from chat.');
    this.lobby_.userLeftChat(this.userId_);

    //leave public channel
    this.socket_.leave(this.lobby_.getPublicChannel());
    //leave private channel
    this.socket_.leave(this.socket_.id);

    this.broadcast_(this.lobby_.getPublicChannel(), SERVER2CLIENT.USER_LEFT, this.userId_);
};

/**
 * Public chat message
 * Data format:
 *  {
 *      id: {number}
 *      msg: {string}
 *  }
 * */
ChatCon.prototype.onPostChatMsg = function(data) {
    this.postChatMsg_(data.msg, data.id);
};

/**
 * Data format:
 *  {
 *      id: {number}
 *      receiverId: {number}
 *      msg: {string}
 *  }
 * */
ChatCon.prototype.onPostPrivateChatMsg = function(data) {
    this.postChatMsg_(data.msg, data.id, data.receiverId);
};

/**
 * Data format:
 *  {
 *      id: {number}
 *      name: {string}
 *      avatar: {string}
 *      sex: {string}
 *  }
 * */
ChatCon.prototype.onEnterChat = function(data) {
    console.log('User ['+data.id+'] connecting to chat.');
    console.log(data.id);

    if(this.lobby_.isUserInChat(data.id)) {
        console.log('User ['+data.id+'] already connected to chat.');
    } else {
        var THIS = this;
        this.lobby_.guestDao.getUserById(data.id, function(err, userData){
            if(err) {
                console.error(err.stack);
            } else if(userData) {
                userData.id = userData._id;
                THIS.lobby_.userJoinChat(userData, THIS.socket_);

                THIS.userId_ = userData.id;
                userData.socketID = THIS.socket_.id;
                THIS.socket_.userChatDetail = userData;
                THIS.socket_.join(THIS.lobby_.getPublicChannel());
                THIS.socket_.join(THIS.socket_.id);

                //send user message
                THIS.send_(SERVER2CLIENT.USER_LIST, THIS.lobby_.getUserInChat());
                THIS.broadcast_(THIS.lobby_.getPublicChannel(), SERVER2CLIENT.USER_JOIN, userData);

                //send chat log message
                THIS.lobby_.chatDao.getRecentLobbyChatLog(5, function(docs){
                    for(var l=docs.length, i=l-1; i>=0; --i) {
                        THIS.send_(SERVER2CLIENT.PUBLIC_CHAT_MSG, {id:docs[i].from, msg:docs[i].msg});
                    }
                });
            } else {
                var errMessage = {title: 'ERROR', message: 'User ['+data.id+'] not registered, connecting to chat fail.'};
                console.error('[ERROR]: ' + errMessage.message);
                //TODO: replace this SYS_MESSAGE with a proper ERROR message.
                //THIS.send_(SERVER2CLIENT.SYS_MESSAGE, errMessage);
            }
        });
    }
};


var SERVER2CLIENT = {
    /**
     * Data format:
     *  {
     *      id: {number}
     *      msg: {string}
     *  }
     * */
    PUBLIC_CHAT_MSG: 'chatmsg',

    /**
     * Data format:
     *  {
     *      id: {number}
     *      receiverId: {number}
     *      msg: {string}
     *  }
     * */
    PRIVATE_CHAT_MSG: 'privatechatmsg',

    /**
     * Data: {string} user id
     *  */
    USER_LEFT: 'userleft',

    /**
     * Data format:
     *  {Object}    //A list of users with id as the index
     * */
    USER_LIST: 'userlist',

    /**
     * Data format:
     * {
     *      id: {number}
     *      name: {string}
     *      avatar: {string}
     *      sex: {string}
     *  }
     *  */
    USER_JOIN: 'userjoin'
};
