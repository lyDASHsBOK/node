/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-3
 * Time: 下午1:56
 * Write the description in this section.
 */

var BOK = require('../../bok/BOK');
var ERROR_CODE = require('../../error/ErrorCode');
var RANK_DAO = require('../../dao/RankDao');

module.exports = function (app, db) {
    var rankDao = new RANK_DAO(db);
    app.get('/rank/', function (req, res) {
        res.send('Game rank http RESTful services');
    });

    /**
     * @param {Object} data rank info, in format:
     * {
     *      uId: {number} the user flag
     *      uName: {string} the user name
     *      gameType: {number} the game type number
     *      score: {number} the curren play game result score
     * }
     */
    app.post('/rank/submit', function (req, res, next) {
        var data = req.body;
        data = {uId:parseInt(data.uId),uName: data.uName, gameType:parseInt(data.gameType), score: parseInt(data.score)}
        var currentDate = new Date();
        data.submitDate = currentDate.getTime(); //+  currentDate.getTimezoneOffset()/60;

        rankDao.addRank(data, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.RANK_SCORE_SUBMITE_ERROR;
                error.user = {uId:data.uId};
                error.gameType = {gameType:data.gameType};
                next(error);
            } else {
                console.log("add new rank data:" + JSON.stringify(doc));
                res.send(doc);
            }
        });
        /* rankDao.getRank(data.uId, data.gameType, function (err, doc) {
         if (err) {
         var error = new Error();
         error.code = ERROR_CODE.RANK_DATA_ERROR;
         next(error);
         } else {
         if (doc == null) {// save data
         rankDao.addRank(data, function (err, doc) {
         if (err) {
         var error = new Error();
         error.code = ERROR_CODE.RANK_SCORE_SUBMITE_ERROR;
         error.user = {uId:data.uId};
         error.gameType = {gameType:data.gameType};
         next(error);
         } else {
         console.log("add new rank data:" + JSON.stringify(doc));
         res.send(doc);
         }
         });
         } else {//update data
         rankDao.updateRankById(doc._id, data, function (err, doc) {
         if (err) {
         var error = new Error();
         error.code = ERROR_CODE.RANK_SCORE_SUBMITE_ERROR;
         error.user = {uId:data.uId};
         error.gameType = {gameType:data.gameType};
         next(error);
         } else {
         console.log("update rank data:" + JSON.stringify(doc));
         res.send(data);
         }
         });
         }
         }
         });*/

    });

    /**
     * get one rank data by uId and gameType
     */
    app.get('/rank/:gameType/u/:uId', function (req, res, next) {
        rankDao.getRank(req.params.uId, req.params.gameType, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.RANK_DATA_ERROR;
                next(error);
            } else {
                var rank;
                BOK.each(doc, function (item) {
                    delete item._id;
                });
                rankDao.getUserRankByScore(doc.score, req.params.gameType, function(docs){
                    rank =  docs.length;
                    doc.rank = rank;
                    res.send(doc);
                });
            }
        });
    });

    /**
     * get rank top 10 data record
     */
    app.get('/rank/:gameType/top10', function (req, res, next) {
        rankDao.getRankTopNum(10, req.params.gameType, function (docs) {
            res.send(docs);
        });
    });

    /**
     * clear rank data
     */
    app.post('/rank/clear', function (req, res, next) {
        rankDao.clearUserRank(function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.CLEAR_RANK_DATA_ERROR;
                next(error);
            } else {
                console.log("clear user rank data.");
                res.send(doc);
            }
        });
    });
};
