/**
 * Created by Envee.
 *
 * Date: 14-11-10
 * Time: 上午10:09
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = QuizHistoryDao;

BOK.inherits(QuizHistoryDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function QuizHistoryDao(db) {
    AbstractDao.call(this, db);
    this.quizHistory = this.db_.get("tQuizHistory");
}

/**
 * add quizup history about player
 * @param {Object} data the history data; format:{
 *      topic: {string}, // the play topic
 *      playerId: {string},
 *      oppId: {string},
 *      score: {number},
 *      oppScore: {number},
 *      correct: {number} // the correct question number
 *      total: {number} // the total number
 *      time: {number}  // the play time data
 *      questions: {Array} // the questions id array
 * }
 * @param {Function} cb // the callback
 */
QuizHistoryDao.prototype.addHistory = function(data, cb){
    this.quizHistory.insert(data,
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};

/**
 * get player history
 * @param {string} playerId // the player flag
 * @param {Function} cb
 */
QuizHistoryDao.prototype.getHistoryByPlayerId = function(playerId, cb){
    this.quizHistory.col.find({playerId: playerId}).sort({_id: -1}).limit(6).toArray(
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
    });
};