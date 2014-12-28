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

module.exports = GameUserDao;

BOK.inherits(GameUserDao, AbstractDao);

/**
 *
 * @param {monk} db   //the monk instance
 */
function GameUserDao(db) {
    AbstractDao.call(this, db);
    this.tGameUser = db.get('tGameUser');
}

/**
 * add game user in table
 * @param {Object} user  the data in format:
 *         {
 *             email: {string},
 *             name : {string},
 *             IdCard: {string},
 *             avatar: {string} // the path of avatar,
 *             password:{string}
 *         }
 * @param {function} cb
 */
GameUserDao.prototype.addUser = function (user, cb) {
    user.balance = 0;
    this.tGameUser.insert(user, function (error, docs) {
        if (error) {
            cb(error)
        } else {
            cb(null, docs)
        }
    });
};

/**
 * get user info by email
 * @param {string} email
 * @param {Function} cb
 */
GameUserDao.prototype.getUserByEmail = function (email, cb) {
    this.tGameUser.findOne({email: email}, function (error, doc) {
        if (error) {
            cb(error)
        } else {
            doc == null ? cb(null, null) : (delete doc.password && cb(null, doc))
        }
    })
};

/**
 * @param {string} id
 * @param {Function} cb
 * */
GameUserDao.prototype.getUserById = function(id, cb) {
    this.tGameUser.col.findById(id, function(err, doc){
        if(!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};



/**
 * db retrieval method
 * @param {string} email
 * @param {Function} cb
 * */
GameUserDao.prototype.getPwdByEmail = function (email, cb) {
    this.tGameUser.findOne({email:email}, function (err, doc) {
        if (!err) {
            doc == null ? cb(null, null) : cb(null, doc.password);
        } else {
            cb(err);
        }
    });

};
/**
 * db retrieval method
 * @param {Function} cb
 * */
GameUserDao.prototype.getAllUser = function (cb) {
    this.tGameUser.find({}, function (err, doc) {
        console.log('GameUserDao:' + doc);
        if(!err)
            cb(null, doc);
        else {
            cb(err);
        }
    });

};
/**
 * db count method
 *  * @param {Object} user  the data in format:
 *         {
 *             email: {string},
 *             amount : {num},
 *             operate: {string},
 *         }
 * @param {Function} cb
 * */
GameUserDao.prototype.updateAccount = function (data, cb) {
    var amount = data.amount;
    if(data.operate == 'debit'){
       amount = -parseInt(data.amount);
    }
    this.tGameUser.findAndModify({email:data.email}, {$inc: {balance: parseInt(amount)}}, {new: true}, function (err, doc) {
        console.log('GameUserDao updateAccount back:' + doc);
        if(!err)
            cb(null, doc);
        else {
            cb(err);
        }
    });
};

