/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-8
 * Time: 上午10:26
 * Write the description in this section.
 */


var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = ServiceDao;

BOK.inherits(ServiceDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function ServiceDao(db) {
    AbstractDao.call(this, db);
    this.serviceData_ = this.db_.get("tServiceMsg");
}

/**
 * @param {Object} data message info, in format:
 *  {
 *      from: {string}
 *      to: {string}
 *      msg: {string}
 *  }
 * */
ServiceDao.prototype.addServiceMsg = function(data) {
    this.serviceData_.insert(data);
};
/**
 * db retrieval method
 * */
ServiceDao.prototype.getMsgById = function(id, cb) {
    var getMsg = BOK.createDelegate(this, this.getMsgById_Mongo);

    this.memoryCache_.wrap(id, function (cache_callback) {
        getMsg(id, cache_callback);
    }, cb);
};
/**
 * db retrieval method
 * */
ServiceDao.prototype.getMsgById_Mongo = function(id, cb) {
    this.serviceData_.col.find({ guestId: id }).toArray(function(e,docs){
        cb(e,docs);
    });
};


