module.exports = Game2048;
var BOK = require('../../common/bok/BOK'),
    Game = require('./Game');


BOK.inherits(Game2048, Game);
/**
 * @constructor
 * */
function Game2048(id) {
    Game.call(this, id);
}


/**
 * @override
 * */
Game2048.prototype.start_ = function() {
    console.log("2048 game start........");

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

