/**
 * Created by Envee.
 *
 * Date: 14-11-24
 * Time: am11:16
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../../common/bok/BOK');

var Connection = require('../../common/net/ws/Connection'),
    ObjectID = require('mongodb').ObjectID,
    crypto = require('crypto');
    CONST = require('../const');

module.exports = MessageCon;


BOK.inherits(MessageCon, Connection);
/**
 * @param {socket.io} socket
 * @param {MessageLobby} lobby
 * */
function MessageCon(socket, lobby) {
    Connection.call(this, socket);

    this.lobby_ = lobby;
    this.channel = null;
}

/**
 * data detail refer to event definition
 * */
MessageCon.prototype.isAdmin = function() {
    return this.channel == CONST.CHANNEL.ADMIN;
};

MessageCon.prototype.injectDao = function(){

};

////////////////////////////////////////////System Client Socket Listener/////////////////////////////////////////////////////
MessageCon.prototype.onGetUserList = function(){
    console.log("this connection channel: " + this.channel);
    if(this.isAdmin()) {
        this.lobby_.gameUserDao.getAllUser(BOK.createDelegate(this,function(err, doc){
            if(err){
                console.error(err.stack);
            }else{
                var results = [];
                this.formatUserList_(results, doc);
                this.send_(SERVER2SYS.USER_LIST, results);
            }
        }));
    }
};

/**
 *
 * @param  {Object}msg // data format:
 * {
 *      email: {string}
 * }
 */
MessageCon.prototype.onGetMessageList = function(msg){
    console.log("get user:" + msg.email + " message");
    if(this.isAdmin() && msg.email ){
        this.lobby_.gameUserDao.getUserByEmail(msg.email,BOK.createDelegate(this, function(err, userDoc){
            if(err){
                console.error(err.stack);
            }else{
                if(userDoc){
                    this.lobby_.messageDao.getMessagesByUser(userDoc._id.toString(), 10 , 1, BOK.createDelegate(this,function(err, doc){
                        if(err){
                            var error = new Error("get user list error");
                        }else{
                            var results = [];
                            console.log(JSON.stringify(doc));
                            this.formatMessageList_(results, doc, BOK.createDelegate(this, function(){
                                this.send_(SERVER2SYS.MESSAGE_LIST, results);
                            }));
                        }
                    }));
                }
            }
        }));

    }
};

/**
 *  system send notice
 * @param {Object} msg // data format:
 * {
 *      sender: {string} // the sender id
 *      receivers: {Array} // the receiver email list
 *      content: {string} // the message content
 * }
 */
MessageCon.prototype.onSystemNotice = function(msg){
    console.log("send system notice...");
    if (this.isAdmin()) {
        this.lobby_.gameUserDao.getUserByEmail('admin@enveesoft.com', BOK.createDelegate(this, function (err, senderDoc) {
            if (err) {
                console.error(err.stack);
            } else {
                if (!senderDoc) {
                    var md5Cry = crypto.createHash("md5");
                    md5Cry.update(new Date().getTime().toString());
                    var adminUser = {email: 'admin@enveesoft.com', name: 'SystemAdmin', IdCard: '', avatar: '', password: md5Cry.digest('hex')}
                    this.lobby_.gameUserDao.addUser(adminUser, BOK.createDelegate(this, function (error, adminDoc) {
                        if (adminDoc) {
                            this.sendSystemNotice_(msg, adminDoc);
                        }
                    }));
                } else {
                    this.sendSystemNotice_(msg, senderDoc);
                }
            }
        }));
    }
};

/**
 *
 * @param {Object} msg data
 * @param {Object} sender
 * @private
 */
MessageCon.prototype.sendSystemNotice_ = function(msg, sender){
    BOK.each(msg.receivers, BOK.createDelegate(this, function (email) {
        this.lobby_.gameUserDao.getUserByEmail(email, BOK.createDelegate(this, function (err, receiverDoc) {
            if (receiverDoc) {
                var data = {sender: sender._id.toString(), receiver: receiverDoc._id.toString(), title: 'System Notice', content: msg.content, isRead: false, createTime: new Date().getTime()};
                var receiverData = this.lobby_.isUserInMessage(receiverDoc._id.toString());
                if (receiverData) {
                    console.log('[MESSAGE]: User *' + sender._id + '* send system notice to user *' + receiverDoc._id.toString() + '* saying: [' + msg + ']');
                    var messageData = {title: "System Notice", content: msg.content, time: new Date().getTime()};
                    this.broadcast_(receiverData.socketID, SERVER2CLIENT.SYS_NOTICE, messageData);
                } else {
                    console.log('[MESSAGE] user *' + receiverDoc._id.toString() + '* not in message list. private chat fail.');
                }
                this.lobby_.messageDao.addMessage(data, function (err, messageDoc) {
                    if (err) {
                        var error = new Error("get user list error");
                    } else {
                        console.log('sender sys notice to user:' + email + ' success!');
                    }
                });
            }
        }));
    }, this))
};

MessageCon.prototype.formatUserList_ = function(results, users){
    BOK.each(users, function(user){
        if(!user.isAdmin){
            this.lobby_.userConnections_[user._id]?(user.status = 'online'):(user.status = 'offline');
            results.push({id:user._id, name: user.name, email:user.email, status: user.status})
        }
    },this);
};

MessageCon.prototype.formatMessageList_ = function(results, messages, cb){
    BOK.each(messages, function(message){
        this.lobby_.gameUserDao.getUserById(message.sender , BOK.createDelegate(this, function(err, doc){
            if(err){
                console.error(err.stack);
            }
            else{
                var sender = {id: doc._id, name: doc.name, avatar: doc.avatar, email:doc.email};
                this.lobby_.gameUserDao.getUserById(message.receiver, function(err, doc){
                    if(err){
                        console.error(err.stack);
                    }else{
                        if(doc){
                            var receiver = {id: doc._id, name: doc.name, avatar: doc.avatar};
                            results.push({sender: sender, receiver: receiver, title: message.title, content: message.content, createTime: message.createTime});
                            cb();
                        }
                    }
                })
            }
        }));
    },this);
};

////////////////////////////////////////////Client Socket Listener/////////////////////////////////////////////////////
/**
 * data detail refer to event definition
 * */
MessageCon.prototype.onDisconnect = function() {
    console.log('User ['+this.userId_+'] disconnect from message.');
    this.lobby_.userLeftMessage(this.userId_);
    this.socket_.leave(this.channel);
};

/**
 *
 * @param {Object} data
 * Data format:{
 *      id: {string} // user id
 *      name:{string}
 * }
 */
MessageCon.prototype.onEnterMessage = function(data){
    console.log('User ['+data.name+'] connecting to message.');

    if(this.lobby_.isUserInMessage(data.id)) {
        console.log('User ['+data.id+'] already connected to message.');
    } else {
        var THIS = this;
        this.lobby_.gameUserDao.getUserById(data.id, function(err, userData){
            if(err) {
                console.error(err.stack);
            } else if(userData) {
                userData.id = userData._id;

                THIS.userId_ = userData.id;
                userData.socketID = THIS.socket_.id;
                THIS.socket_.join(THIS.socket_.id);
                THIS.lobby_.recordUserConnection(userData, THIS.socket_);

                //send user message
                //send chat log message
                THIS.lobby_.messageDao.getMessagesByUser(userData._id.toString(), 10, 1 , function(error,docs){
                    console.log("docs "+ docs);
                    if(docs){
                        for(var l=docs.length, i=l-1; i>=0; --i) {
                            THIS.send_(SERVER2CLIENT.SYS_NOTICE, {title:docs[i].title, content:docs[i].content, time: docs[i].createTime });
                        }
                    }
                });
            } else {
                var errMessage = {title: 'ERROR', message: 'User ['+data.id+'] not registered, connecting to message fail.'};
                console.error('[ERROR]: ' + errMessage.message);
                //TODO: replace this SYS_MESSAGE with a proper ERROR message.
                //THIS.send_(SERVER2CLIENT.SYS_MESSAGE, errMessage);
            }
        });
    }
};

/**
 * Data format:
 *  {
 *      channel: {number}       //either passenger or admin channel
 *      name: {string}
 *  }
 * */
MessageCon.prototype.onLogin = function(data) {
    this.channel = data.channel;
    this.name = data.name;

    // Add the client to the room
    this.socket_.join(this.channel);
};

var SERVER2CLIENT = {
    /**
     * Data format:
     *  {
     *      title: {string}
     *      content: {string}
     *      time:{long}
     *  }
     * */
    SYS_NOTICE: 'sysnotice'
};

var SERVER2SYS = {
    /**
     * Data format:
     * {
     *      players:{Array} // player data format:
     *      {
     *          playerId: {string}
     *          playerName: {string},
     *          status:{string} // this player status
     *      }
     * }
     */
    USER_LIST: 'userlist',
    /**
     * Data format:
     *  {
     *      sender: {Object} // sender info format:
     *      {
     *          id: {string},
     *          name: {string},
     *          avatar: {string}
     *      },
     *      receiver: {Object} // receiver info format:
     *      {
     *          id: {string},
     *          name: {string},
     *          avatar: {string}
     *      },
     *      title:{string},
     *      content: {string},
     *      createTime: {long}
     *  }
     */
    MESSAGE_LIST: 'messagelist'
};

