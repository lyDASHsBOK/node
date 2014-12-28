/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-11-4
 * Time: 下午9:04
 * Write the description in this section.
 */
module.exports = Server;
var BOK = require('../../common/bok/BOK'),
    ChatDao = require('../../common/dao/ChatDao'),
    GameUserDao = require('../../common/dao/GameUserDao'),
    MessageDao = require('../../common/dao/MessageDao'),
    QuizQuestionDao = require('../../GameServer/dao/QuizQuestionDao'),
    QuizHistoryDao  = require('../../GameServer/dao/QuizHistoryDao'),
    BaseLobbyServer = require('../../common/net/ws/BaseLobbyServer'),
    ChatLobby = require('../../common/net/ws/chat/ChatLobby'),
    PortalLobby = require('../lobby/PortalLobby'),
    MessageLobby = require('../lobby/MessageLobby'),

    //Game backend class
    GameLobby =     require('../../GameServer/lobby/GameLobby'),
    QuizLobby =     require('../../GameServer/lobby/QuizLobby'),
    DouDiZhuGame =  require('../../GameServer/game/DouDiZhu'),
    WaffleGame =    require('../../GameServer/game/WaffleWord'),
    QuizUp =        require('../../GameServer/game/QuizUp'),
    DouDiZhuCon =   require('../../GameServer/connection/DouDiZhuCon'),
    WaffleWordCon = require('../../GameServer/connection/WaffleWordCon'),
    QuizUpCon =     require('../../GameServer/connection/QuizUpCon');



BOK.inherits(Server, BaseLobbyServer);
/**
 * @param {socket.io} io
 * @param {monk} db Instance of monk
 * */
function Server(io, db) {
    BaseLobbyServer.call(this, io);

    this.regLobby('chat', new ChatLobby(new GameUserDao(db), new ChatDao(db)));
    this.regLobby('system', new MessageLobby({gameUserDao: new GameUserDao(db), messageDao: new MessageDao(db)}));

    var portalLobby = this.regLobby('gamePortal', new PortalLobby({gameUserDao: new GameUserDao(db)}));

    //reg game lobby
    portalLobby.addGameLobby(this.regLobby('waffle', new GameLobby('waffle', WaffleGame, WaffleWordCon)));
    portalLobby.addGameLobby(this.regLobby('doudizhu', new GameLobby('doudizhu', DouDiZhuGame, DouDiZhuCon)));
    portalLobby.addGameLobby(this.regLobby('quizup', new QuizLobby('quizup', QuizUp, {questionDao: new QuizQuestionDao(db), historyDao: new QuizHistoryDao(db)})));
}
