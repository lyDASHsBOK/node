/**
 * Created by Envee.
 *
 * Date: 14-12-9
 * Time: 下午3:47
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../bok/BOK');
var AbstractDao = require('./AbstractDao');

module.exports = GameDao;

BOK.inherits(GameDao, AbstractDao);

/**
 *
 * @param {monk} db   //the monk instance
 */
function GameDao(db) {
    AbstractDao.call(this, db);
    this.tGameData_ = db.get('tGame');
}

/**
 * add game
 * @param {Object} game data format:
 * {
 *      img:{string}
 *      text:{string}
 *      type:{string}
 *      src:{string}
 *      isMultiplay:{boolean}
 *      type:{string}
 * }
 * @param {Function} cb
 */
GameDao.prototype.addGame = function (game, cb) {
    this.tGameData_.insert(game, function (error, doc) {
        if (error) {
            cb(error)
        } else {
            cb(null, doc)
        }
    });
};

GameDao.prototype.getGameList = function (querys, cb) {
    this.tGameData_.col.find(querys).toArray(function (err, docs) {
        if (!err)
            cb(null, docs);
        else {
            cb(err);
        }
    });
};

GameDao.prototype.getGameById = function (id, cb) {
    this.tGameData_.col.findById(id, function (err, doc) {
        if (!err)
            cb(null, doc);
        else {
            cb(err);
        }
    });
};
