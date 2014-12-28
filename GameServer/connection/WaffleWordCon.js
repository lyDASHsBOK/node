/**
 * Created by Envee.
 *
 * Date: 14-8-20
 * Time: 上午9:33
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */
module.exports = WaffleWordCon;
var BOK = require('../../common/bok/BOK'),
    GameCon = require('./GameCon');

BOK.inherits(WaffleWordCon, GameCon);
function WaffleWordCon(socket) {
    GameCon.call(this, socket);
}

/**
 * start game
 */
WaffleWordCon.prototype.gameStart = function(data){
    this.send_(SERVER2CLIENT.GAME_START);
};

WaffleWordCon.prototype.sendAllPlayerInfo = function(data){
    this.send_(SERVER2CLIENT.ALL_PLAYER_INFO, data);
};


WaffleWordCon.prototype.waitingMakeRaw = function(data){
    this.send_(SERVER2CLIENT.WAITING_MAKE_RAW, data);
};

WaffleWordCon.prototype.waitingSlave = function(data) {
    this.send_(SERVER2CLIENT.WAITING_SLAVE, data);
};

WaffleWordCon.prototype.setPartnerRight = function(data) {
    this.send_(SERVER2CLIENT.PARTNER_RIGHT, data);
};

WaffleWordCon.prototype.refreshOpScore = function(data) {
    this.send_(SERVER2CLIENT.REFRESH_OP_SCORE, data);
};

WaffleWordCon.prototype.requestReplayNetworkWaiting = function(data) {
    this.send_(SERVER2CLIENT.REPLAY_NETWORK_WAITING, data);
};

WaffleWordCon.prototype.getResult = function(data) {
    this.send_(SERVER2CLIENT.GET_RESULT, data);
};

/*****************************Socket event handlers*************************************/
WaffleWordCon.prototype.onHostFinished = function(data) {
    this.dispatchEvent('waitingSlave', data);
};

WaffleWordCon.prototype.onSelectRightCell = function(data) {
    this.dispatchEvent('selectRight', data);
};

WaffleWordCon.prototype.onSlaveFinished = function(){
    this.dispatchEvent('gameStart');
};

WaffleWordCon.prototype.onRefreshOpScore = function(data){
    this.dispatchEvent('refreshOpScore', data);
};

WaffleWordCon.prototype.onGameFinished = function(data){
    this.dispatchEvent('gameFinished', data);
};

WaffleWordCon.prototype.onPlayerInfo = function(data){
    this.playerInfo = data;
};

/*****************************Const*************************************/
var SERVER2CLIENT = {
    /**
     * waiting host make raw
     * data:
     * {
     *     type:{string} the host | slave
     * }
     */
    WAITING_MAKE_RAW: 'waitingmakeraw',
    /**
     * data:
     * {
     *     language: {string} //the wordlist language
     *     board: {Array}  //the raw send to slave player
     * }
     */
    WAITING_SLAVE: 'waitingslave',

    GAME_START: 'gamestart',

    /**
     * data:
     * [
     *  {name:{string}, seat:{string}, avatar: {string}}
     *  //more
     * ]
     * */
    ALL_PLAYER_INFO: 'allplayerinfo',

    /**
     * data:{
     *     score: {number}
     * }
     */
    PARTNER_RIGHT: 'partnerright',

    /**
     * data:{
     *    opScore: {number}
     * }
     */
    REFRESH_OP_SCORE: 'refreshopscore',

    /**
     * data:
     * {
     *     waitingNum: {number} //lobby waiting game player number
     *     readyDuration: {number | null} //ready connection time, if null ,cannot reset client timer
     * }
     */
    NETWORK_WAITING: 'networkwaiting',
 /**
     * data:
     * {
     *     oppName: {string} //the replay player
     *     readyDuration: {number | null} //ready connection time, if null ,cannot reset client timer
     * }
     */
    REPLAY_NETWORK_WAITING: 'replaynetworkwaiting',

    /**
     * data:{
     *    res: {number} //>0: win, <0: loss , 2: tie
     * }
     */
    GET_RESULT: 'getresult',

    PLAYER_DISCONNECT: 'playerdisconnect'

};

var CLIENT2SERVER = {
    /**data: {
     *      language: {string} //the wordlist language
    *       raw: {Array}
    * } //the host makes raw
     */
    HOST_FINISHED: 'hostfinished',

    /**
     * data:null |
     *      {vsInfo:{[
     *          {seat:{string},name:{string}}   //player1
     *          {seat:{string},name:{string}}   //player2
     *          ]} //the replay player  } //if not null the game  is replay
     */
    READY_TO_PLAY: 'readytoplay',

    //salve make raw
    SLAVE_FINISHED: 'slavefinished',

    //data: {word: {Array}} select right word
    SELECT_RIGHT_CELL: 'selectrightcell',

    //data: {opScore: {number}}
    REFRESH_OP_SCORE: 'onrefreshopscore',

    GAME_FINISHED: 'gamefinished',

    QUIT_GAME: 'quitgame',

    //data: {name:{string}, seat:{string}, avatar:{string}}
    PLAYER_INFO: 'playerinfo'
};