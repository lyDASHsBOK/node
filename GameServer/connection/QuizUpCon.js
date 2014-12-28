/**
 * Created by Envee.
 *
 * Date: 14-10-30
 * Time: 下午2:29
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

module.exports = QuizUpCon;
var BOK = require('../../common/bok/BOK'),
    GameCon = require('./GameCon');

BOK.inherits(QuizUpCon, GameCon);
function QuizUpCon(socket) {
    GameCon.call(this, socket);
}

QuizUpCon.prototype.getTopic = function(){
    return this.topic_;
};

QuizUpCon.prototype.setTopic = function(topic){
    this.topic_ = topic;
};

QuizUpCon.prototype.requestPlayerInfo = function(){
    this.send_(SERVER2CLIENT.GET_PLAYER_INFO);
};

QuizUpCon.prototype.gameInit = function(sidePlayersInfo, questionInfo, playerInfo){
    this.send_(SERVER2CLIENT.GAME_INIT, {
        playerSides: sidePlayersInfo,
        questions: questionInfo,
        player: playerInfo
    });
};

QuizUpCon.prototype.checkAnswerResult = function(player, answer, correctAnswer, result, score){
    this.send_(SERVER2CLIENT.CHECK_ANSWER_RESULT, {playerName:player, answer: answer, correctAnswer: correctAnswer, result: result, score: score});
};

QuizUpCon.prototype.getResult = function(result, grade){
    this.send_(SERVER2CLIENT.GET_RESULT, {result: result, grade: grade});
};

QuizUpCon.prototype.nextQuestion = function(duration){
    this.send_(SERVER2CLIENT.NEXT_QUESTION, {duration: duration});
};

QuizUpCon.prototype.sendTopicList = function(topicList, count){
    this.send_(SERVER2CLIENT.TOPIC_LIST, {topicList: topicList,count: count});
};

QuizUpCon.prototype.sendHistoryList = function(historyList){
    this.send_(SERVER2CLIENT.HISTORY_LIST, historyList);
};
/**
 *
 * @param {string}id // the select player id
 * @param {string}topic // select topic
 * @param {boolean}result // two rematch player selected topic is equal
 */
QuizUpCon.prototype.rematchTopicResult = function(id, topic,result){
    this.send_(SERVER2CLIENT.MATCH_TOPIC_RESULT, {id: id, topic: topic, result: result})
};
/*****************************Socket event handlers*************************************/
/**
 *
 * @param {Object} data // the player info format :
 * {
 *      id: {string}
 *      name: {string} // the name of player
 *      seat: {string} // the seat of player
 *      avatar: {string} // the avatar of player
 * }
 */
QuizUpCon.prototype.onPlayerInfo = function(data){
    this.player_ = data;

    console.log('Player in game: '+this.player_.name);
    this.dispatchEvent('playerInfoReady');
};

QuizUpCon.prototype.getPlayer = function(){
    return this.player_;
};

/**
 * the player select question option
 * @param {Object} data  // the player select option info format：
 * ｛
 *      questionIndex: {number} // the question 's index
 *      option: {number} // the player selected option
 *      time: {number} // the quiz time
 * ｝
 */
QuizUpCon.prototype.onSelectOption = function(data){
    this.dispatchEvent('selectOption', data);
};

/**
 * when player finish select
 * @param {Object} data // data format :{
 *      score: {number} // the player score
 * }
 */
QuizUpCon.prototype.onFinishSelect = function(data){
    this.dispatchEvent('finishSelect', data);
};

QuizUpCon.prototype.onGameStart = function(data){
    this.dispatchEvent('gameStart', data);
};

/**
 * set this connection select quiz topic
 * @param {string} data // the topic name
 */
QuizUpCon.prototype.onSetTopic = function(data){
    this.topic_ = data.toLowerCase();
};

/**
 * get history listener
 * @param {Object} data // data format: {playerId:{string}}
 */
QuizUpCon.prototype.onGetHistory = function(data){
    this.dispatchEvent('getHistory', data);
};

/**
 *
 * @param {number} data // the get which page number
 */
QuizUpCon.prototype.onGetTopic = function(data){
    this.dispatchEvent('getTopic', data);
};

/**
 *
 * @param {Object} data //player selected one rematch topic , data format:
 * {
 *      topic:{string}
 * }
 */
QuizUpCon.prototype.onRematchSelectTopic = function(data){
    this.dispatchEvent('rematchSelectTopic', data);
};

var SERVER2CLIENT = {
    /**
     */
    GET_PLAYER_INFO: 'getplayerinfo',

    /**
     * data:
     * {
     *      questions: {Array}      //contains {Object} data format:
     *      {
     *          question: {string},
     *          choices: {Array},
     *          score: {number},
     *          img: {string}
     *      }
     *      player: {Object} // data format {
     *          name: {string} // the name of player
     *          seat: {string} // the seat of player
     *          avatar: {string} // the avatar of player
     *      },
     *      sidePlayers: {Array}// container player {Object} info
     *
     * }
     * */
    GAME_INIT: 'gameinit',
    /**
     * data:{
     *      playerName:{string} // the player name
     *      answer: {number}// player answer
     *      correctAnswer: {number}// the correct answer
     *      result: {true| false}// the player option is right
     *      score: {number} // the quesetion score
     * }
     */
    CHECK_ANSWER_RESULT: 'checkanswerresult',

    /**
     * data: {
     *      playerName: {string}
     *      result:{string}, // result = result1 - result2
     * }
     */
    GET_RESULT: 'getresult',
    /**
     * data :
     * {
     *  topic:{string}  // ths player rematch select topic name
     *  result:{boolean} // when two players select different topic, this value is false else true
     * }
     */
    MATCH_TOPIC_RESULT: 'matchtopicresult',

    /**
     * data: {
     *      duration: {number} // the duration of quiz
     * }
     */
    NEXT_QUESTION: 'nextquestion',

    TOPIC_LIST: 'topiclist',
    HISTORY_LIST: 'historylist'
};