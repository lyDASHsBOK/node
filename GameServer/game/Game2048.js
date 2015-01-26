module.exports = Game2048;
var BOK = require('../../common/bok/BOK'),
    Game2048Con = require('../connection/Game2048Con'),
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
    if(this.playerCons_.length < 2) {
        console.log("2048 player not enough........");
        return;
    }
    console.log("2048 game start........");

    //init player connections
    this.addPlayerConListener_(Game2048Con.COM.C2S.SETUP_FINISH, this.onSetupFinished_);
    this.addPlayerConListener_(Game2048Con.COM.C2S.PLAYER_MOVE, this.onPlayerMoved_);
    //tell host to setup the game
    this.playerCons_[0].send_(Game2048Con.COM.S2C.SETUP);
};


/**
 * Event listener
 * @private
 * */
Game2048.prototype.onSetupFinished_ = function(e) {
    this.playerCons_[1].send_(Game2048Con.COM.S2C.PLAYER2_START, e.body);
};

/**
 * Event listener
 * @private
 * */
Game2048.prototype.onPlayerMoved_ = function(e) {
    var playerCon = e.target;
    var oppCon = this.playerCons_[(this.playerCons_[0] == playerCon)|0];
    var lastMove = e.body;

    //send player move to opponent
    oppCon.send_(Game2048Con.COM.S2C.YOUR_TURN, lastMove);

    //end game if condition met
    if(lastMove.maxValue >= 32) {
        playerCon.send_(Game2048Con.COM.S2C.GAME_END, {isWinner: true});
        oppCon.send_(Game2048Con.COM.S2C.GAME_END, {isWinner: false});
    }
};

