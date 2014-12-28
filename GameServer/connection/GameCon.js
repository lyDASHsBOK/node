/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-8-25
 * Time: 下午4:26
 * Write the description in this section.
 */
module.exports = GameCon;
var BOK = require('../../common/bok/BOK'),
    Connection = require('../../common/net/ws/Connection');

BOK.inherits(GameCon, Connection);
/**
 * @constructor
 * @param {socket.io} socket
 * */
function GameCon(socket) {
    Connection.call(this, socket);

    this.playerName_ = '';
}

GameCon.Event = {
    READY_TO_PLAY: 'readyToPlay',
    PLAYER_LEFT_GAME: 'playerLeftGame'
};

GameCon.prototype.getPlayerName = function() {
    return this.playerName_;
};


/**
 * For data format please refer to message definition
 * */
GameCon.prototype.sendNetworkWaiting = function(data) {
    this.send_(SERVER2CLIENT.NETWORK_WAITING, data);
};


///////////////////////// Client Socket Listener ////////////////////////////////////////
/**
 * data:null | {}
 *    {
 *        roomId: {string}      //room ID is for private or lobby matching only
 *    }
 */
GameCon.prototype.onReadyToPlay = function(data) {
    this.dispatchEvent(GameCon.Event.READY_TO_PLAY, data);
};

GameCon.prototype.onQuitGame = function(){
    this.dispatchEvent(GameCon.Event.PLAYER_LEFT_GAME);
};



var SERVER2CLIENT = {
    /**
     * data:
     * {
     *     waitingNum: {number} //lobby waiting game player number
     *     readyDuration: {number | null} //ready connection time, if null ,cannot reset client timer
     * }
     */
    NETWORK_WAITING: 'networkwaiting'
};
