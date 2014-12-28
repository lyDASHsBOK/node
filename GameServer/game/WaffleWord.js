/**
 * Created by Envee.
 *
 * Date: 14-8-20
 * Time: 上午9:33
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */
module.exports = WaffleWord;
var BOK = require('../../common/bok/BOK'),
    WaffleWordCon = require('../connection/WaffleWordCon');
    Game = require('./Game');

BOK.inherits(WaffleWord, Game);
/**
 * @constructor
 */
function WaffleWord(id) {
    Game.call(this, id);

    this.readyPlayerCons_ = [];
}

/**
 * @override
 * */
WaffleWord.prototype.start_ = function(){
    console.log("waffle game start........");

    //init player connections
    BOK.each(this.playerCons_, function(con){
        con.addEventListener('playerLeftGame', BOK.createDelegate(this, this.onPlayerLeftGame_));
        con.addEventListener('gameStart', BOK.createDelegate(this, this.onGameStart_));
        con.addEventListener('waitingSlave', BOK.createDelegate(this, this.onWaitingSlave_));
        con.addEventListener('selectRight', BOK.createDelegate(this, this.onSelectRight_));
        con.addEventListener('refreshOpScore', BOK.createDelegate(this, this.onRefreshOpScore_));
        con.addEventListener('gameFinished', BOK.createDelegate(this, this.onGameFinished_));
    }, this);

    //broadcast all player info
    var infoCollection = [];
    BOK.each(this.playerCons_, function(con){
        infoCollection.push(con.playerInfo);
    });
    BOK.each(this.playerCons_, function(con){
        con.sendAllPlayerInfo(infoCollection);
    }, this);

    //start making game after all player info updated
    this.waitingMakeRaw_();
};


/**
 * @param {WaffleWordCon} con
 * */
WaffleWord.prototype.removeAllConHandlers_ = function(con) {
    if(con) {
        con.removeEventListener('playerLeftGame');
        con.removeEventListener('playerInfoReady');
        con.removeEventListener('gameStart');
        con.removeEventListener('waitingSlave');
        con.removeEventListener('selectRight');
        con.removeEventListener('refreshOpScore');
        con.removeEventListener('gameFinished');
    }
};
/*****************************Connection Event handlers*************************************/
WaffleWord.prototype.onPlayerLeftGame_ = function(e) {
    /** @type {WaffleWordCon} */
    var con = e.target;

    this.removeAllConHandlers_(con);
    //remove play connection from game
    BOK.findAndRemove(this.playerCons_, con);
};

WaffleWord.prototype.onGameStart_ = function(e) {
    BOK.each(this.playerCons_, function(con, i){
        con.gameStart();
    }, this);
};

WaffleWord.prototype.waitingMakeRaw_ = function() {
    BOK.each(this.playerCons_, function(con, i){
        con.waitingMakeRaw({type: (i==0 ? 'host': 'slave')});
    }, this);
};

WaffleWord.prototype.onWaitingSlave_ = function(e) {
    BOK.each(this.playerCons_, function(con, i){
        con.waitingSlave(e.body);
    }, this);
};

WaffleWord.prototype.onSelectRight_ = function(e) {
    BOK.each(this.playerCons_, function(con, i){
        if(e.target != con){
            con.setPartnerRight(e.body);
        }
    }, this);
};

WaffleWord.prototype.onRefreshOpScore_ = function(e) {
    BOK.each(this.playerCons_, function(con, i){
        if(e.target != con){
            con.refreshOpScore(e.body);
        }
    }, this);
};

WaffleWord.prototype.onGameFinished_ = function(e) {
    var iScore = e.body.iScore;
    var oppScore = e.body.oppScore;
    //release all connections
    BOK.each(this.playerCons_, function(con){
        if(con == e.target){
            con.getResult({res: (iScore - oppScore) });
        }else{
            con.getResult({res: (oppScore - iScore) });
        }
        this.removeAllConHandlers_(con);
    }, this);
    this.playerCons_ = [];
};

/**
 * @param {WaffleWordCon} con
 * @return {boolean} return true if all player ready.
 * */
WaffleWord.prototype.onePlayerReadyAndCheckAll_ = function(con) {
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
