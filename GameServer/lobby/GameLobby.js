/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-21
 * Time: 下午5:24
 * Write the description in this section.
 */

module.exports = GameLobby;
var BOK = require('../../common/bok/BOK'),
    Game = require('../game/Game'),
    GameCon = require('../connection/GameCon'),
    BaseLobby = require('../../common/net/ws/BaseLobby');

BOK.inherits(GameLobby, BaseLobby);
/**
 * @constructor
 * @param {Function} gameClass  The reference to a sub class {Game}, which will be instantiated by game lobby.
 * @param {Function} connectionClass  The reference to a sub class {GameCon}, which will be instantiated by game lobby.
 * */
function GameLobby(name, gameClass, connectionClass){
    BaseLobby.call(this);

    /** @public */
    this.name = name;

    this.gameClass_ = gameClass;
    this.connectionClass_ = connectionClass;
    this.numberOfCreatedGames_ = 0;

    //game instance containers contains {Game}
    this.gamesInProgress_ = [];
    this.openPrivateGames_ = [];
    this.openLobbyGames_ = [];

    /** format:
     * {
     *     id1: {Game},
     *     id2: {Game}
     *     ...
     * }
     * */
    this.pendingGames_ = {};

    /** format:
     * {
     *   type1: [], //contains {Game}
     *   type2: [], //contains {Game}
     *   ...
     * }
     * */
    this.openPublicGames_ = {};
}

/**
 * @public
 * @return {string}
 * */
GameLobby.prototype.MatchingFromLobby = function(){
    return this.matchLobbyGame_().getId();
};

/**
 * @public
 * @return {string}
 * */
GameLobby.prototype.MatchingFromPrivate = function(){
    return this.matchPrivateGame_().getId();
};

/**
 * @public
 * @param {string} id The ID of a game room
 * @return {string}
 * */
GameLobby.prototype.isGamePending = function(id){
    return this.pendingGames_[id];
};

/**
 * @override
 * @param {socket.io} socket
 * @return {Connection}
 * */
GameLobby.prototype.createConnectionInstance_ = function(socket) {
    var con = new this.connectionClass_(socket);

    con.addEventListener(GameCon.Event.READY_TO_PLAY, BOK.createDelegate(this, this.onConReadyToPlay_));

    return con;
};


/**
 * Event Listener
 * */
GameLobby.prototype.onConReadyToPlay_ = function(e){
    var gameCon = e.target;
    var gameId = e.body && e.body.roomId;

    //only private or lobby game request have ID, the rest is public game request
    if(gameId){
        var game = this.pendingGames_[gameId];
        game.pendingPlayerJoinGame(gameCon);
        if(!game.haveMorePendingPlayer()) {
            this.gamesInProgress_.push(game);
            delete this.pendingGames_[gameId];
        }
    } else {
        this.matchPublicGame_(gameCon);
    }
};

/**
 * Event Listener
 * */
GameLobby.prototype.onGameTimeoutAndStarted_ = function(e){
    var gameType = e.target.type;
    this.gamesInProgress_.push(this.openPublicGames_[gameType].shift());
};

/**
 * @protected
 * */
GameLobby.prototype.matchLobbyGame_ = function(){
    var currentGame = this.openLobbyGames_[0];
    if(!currentGame) {
        currentGame = this.createPubGame_('LOBBY');
        this.openLobbyGames_.push(currentGame);
    }

    currentGame.addOnePendingPlayer();

    if(currentGame.isGameFull()){
        this.pendingGames_[currentGame.getId()] = currentGame;
        this.openLobbyGames_.shift();
    }

    return currentGame;
};

/**
 * @protected
 * */
GameLobby.prototype.matchPrivateGame_ = function(){
    var currentGame = this.openPrivateGames_[0];
    if(!currentGame) {
        currentGame = this.createPubGame_('PRIVATE');
        this.openPrivateGames_.push(currentGame);
    }

    currentGame.addOnePendingPlayer();

    this.pendingGames_[currentGame.getId()] = currentGame;
    this.openPrivateGames_.shift();
    return currentGame;
};

/**
 * @protected
 * @param {GameCon} gameCon
 * @param {string=} gameType (optional)
 * */
GameLobby.prototype.matchPublicGame_ = function(gameCon, gameType){
    gameType || (gameType = Game.DEFAULT_TYPE);
    this.openPublicGames_[gameType] || (this.openPublicGames_[gameType] = []);
    var gameWaitingQueue = this.openPublicGames_[gameType];
    var currentGame = gameWaitingQueue[0];
    if(!currentGame) {
        currentGame = this.createPubGame_();
        currentGame.setGameType(gameType);
        gameWaitingQueue.push(currentGame);
        currentGame.startMatchingTimeout();
    }

    //player join current game
    if(gameCon){
        currentGame.playerJoinGame(gameCon);
    } else {
        currentGame.addOnePendingPlayer();
    }

    if(currentGame.isGameFull())
        this.gamesInProgress_.push(gameWaitingQueue.shift());

    return currentGame;
};



/**
 * @private
 * @param {string=} appendix (option) The appendix of game ID default is 'PUBLIC'
 * */
GameLobby.prototype.createPubGame_ = function(appendix){
    appendix || (appendix = 'PUBLIC');
    this.numberOfCreatedGames_++;
    var gameName = this.name + '-Game' + this.numberOfCreatedGames_ + '['+appendix+']';
    var game = new this.gameClass_(gameName);
    game.addEventListener(Game.Event.TIMEOUT_GAME_STARTED, BOK.createDelegate(this, this.onGameTimeoutAndStarted_));

    console.log('New public game ['+gameName+'] created in lobby ['+this.name+']');
    return game;
};

