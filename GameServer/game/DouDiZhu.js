/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-23
 * Time: 下午1:44
 * Write the description in this section.
 */
module.exports = DouDiZhu;
var BOK = require('../../common/bok/BOK'),
    DouDiZhuCon = require('../connection/DouDiZhuCon'),
    GamePlay = require('../core/l/GamePlay'),
    Game = require('./Game');
var ROUND_DURATION = 15000;

BOK.inherits(DouDiZhu, Game);
/**
 * @constructor
 * */
function DouDiZhu(id) {
    Game.call(this, id);
    this.readyPlayerCons_ = [];
}

DouDiZhu.MAX_PLAYER = 3;

/**
 * @override
 */
DouDiZhu.prototype.start_ = function(){
    console.log("douDiZhu game start........");

    this.game_ = new GamePlay();
    this.actionTimeoutId_ = null;
    this.bidStarted_ = false;
    //Game event listeners
    this.game_.addEventListener('nextBid', BOK.createDelegate(this, this.onGameNextBid_));
    this.game_.addEventListener('gameStart', BOK.createDelegate(this, this.onGameStart_));
    this.game_.addEventListener('pass', BOK.createDelegate(this, this.onGamePass_));
    this.game_.addEventListener('play', BOK.createDelegate(this, this.onGamePlay_));
    this.game_.addEventListener('nextPlayer', BOK.createDelegate(this, this.onNextPlayer_));
    this.game_.addEventListener('gameFinished', BOK.createDelegate(this, this.onGameFinished_));

    //init player connections
    BOK.each(this.playerCons_, function(con){
        con.requestPlayerInfo();

        con.addEventListener('playerInfoReady', BOK.createDelegate(this, this.onOnePlayerInfoReady_));
        con.addEventListener('playerReadyToBid', BOK.createDelegate(this, this.onPlayerReadyToBid_));
        con.addEventListener('bidBanker', BOK.createDelegate(this, this.onPlayerBidBanker_));
        con.addEventListener('playerPass', BOK.createDelegate(this, this.onPlayerPass_));
        con.addEventListener('playCards', BOK.createDelegate(this, this.onPlayerPlayCards_));
    }, this);

};

DouDiZhu.prototype.gameStart_ = function(playerNames) {
    var  playerNum = playerNames.length;// if in set duration , players not  enough 3 ,do this oprations
    if(playerNum < 3){
        if(playerNum == 1){
            playerNames.push("AI-1");
            playerNames.push("AI-2");
            this.game_.enableAIForPlayer("AI-1");
            this.game_.enableAIForPlayer("AI-2");
        }
        if(playerNum == 2){
            playerNames.push("AI-2");
            this.game_.enableAIForPlayer("AI-2");
        }
    }

    this.game_.newGame(playerNames);

    this.resetAllReadyState_();

    //send init to players
    var sideNames = this.game_.getPlayerNames();
    var deck = this.game_.game_.deckCopy;
    var bankerCard = this.game_.game_.bankerCard;
    BOK.each(this.playerCons_, function(con, i){
        con.gameInit(sideNames, sideNames[i], deck, bankerCard);
    }, this);
};

/**
 * @param {DouDiZhuCon} con
 * @return {boolean} return true if all player ready.
 * */
DouDiZhu.prototype.onePlayerReadyAndCheckAll_ = function(con) {
    this.readyPlayerCons_.push(con);
    //all player ready check
    var ready = true;
    if(this.readyPlayerCons_.length == this.playerCons_.length) {
         BOK.each(this.readyPlayerCons_, function(con){
            if(BOK.findInArray(this.playerCons_, con) < 0) {
                ready = false;
                return BOK.BREAK;
            }
        }, this);       
    } else {
        ready = false;
    }

    return ready;
};

DouDiZhu.prototype.resetAllReadyState_ = function() {
    this.readyPlayerCons_ = [];
};

DouDiZhu.prototype.playerActionTimeout_ = function() {
    this.game_.tryToPass();
};

DouDiZhu.prototype.stopActionTimeout_ = function() {
    if(this.actionTimeoutId_) {
        clearTimeout(this.actionTimeoutId_);
        this.actionTimeoutId_ = null;
    }
};

/**
 * @param {DouDiZhuCon} con
 * */
DouDiZhu.prototype.removeAllConHandlers_ = function(con) {
    if(con) {
        con.removeEventListener('playerLeftGame');
        con.removeEventListener('playerDisconnected');
        con.removeEventListener('playerInfoReady');
        con.removeEventListener('playerReadyToBid');
        con.removeEventListener('bidBanker');
        con.removeEventListener('playerPass');
        con.removeEventListener('playCards');
    }
};

/*****************************Event handlers*************************************/
DouDiZhu.prototype.onGameNextBid_ = function(e) {
    BOK.each(this.playerCons_, function(con){
        con.nextBid(e.body);
    }, this);
};

DouDiZhu.prototype.onGameStart_ = function(e) {
    BOK.each(this.playerCons_, function(con){
        con.gameStart(e.body);
    }, this);
};

DouDiZhu.prototype.onGamePass_ = function(e) {
    BOK.each(this.playerCons_, function(con){
        con.gamePass(e.body);
    }, this);
};

DouDiZhu.prototype.onGamePlay_ = function(e) {
    BOK.each(this.playerCons_, function(con){
        con.handPlayed(e.body);
    }, this);
};

DouDiZhu.prototype.onNextPlayer_ = function(e) {
    this.stopActionTimeout_();

    this.actionTimeoutId_ = setTimeout(BOK.createDelegate(this, this.playerActionTimeout_),
        ROUND_DURATION);
    e.body.roundDuration = ROUND_DURATION;
    BOK.each(this.playerCons_, function(con){
        con.nextPlayer(e.body);
    }, this);
};

DouDiZhu.prototype.onGameFinished_ = function(e) {
    //release all connections
    BOK.each(this.playerCons_, function(con){
        this.removeAllConHandlers_(con);
    }, this);

    this.stopActionTimeout_();

    BOK.each(this.playerCons_, function(con){
        con.gameFinished(e.body);
    }, this);
};

/*****************************Connection Event handlers*************************************/

/**
 * @override
 * @param {DouDiZhuCon} con
 * @private
 */
DouDiZhu.prototype.playerLeaveGame_ = function(con) {
    DouDiZhu.superClass_.playerLeaveGame_.call(this, con);

    //AI take over control when player disconnected
    this.game_.enableAIForPlayer(con.getPlayerName());
    if(this.bidStarted_){
        this.game_.goAIPlayer();
    }

    this.removeAllConHandlers_(con);
};

DouDiZhu.prototype.onPlayerPlayCards_ = function(e) {
    this.game_.playHand(e.body.name, e.body.cards);
};

DouDiZhu.prototype.onPlayerBidBanker_ = function(e) {
    this.game_.callForBanker(e.target.getPlayerName(), e.body);
};

DouDiZhu.prototype.onPlayerPass_ = function(e) {
    this.game_.tryToPass(e.target.getPlayerName());
};

DouDiZhu.prototype.onPlayerReadyToBid_ = function(e) {
    console.log('player '+e.target.getPlayerName()+' is ready to bid.');
    if(this.onePlayerReadyAndCheckAll_(e.target)) {
        this.bidStarted_ = true;
        this.game_.nextBidForBanker();
        console.log('Bidding for banker started...');
    }
};

DouDiZhu.prototype.onOnePlayerInfoReady_ = function(e) {
    console.log('player '+e.target.getPlayerName()+' is ready.');
    if(this.onePlayerReadyAndCheckAll_(e.target)) {
        var playerNames = [];
        BOK.each(this.playerCons_, function(con){
            playerNames.push(con.getPlayerName());
        }, this);

        this.gameStart_(playerNames);
    }
};

