/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-10-28
 * Time: 下午3:03
 * Write the description in this section.
 */

module.exports = Server;
var BOK = require('../../common/bok/BOK'),
    GuestDao = require('../../common/dao/GuestDao'),
    ChatDao = require('../../common/dao/ChatDao'),
    ReportingDao = require('../../common/dao/ReportingDao'),
    ServiceDao = require('../../common/dao/ServiceDao'),
    QuizQuestionDao = require('../../GameServer/dao/QuizQuestionDao'),
    QuizHistoryDao  = require('../../GameServer/dao/QuizHistoryDao'),
    BaseLobbyServer = require('../../common/net/ws/BaseLobbyServer'),
    ChatLobby = require('../../common/net/ws/chat/ChatLobby'),
    MessageLobby = require('../lobby/MessageLobby'),

    //Game backend class
    GameLobby = require('../../GameServer/lobby/GameLobby'),
    QuizLobby =     require('../../GameServer/lobby/QuizLobby'),
    WaffleGame = require('../../GameServer/game/WaffleWord'),
    WaffleWordCon = require('../../GameServer/connection/WaffleWordCon'),
    DouDiZhuGame = require('../../GameServer/game/DouDiZhu'),
    QuizUp =        require('../../GameServer/game/QuizUp'),
    QuizUpCon =     require('../../GameServer/connection/QuizUpCon'),
    DouDiZhuCon = require('../../GameServer/connection/DouDiZhuCon');



BOK.inherits(Server, BaseLobbyServer);
/**
 * @param {socket.io} io
 * @param {monk} db Instance of monk
 * */
function Server(io, db) {
    BaseLobbyServer.call(this, io);

    this.regLobby('chat', new ChatLobby(new GuestDao(db), new ChatDao(db)));
    this.regLobby('system', new MessageLobby(new ReportingDao(db), new ServiceDao(db)));
    this.regLobby('waffle', new GameLobby('WaffleLobby', WaffleGame, WaffleWordCon));
    this.regLobby('doudizhu', new GameLobby('DouDiZhuLobby', DouDiZhuGame, DouDiZhuCon));
    this.regLobby('quizup', new QuizLobby('QuizUpLobby', QuizUp, {questionDao: new QuizQuestionDao(db), historyDao: new QuizHistoryDao(db)}));
}
