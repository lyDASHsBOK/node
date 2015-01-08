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
        //con.socket_.on('');
    });

    //start game
    BOK.each(this.playerCons_, function(con){
        con.send_('gamestart');
    });


};

