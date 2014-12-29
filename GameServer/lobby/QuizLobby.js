module.exports = QuizLobby;
var BOK = require('../../common/bok/BOK'),
    Game = require('../game/Game'),
    GameCon = require('../connection/GameCon'),
    QuizUpCon = require('../connection/QuizUpCon'),
    BaseLobby = require('../../common/net/ws/BaseLobby'),
    GameLobby = require('./GameLobby');

BOK.inherits(QuizLobby, GameLobby);
function QuizLobby(name, gameClass, daoListObj){
    GameLobby.call(this, name, gameClass, QuizUpCon);

    this.questionDao_ = daoListObj.questionDao;
    this.daoListObj_ = daoListObj;

    this.addEventListener(BaseLobby.Event.NEW_CONNECTION, BOK.createDelegate(this, this.onNewConnection_));

}

/**
 * @protected
 * @override
 * @param {GameCon|null} gameCon
 * @param {Array} gameReadyQueue
 * */
QuizLobby.prototype.matchPublicGame_ = function (gameCon, gameReadyQueue) {
    // set a random topic if this game is a private
    QuizLobby.superClass_.matchPublicGame_.call(this, gameCon, gameReadyQueue, gameCon.getTopic())
        .injectDao(this.daoListObj_);
};

QuizLobby.prototype.onNewConnection_ = function (e) {
    var con = e.body;
    this.daoListObj_.questionDao.getAllTopics(5, 1, BOK.createDelegate(this, function (error, doc) {
        if (error) {
            error.code = "get topic error";
        } else {
            this.daoListObj_.questionDao.getTopicsCount({}, function (err, count) {
                if (err) {
                    var error = new Error();
                    error.code = "get topic error";
                }else{
                    con.sendTopicList(doc, count);
                }
            });
        }
    }));

    con.addEventListener('getHistory', BOK.createDelegate(this, this.onGetHistory_));
    con.addEventListener('getTopic', BOK.createDelegate(this, this.onGetTopic_));
};

QuizLobby.prototype.onGetHistory_ = function(e){
    var playerId = e.body.playerId;
    var playerCon = e.target;
    this.daoListObj_.historyDao.getHistoryByPlayerId(playerId, function(err, docs){
        if(err){
            var error = new Error("add history error");
        }else{
            var historyList = [];
            BOK.each(docs, function(history){
                //get oppenent info
                history.opp = {name: history.oppId, avatar:"assets/img/ai_avatar.jpg"};
                historyList.push(history);
            });
            playerCon.sendHistoryList(historyList);
        }
    });
};

QuizLobby.prototype.onGetTopic_ = function(e){
    var con = e.target;
    var page = e.body;
    this.daoListObj_.questionDao.getAllTopics(5, page, BOK.createDelegate(this, function (error, doc) {
        if (error) {
            error.code = "get topic error";
        } else {
            this.daoListObj_.questionDao.getTopicsCount({}, function (err, count) {
                if (err) {
                    var error = new Error();
                    error.code = "get topic error";
                }else{
                    con.sendTopicList(doc, count);
                }
            });
        }
    }));
};
