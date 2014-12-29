/**
 * Created by lys.
 * User: Liu Xinyi
 * Date: 14-10-24
 * Time: 下午5:49
 * Write the description in this section.
 */
var BOK = require('../../common/bok/BOK'),
    EventDispatcher = require('../../common/bok/EventDispatcher'),
    Connection = require('../../common/net/ws/Connection'),
    GameCon = require('../connection/GameCon');

module.exports = Game;

BOK.inherits(Game, EventDispatcher);
/**
 * @param {string} id
 * @param {number=} maxPlayer (optional) the default max player number is defined on game class as const MAX_PLAYER.
 * */
function Game(id, maxPlayer) {
    EventDispatcher.call(this);

    /** @public */
    this.type = Game.DEFAULT_TYPE;

    this.id_ = id;
    this.maxPlayerNumber_ = maxPlayer || this.constructor.MAX_PLAYER;
    this.playerCons_ = [];
    this.pendingPlayerNumber_ = 0;
    //TODO: maybe move this 30s default timeout to somewhere sensible
    this.matchingTimeout_ = 30000;
    this.matchingTimeoutID_ = 0;
    this.timeoutStartTime_ = 0;
}

//default game is 2 player game, this value can be various per game basis.
Game.MAX_PLAYER = 2;
Game.DEFAULT_TYPE = 'default';
Game.Event = {
    TIMEOUT_GAME_STARTED: 'timeoutGameStarted'
};

/**
 * @return {string}
 * */
Game.prototype.getId = function(){
    return this.id_;
};

/**
 * Set game type for games that have multiple matching channel
 * @param {string} type
 * */
Game.prototype.setGameType = function(type){
    this.type = type;
};

/**
 * @param {number=} timeout (optional)
 * */
Game.prototype.startMatchingTimeout = function(timeout){
    timeout && (this.matchingTimeout_ = timeout);
    this.timeoutStartTime_ = new Date().getTime();
    this.matchingTimeoutID_ = setTimeout(BOK.createDelegate(this, function(){
        //start game straight away when time out
        this.start_();
        this.dispatchEvent(Game.Event.TIMEOUT_GAME_STARTED);
    }), this.matchingTimeout_);
};

Game.prototype.isGameFull = function(){
    return this.maxPlayerNumber_ <= (this.pendingPlayerNumber_ + this.playerCons_.length);
};

Game.prototype.addOnePendingPlayer = function(){
    this.pendingPlayerNumber_++;
};

/**
 * @param {GameCon} playerCon
 * */
Game.prototype.pendingPlayerJoinGame = function(playerCon){
    if(this.pendingPlayerNumber_ > 0)
        this.pendingPlayerNumber_--;
    this.playerJoinGame(playerCon);
};

/**
 * @return {boolean}
 * */
Game.prototype.haveMorePendingPlayer = function(){
    return this.pendingPlayerNumber_ > 0;
};

/**
 * @param {GameCon} playerCon
 * */
Game.prototype.playerJoinGame = function(playerCon){
    this.playerCons_.push(playerCon);

    playerCon.addEventListener(Connection.Event.DISCONNECTED, BOK.createDelegate(this, this.onConDisconnected_));
    playerCon.addEventListener(GameCon.Event.PLAYER_LEFT_GAME, BOK.createDelegate(this, this.onConLeftGame_));

    //Game start if all player ready
    if(this.playerCons_.length == this.maxPlayerNumber_) {
        clearTimeout(this.matchingTimeoutID_);
        this.start_();
    }
    else {
        BOK.each(this.playerCons_, function(con){
            con.sendNetworkWaiting({
                waitingNum:this.playerCons_.length,
                readyDuration:this.timeoutStartTime_ ? (this.matchingTimeout_ - (new Date().getTime() - this.timeoutStartTime_)) : 0
            });
        }, this);
    }
};




/**
 * Event Listener
 * */
Game.prototype.onConDisconnected_ = function(e){
    this.playerLeaveGame_(e.target);
};

/**
 * Event Listener
 * */
Game.prototype.onConLeftGame_ = function(e){
    this.playerLeaveGame_(e.target);
};

/**
 * @abstract
 * @private
 * */
Game.prototype.start_ = function(){
    throw Error('Game.start_: invoking abstract function. This function has to be implemented.');
};


/**
 * @private
 * */
Game.prototype.playerLeaveGame_ = function(playerCon){
    playerCon.removeEventListener(Connection.Event.DISCONNECTED);
    playerCon.removeEventListener(GameCon.Event.PLAYER_LEFT_GAME);
    
    BOK.findAndRemove(this.playerCons_, playerCon);
    console.log('Player *'+playerCon.getSocketID()+'* left game ['+this.id_+']');

    //TODO: broad cast new room info to all player connections here
};

