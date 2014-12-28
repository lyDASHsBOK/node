/**
 * Created by Envee.
 *
 * Date: 14-8-20
 * Time: 上午9:33
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */
var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = TransactionDao;

BOK.inherits(TransactionDao, AbstractDao);

/**
 *
 * @param {monk} db
 */
function TransactionDao(db) {
    AbstractDao.call(this, db);
    this.tTransaction_ = db.get("tTransaction");
}
/**
 * db count method
 *  * @param {Object} user  the data in format:
 *         {
 *             email: {string},
 *             amount : {num},
 *             operate: {string}
 *             time: {string}
 *         }
 * @param {Function} cb
 * */
TransactionDao.prototype.addTransaction = function (data, cb) {
    data.state = "initial";
    this.tTransaction_.insert(data, function (err, doc) {
        if (!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};

TransactionDao.prototype.removeTransaction = function (data) {
    this.tTransaction_.remove({email:data.email, time:data.time });
};

/**
 * db count method
 *  * @param {Object} user  the data in format:
 *         {
 *             email: {string},
 *             amount : {num},
 *             operate: {string}
 *             time: {string}
 *         }
 * @param {Function} cb
 * */
TransactionDao.prototype.updateTransaction = function (data, cb) {
    this.tTransaction_.update({ email:data.email, time:data.time }, {$set: {state: 'applied'}});
};

