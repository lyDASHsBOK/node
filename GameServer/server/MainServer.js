/**
 * Created by lys.
 * User: Liu Xinyi
 * Date: 14-10-21
 * Time: 下午5:47
 * Write the description in this section.
 */
module.exports = MainServer;
var BOK = require('../../common/bok/BOK'),
    BaseLobbyServer = require('../../common/net/ws/BaseLobbyServer'),
    Game2048 = require('../game/Game2048'),
    Game2048Con = require('../connection/Game2048Con'),
    GameLobby = require('../lobby/GameLobby');

BOK.inherits(MainServer, BaseLobbyServer);
/**
 * @param {socket.io} io
 * */
function MainServer(io) {
    BaseLobbyServer.call(this, io);

    this.regLobby('2048', new GameLobby('2048Lobby', Game2048, Game2048Con));
}
