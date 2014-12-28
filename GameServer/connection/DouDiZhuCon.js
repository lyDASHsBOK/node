/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-23
 * Time: 下午1:14
 *
 *
 * Dispatching Events:
 * [
 *     playerInfoReady
 *     playerDisconnected
 *     playerReadyToBid
 *     bidBanker
 * ]
 */
module.exports = DouDiZhuCon;
var BOK = require('../../common/bok/BOK'),
    GameCon = require('./GameCon');

BOK.inherits(DouDiZhuCon, GameCon);
function DouDiZhuCon(socket) {
    GameCon.call(this, socket);
}

DouDiZhuCon.prototype.isReady = function() {
    return this.playerName_ != '';
};


DouDiZhuCon.prototype.gameInit = function(sideNames, playerName, deck, bankerCard) {
    this.send_(SERVER2CLIENT.GAME_INIT, {
        sideNames: sideNames,
        playerName: playerName,
        deck: deck,
        bankerCard: bankerCard
    });
};

DouDiZhuCon.prototype.nextBid = function(data) {
    this.send_(SERVER2CLIENT.NEXT_BID, data);
};

DouDiZhuCon.prototype.gameStart = function(data) {
    this.send_(SERVER2CLIENT.GAME_START, data);
};

DouDiZhuCon.prototype.gamePass = function(data) {
    this.send_(SERVER2CLIENT.GAME_PASS, data);
};

DouDiZhuCon.prototype.handPlayed = function(data) {
    this.send_(SERVER2CLIENT.HAND_PLAYED, data);
};

DouDiZhuCon.prototype.nextPlayer = function(data) {
    this.send_(SERVER2CLIENT.NEXT_PLAYER, data);
};

DouDiZhuCon.prototype.gameFinished = function(data) {
    this.send_(SERVER2CLIENT.GAME_FINISHED, data);
};

DouDiZhuCon.prototype.requestPlayerInfo = function() {
    this.send_(SERVER2CLIENT.GET_PLAYER_INFO);
};

/*****************************Socket event handlers*************************************/
DouDiZhuCon.prototype.onBidBanker = function(data) {
    console.log('Player bid for banker: '+this.playerName_+' on: '+data.bid);
    this.dispatchEvent('bidBanker', data.bid);
};

DouDiZhuCon.prototype.onPlayerInfo = function(data) {
    this.playerName_ = data.name + ((data.seat == null || data.seat == undefined) ? "" : (", " + data.seat));

    console.log('Player in game: '+this.playerName_);
    this.dispatchEvent('playerInfoReady');
};

DouDiZhuCon.prototype.onPlayerReadyForBid = function() {
    this.dispatchEvent('playerReadyToBid');
};

DouDiZhuCon.prototype.onPlayerPass = function() {
    this.dispatchEvent('playerPass');
};

DouDiZhuCon.prototype.onPlayCards = function(data) {
    console.log(this.playerName_ + " play cards: "+data.cards);
    this.dispatchEvent('playCards', data);
};


/*****************************Const*************************************/
var SERVER2CLIENT = {
    /**
    */
    GET_PLAYER_INFO: 'getplayerinfo',

    /**
     * data:
     * {
     *      sideNames: {Array}      //contains {string}
     *      playerName: {string}
     *      deck: {Array}           //contains {string}
     *      bankerCard: {string}
     * }
     * */
    GAME_INIT: 'gameinit',

    /**
     * data:
     * {
     *     bankerName: {string}         //
     *     player1Name: {string}         //
     *     player2Name: {string}         //
     *     bottomCards: {Array}         //contains {string}
     * }
     * */
    GAME_START: 'gamestart',

    /**
     * data:
     * {
     *     bankerWon: {boolean}
     *     point: {number}
     *     bonusFold: {number}
     * }
     */
    GAME_FINISHED: 'gamefinished',

    /**
     * data:
     * {
     *     name: {string}
     * }
     * */
    GAME_PASS: 'gamepass',

    /**
     * data:
     * {
     *     name: {string}   //name of player should be one of 'banker', 'player1', 'player2'
     *     cards: {Array}   //array of card types played
     * }
     * */
    HAND_PLAYED: 'handplayed',

    /**
     * data:
     * {
     *     name: {string}
     *     allowPass: {boolean}
     *     roundDuration: {number}
     * }
     * */
    NEXT_PLAYER: 'nextplayer',

    /**
     * data:
     * {
     *     name: {string}
     *     bid: {number}     //The number of current bid
     *     lastCallerPassed: {boolean}
     * }
     * */
    NEXT_BID: 'nextbid',

    /**
     * data:
     * {
     *     waitingNum: {number} //lobby waiting game player number
     *     readyDuration: {number | null} //ready connection time, if null ,cannot reset client timer
     * }
     */
    NETWORK_WAITING: 'networkwaiting'
};

var CLIENT2SERVER = {
    READY_TO_PLAY: 'readytoplay',
    //data: {bid: {number} The bid from this player
    BID_BANKER: 'bidbanker',

    //data: {name:{string}, cards{Array}}
    PLAY_CARDS: 'playcards',

    //data: {null}
    PLAYER_PASS: 'playerpass',

    //data: {name:{string}}
    PLAYER_READY_FOR_BID: 'playerreadyforbid',

    //data: {name:{string}, seat:{string}}
    PLAYER_INFO: 'playerinfo',
    //data: {null}
    QUIT_GAME: 'quitgame'
};