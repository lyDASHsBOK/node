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
}

/**
 * @override
 * */
WaffleWord.prototype.start_ = function(){
    console.log("waffle game start........");

    //init player connections
    this.addPlayerConListener_('gameStart', this.onGameStart_);
    this.addPlayerConListener_('waitingSlave', this.onWaitingSlave_);
    this.addPlayerConListener_('selectRight', this.onSelectRight_);
    this.addPlayerConListener_('refreshOpScore', this.onRefreshOpScore_);
    this.addPlayerConListener_('gameFinished', this.onGameFinished_);

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


/*****************************Connection Event handlers*************************************/

WaffleWord.prototype.onGameStart_ = function(e) {
    BOK.each(this.playerCons_, function(con, i){
        con.gameStart();
    }, this);
};

WaffleWord.prototype.waitingMakeRaw_ = function() {
    BOK.each(this.playerCons_, function(con, i){
        con.waitingMakeRaw({type: (i===0 ? 'host': 'slave')});
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
    this.playerLeaveGame_(e.target);
};
