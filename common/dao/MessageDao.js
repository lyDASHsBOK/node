/**
 * Created by Envee.
 *
 * Date: 14-11-24
 * Time: 下午5:55
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = MessageDao;

BOK.inherits(MessageDao, AbstractDao);

/**
 * @param {monk} db Instance of monk
 * */
function MessageDao(db) {
    AbstractDao.call(this, db);
    this.tMessageData_ = this.db_.get("tMessage");
}


/**
 *
 * @param {Object} data // data format:
 * {
 *      sender: {string} // the sender code
 *      receiver: {string}// the receiver code
 *      createTime:{long} // the create this message time serialize
 *      title: {string}  // this message have a topic title
 *      content: {string} //  this message content
 *      isRead: {boolean} // the user is readed
 * }
 * @param {Function} cb
 */
MessageDao.prototype.addMessage = function(data, cb){
    var self = this;
    this.tMessageData_.insert(data, function (error, docs) {
        if (error) {
            cb(error)
        } else {
            self.tMessageData_.col.ensureIndex({sender: 1}, function(err, doc){});
            self.tMessageData_.col.ensureIndex({receiver: 1},function(err, doc){});
            cb(null, docs)
        }
    });
};

/**
 * get user 's all message container send message and receive message
 * @param {string} user // the userId
 * @param {number} row
 * @param {number} page
 * @param {Function} cb
 */
MessageDao.prototype.getMessagesByUser = function(user, row, page, cb){
    this.tMessageData_.col.find({ $or: [{ sender: user},{receiver: user }]}).skip((page - 1) * row).limit(row).toArray(
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        });
};
