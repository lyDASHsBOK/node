/**
 * Created by lys.
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
module.exports = Game2048Con;
var BOK = require('../../common/bok/BOK'),
    GameCon = require('./GameCon');

BOK.inherits(Game2048Con, GameCon);
function Game2048Con(socket) {
    GameCon.call(this, socket);
}

