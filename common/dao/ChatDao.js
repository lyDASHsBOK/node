/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-4
 * Time: 下午1:11
 * Write the description in this section.
 */

var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = ChatDao;

BOK.inherits(ChatDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function ChatDao(db) {
    AbstractDao.call(this, db);
    this.chatData_ = this.db_.get("chatLog");
}

ChatDao.prototype.addChatLog = function(from, to, msg) {
    this.chatData_.insert({from:from, to:to, msg:msg, timeStamp:new Date().getTime()});
};

ChatDao.prototype.getRecentLobbyChatLog = function(number, callback) {
    this.chatData_.col.find({to:'PUBLIC'}).sort({$natural: -1}).limit(number).toArray(function(e,docs){
        if(!e) {
            callback(docs);
        }
    });
};


