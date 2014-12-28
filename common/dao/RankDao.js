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

module.exports = RankDao;

BOK.inherits(RankDao, AbstractDao);

/**
 *
 * @param {monk} db
 */
function RankDao(db) {
    AbstractDao.call(this, db);
    this.GAME_TYPE = {DOU_DI_ZHU:1, WAFFLE_WORD:2};
    this.tRank_ = db.get("tRank");
}

/**
 * add game rank
 * @param {Object} rank // the user rank data
 * data:{
 *      uId: {number} the user flag
 *      uName: {string} the user name
 *      gameType: {number} the game type number
 *      score: {number} the curren play game result score
 * }
 * @param {Function} cb // The callback function
 */
RankDao.prototype.addRank = function (rank, cb) {
    this.tRank_.insert(rank, function (err, doc) {
        if (!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};

/**
 * update game rank by id
 * @param {string} id // the data id
 * @param {Object} rank // the user rank data
 * data:{
 *      uId: {number} the user flag
 *      uName: {string} the user name
 *      gameType: {number} the game type number
 *      score: {number} the curren play game result score
 *      rank: {number} the player rank
 * }
 * @param {Function} cb // The callback function
 */
RankDao.prototype.updateRankById = function (id, rank, cb) {
    this.tRank_.updateById(id, rank, function (err, doc) {
        if (!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};
/**
 * get user rank by score
 * @param {number} score  //the query score
 * @param {number} gameType //which type can been filter
 * @param {Function} cb //callback function
 */
RankDao.prototype.getUserRankByScore = function (score, gameType, cb) {
    return this.tRank_.col.find({gameType:parseInt(gameType),score: {$gte : score }}).sort({score: -1}).toArray(function (e, docs) {
        if (!e) {
            cb(docs);
        }
    });
};

/**
 * get rank by uId and gameType
 * @param {number} uId //the user flag
 * @param {number} gameType // the game type number
 * @param {Function} cb // The callback function
 */
RankDao.prototype.getRank = function (uId, gameType, cb) {
    this.tRank_.findOne({uId: parseInt(uId), gameType: parseInt(gameType)}, function (err, doc) {
        if (!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};

/**
 * get rank font top number
 * @param {number} number //the show number
 * @param {number} gameType // the game type number
 * @param {Function} cb // The callback function
 */
RankDao.prototype.getRankTopNum = function (number, gameType, cb) {
    this.tRank_.col.find({gameType:parseInt(gameType)}).sort({score: -1}).limit(number).toArray(function (e, docs) {
        if (!e) {
            cb(docs);
        }
    });
};


/**
 * clear rank data
 * @param {Function} cb // The callback function
 */
RankDao.prototype.clearUserRank = function (cb) {
    this.tRank_.drop((function (err, doc) {
        if (!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    })
    );
};