/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-11-6
 * Time: 下午3:36
 * Write the description in this section.
 */
module.exports = PortalLobby;

var BOK = require('../../common/bok/BOK'),
    PortalCon = require('../connection/PortalCon'),
    BaseLobby = require('../../common/net/ws/BaseLobby');

BOK.inherits(PortalLobby, BaseLobby);
/**
 *
 * @param {Object} daoListObj
 * @constructor
 */
function PortalLobby(daoListObj) {
    BaseLobby.call(this);

    this.gameUserDao = daoListObj.gameUserDao;
    this.userConnections_ = {};
    this.gameLobbies_ = {};
    this.openGameForPlayerConnections_ = {};
    this.privateGameForPlayerConnections_ = {};
}

/**
 * @override
 * @param {socket.io} socket
 * @return {Connection}
 * */
PortalLobby.prototype.createConnectionInstance_ = function(socket) {
    var con = new PortalCon(socket, this);
    con.addEventListener(PortalCon.Event.START_PUB_MATCHING, BOK.createDelegate(this, this.onPlayerPubMatching_));
    con.addEventListener(PortalCon.Event.START_PRIVATE_MATCHING, BOK.createDelegate(this, this.onPlayerPrivateMatching_));
    con.addEventListener(PortalCon.Event.ACCEPT_INVITE, BOK.createDelegate(this, this.onPlayerAcceptInvite_));
    con.addEventListener(PortalCon.Event.CONFIRM_MATCH, BOK.createDelegate(this, this.onPlayerConfirmMatch_));
    con.addEventListener(PortalCon.Event.CONFIRM_PRIVATE_MATCH, BOK.createDelegate(this, this.onPlayerConfirmPrivateMatch_));

    return con;
};


/**
 * @param {GameLobby|BaseLobby} gameLobby
 * */
PortalLobby.prototype.addGameLobby = function(gameLobby){
    this.gameLobbies_[gameLobby.name] = gameLobby;
};

/**
 * Event listener
 * body: {string}   game lobby name
 * */
PortalLobby.prototype.onPlayerPubMatching_ = function(e){
    var con = e.target;
    var lobby = this.gameLobbies_[e.body];
    var gameId = lobby.MatchingFromLobby();
    var gameWaitingQueue = this.openGameForPlayerConnections_[gameId] || (this.openGameForPlayerConnections_[gameId] = []);
    gameWaitingQueue.push(con);
    //check if game moved from waiting state to pending state
    if(lobby.isGamePending(gameId)) {
        gameWaitingQueue.readyPlayerNumber = 0;
        BOK.each(gameWaitingQueue, function(con){
            con.sendPrivateMatchReady(gameId);
        });
    }
};

/**
 * Event listener
 * body: {Object}   data format:{gameLobbyName:{string}, oppId:{string}}
 * */
PortalLobby.prototype.onPlayerPrivateMatching_ = function(e){
    var con = e.target;
    var lobby = this.gameLobbies_[e.body.gameLobbyName];
    var roomId = lobby.MatchingFromPrivate();
    var gameWaitingQueue = this.privateGameForPlayerConnections_[roomId] || (this.privateGameForPlayerConnections_[roomId] = []);
    gameWaitingQueue.push(con);
    //send invite message to opponent
    var oppCon = this.retrieveUserConnection(e.body.oppId);
    if(oppCon){
        var data = {inviterName:con.name, roomId:roomId, gameName:e.body.gameLobbyName, gameId:e.body.gameId };
        oppCon.sendInviteGame(con.name, roomId, e.body.gameLobbyName, e.body.gameId);
    }
};

PortalLobby.prototype.onPlayerAcceptInvite_ = function(e){
    var con = e.target;
    var roomId = e.body.roomId;
    var isAccept = e.body.isAccept;
    var lobby = this.gameLobbies_[e.body.gameLobbyName];
    var gameWaitingQueue = this.privateGameForPlayerConnections_[roomId];
    if(isAccept){
        gameWaitingQueue.push(con);
        //check if game moved from waiting state to pending state
        var game = lobby.pendingGames_[roomId];
        game.addOnePendingPlayer();
        if(lobby.isGamePending(roomId)) {
            gameWaitingQueue.readyPlayerNumber = 0;
            BOK.each(gameWaitingQueue, function(con){
                con.sendPrivateMatchReady(roomId);
            });
        }
    }
};
/**
 * Event listener
 * body: {string} room ID
 * */
PortalLobby.prototype.onPlayerConfirmPrivateMatch_ = function(e){
    var gameId = e.body;
    var gameWaitingQueue = this.privateGameForPlayerConnections_[gameId];
    gameWaitingQueue.readyPlayerNumber++;

    if(gameWaitingQueue.readyPlayerNumber == gameWaitingQueue.length) {
        BOK.each(gameWaitingQueue, function(con){
            con.sendLaunchGame(gameId);
        });

        delete this.privateGameForPlayerConnections_[gameId];
    }
};
/**
 * Event listener
 * body: {string} room ID
 * */
PortalLobby.prototype.onPlayerConfirmMatch_ = function(e){
    var gameId = e.body;
    var gameWaitingQueue = this.openGameForPlayerConnections_[gameId];
    gameWaitingQueue.readyPlayerNumber++;

    if(gameWaitingQueue.readyPlayerNumber == gameWaitingQueue.length) {
        BOK.each(gameWaitingQueue, function(con){
            con.sendLaunchGame(gameId);
        });

        delete this.openGameForPlayerConnections_[gameId];
    }
};

PortalLobby.prototype.recordUserConnection = function(id, userSocket) {
    console.log('[PORTAL]: User *' + id + '* (id:' + id + ', socket ID:'+userSocket.id+') connected to game portal.');
    this.userConnections_[id] = userSocket;
};

PortalLobby.prototype.retrieveUserConnection = function(id) {
    return this.userConnections_[id];
};
/**
 * @param  {string} id // user id
 * @return {Object}  Data format:
 *  {
 *      socketID: {string}
 *  }
 * */
PortalLobby.prototype.isUserInPortal = function(id) {
    return this.userConnections_[id];
};
/**
 *
 * @param {string} id
 */
PortalLobby.prototype.userLeftPortal = function(id) {
    var userDetail = this.userConnections_[id];
    if(userDetail) {
        console.log('[PORTAL]: User *'+userDetail.name+'* left message.');
        delete this.userConnections_[id];
    }
};