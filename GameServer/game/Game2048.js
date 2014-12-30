module.exports = QuizUp;
var BOK = require('../../common/bok/BOK'),
    QuizUpCon = require('../connection/QuizUpCon'),
    GamePlay = require('../core/l/GamePlay'),
    Game = require('./Game');

var TIMER_BAR_DURATION = 10000;

BOK.inherits(QuizUp, Game);
/**
 * @constructor
 * */
function Game2048(id) {
    Game.call(this, id);
    this.readyPlayerCons_ = [];
}
