
module.exports = Game2048Con;
var BOK = require('../../common/bok/BOK'),
    GameCon = require('./GameCon');

BOK.inherits(Game2048Con, GameCon);
function Game2048Con(socket) {
    GameCon.call(this, socket);

    this.respondToEvent_(Game2048Con.COM.C2S.SETUP_FINISH);
    this.respondToEvent_(Game2048Con.COM.C2S.PLAYER_MOVE);
}

Game2048Con.COM = {
	C2S: {
		/**
		* Body: {Object} //raw data of grid.cells
		*/
		SETUP_FINISH: 'setupfinish',

		/**
		* Body: {
		*	direction: {number},	// 0: up, 1: right, 2: down, 3: left
		*	newTile: {
		*		position: {
		*		  x: {number},
		*		  y: {number}
		*		},
		*		value: {number}
		*  	},
		*	maxValue: {number}
		* }
		*/
		PLAYER_MOVE: 'playermove'
	},

	S2C: {
		/**
		* Body: null
		*/
		SETUP: 'setup',

		/**
		* Body: {Object} //raw data of grid.cells
		*/
		PLAYER2_START: 'player2start',

		/**
		* Body: {
		*	direction: {string},	//up, down, left, right
		*	newTile: {
		*		position: {x:{number}, y:{number}},
		*		value: {number}
		*	}
		* }
		*/
		YOUR_TURN: 'yourturn',

		/**
		* Body: {
		*	isWinner: {boolean}
		* }
		*/
		GAME_END: 'gameend'
	}
};

