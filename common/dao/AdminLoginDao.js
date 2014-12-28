/**
 * Created by Administrator on 14-9-3.
 */
/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-6-26
 * Time: 下午2:42
 * Write the description in this section.
 */

var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = AdminLoginDao;

BOK.inherits(AdminLoginDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function AdminLoginDao(db) {
    AbstractDao.call(this, db);
    this.AdminLoginData_ = this.db_.get("tAdminLogin");
}

/**
 * @param {Object} data User info, in format:
 *  {
 *      user: {string}
 *      pwd: {string}
 *  }
 *  @param {Function} cb The callback function
 *      function(err, data)
 * */
AdminLoginDao.prototype.addUser = function(data, cb) {
    this.AdminLoginData_.insert({ user:data.user, pwd:data.pwd },
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
 *      user: {string}
 *      pwd: {string}
 *  }
 *  @param {Function} cb The callback function
 *      function(err, data)
 * */
AdminLoginDao.prototype.removeUser = function(data, cb) {
    this.AdminLoginData_.remove({user:data.user, pwd:data.pwd},
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
AdminLoginDao.prototype.getUserPwd = function(data, cb) {
    this.AdminLoginData_.col.find({ user: data.user }).toArray(function(err, doc){
        console.log('admin get user', doc);
        if(!err) {
            if(doc[0])
                cb(null, doc[0].pwd);
            else
                cb('dbError');
        } else {
            cb(err);
        }
    });

};
