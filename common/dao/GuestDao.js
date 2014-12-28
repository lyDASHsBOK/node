/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-6-26
 * Time: 下午2:42
 * Write the description in this section.
 */

var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = GuestDao;

BOK.inherits(GuestDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function GuestDao(db) {
    AbstractDao.call(this, db);
    this.guestData_ = this.db_.get("tGuests");
}

GuestDao.prototype.getUserAll = function(cb) {
    this.guestData_.find({},
        function(err, doc){
            console.log(doc);
            if(!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};

GuestDao.prototype.removeUserAll = function(cb) {
    this.guestData_.drop(
        function(err, doc){
            console.log(doc);
            if(!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};

/**
 * @param {Object} data User info, in format:
 *  {
 *      seat: {string}
 *      name: {string}
 *      avatar: {string}
 *      sex: {string}
 *      lang: {string}
 *  }
 *  @param {Function} cb The callback function
 *      function(err, data)
 * */
GuestDao.prototype.addUser = function(data, cb) {
    this.guestData_.insert({seat:data.seat, name:data.name, sex:data.sex, avatar:data.avatar, lang:data.lang},
        function(err, doc){
            if(!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};
/**
 * @param {Object} data User info, in format:
 *  {
 *      seat: {string}
 *      name: {string}
 *      avatar: {string}
 *      sex: {string}
 *      lang: {string}
 *  }
 *  @param {Function} cb The callback function
 *      function(err, data)
 * */
GuestDao.prototype.removeUser = function(data, cb) {
    this.guestData_.remove({_id:data._id, seat:data.seat, name:data.name, sex:data.sex, avatar:data.avatar, lang:data.lang},
        function(err, doc){
            if(!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};
/**
 * db retrieval method
 * */
GuestDao.prototype.getUserOnSeat_Mongo = function(seat, cb) {
    console.log('finding user in DB...');
    this.guestData_.find({seat:seat}, function(err, doc){
        if(!err) {
            cb(null, doc[0]);
        } else {
            cb(err);
        }
    });
};
/**
 * cached method
 * */
GuestDao.prototype.getUserOnSeat = function(seat, cb) {
    var getUser = BOK.createDelegate(this, this.getUserOnSeat_Mongo);

    this.memoryCache_.wrap(seat, function (cache_callback) {
        getUser(seat, cache_callback);
    }, cb);
};
/**
 * db delete method
 * */
GuestDao.prototype.removeUserOnSeat = function(seat, cb) {
    this.guestData_.remove({seat:seat}, function(err, doc){
        if(!err) {
            cb(null, doc[0]);
        } else {
            cb(err);
        }
    });
};

/**
 * db retrieval method
 * */
GuestDao.prototype.getUserById_Mongo = function(id, cb) {
    this.guestData_.col.findById(id, function(err, doc){
        if(!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};

/**
 * cached method
 * */
GuestDao.prototype.getUserById = function(id, cb) {
    var getUser = BOK.createDelegate(this, this.getUserById_Mongo);

    this.memoryCache_.wrap(id, function (cache_callback) {
        getUser(id, cache_callback);
    }, cb);
};

