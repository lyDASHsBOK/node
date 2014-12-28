/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-15
 * Time: 下午8:02
 * Write the description in this section.
 */
module.exports = AI;
var BOK = require('../../../common/bok/BOK');
var SingletonBase = require('../../../common/bok/SingletonBase');
var CoreRule = require('./CoreRule');

function AI() {
    return SingletonBase.call(this);
}

/**
 * @param {core.l.GamePlay} gamePlay
 * */
AI.prototype.go = function(gamePlay){
    var cards = this.getSuggestedHand(gamePlay.game_);
    if(cards) {
        setTimeout(function(){gamePlay.playHand(gamePlay.game_.getCurrentPlayer(), cards)}, 1000);
    } else
        setTimeout(function(){gamePlay.tryToPass()}, 1000);
};

/**
 * @param {core.l.GamePlay} gamePlay
 * */
AI.prototype.goBid = function(gamePlay, name){
    setTimeout(function(){gamePlay.callForBanker(name, 3)}, 1000);
};

/**
 * @param {core.m.Game} game
 * */
AI.prototype.getSuggestedHand = function(game){
    var playerHand = game.getCurrentPlayerHand();
    var handBreak = this.breakHand(playerHand.getSortedCards());
    var result = null;

    if(game.centerHand.isEmpty()) {
        if(handBreak[CoreRule.HAND_TYPE.THREE_OF_A_KIND].length > 0) {
            result = handBreak[CoreRule.HAND_TYPE.THREE_OF_A_KIND][0].concat(handBreak[CoreRule.HAND_TYPE.SINGLE][0]);
        } else if(handBreak[CoreRule.HAND_TYPE.PAIR].length > 0) {
            result = handBreak[CoreRule.HAND_TYPE.PAIR][0];
        } else if(handBreak[CoreRule.HAND_TYPE.SINGLE].length > 0){
            result = handBreak[CoreRule.HAND_TYPE.SINGLE][0];
        }else if(handBreak[CoreRule.HAND_TYPE.BOOOOM].length > 0){
            result = handBreak[CoreRule.HAND_TYPE.BOOOOM][0];
        }
    } else {
        var centerCardType = game.centerHand.getType();
        var centerCardPower = game.centerHand.getPower();
        var searchType = centerCardType;
        if(centerCardType == CoreRule.HAND_TYPE.THREE_OF_A_KIND_AND1)
            searchType = CoreRule.HAND_TYPE.THREE_OF_A_KIND;
        BOK.each(handBreak[searchType], function(cards){
            if(new CoreRule().getHandTypeAndPower(cards)[1] > centerCardPower)
            {
                result = cards;
                if(centerCardType == CoreRule.HAND_TYPE.THREE_OF_A_KIND_AND1)
                    result = result.concat(handBreak[CoreRule.HAND_TYPE.SINGLE][0]);
                return BOK.BREAK;
            }
        }, this);

        //use bomb if needed
        if(!result && searchType != CoreRule.HAND_TYPE.BOOOOM && handBreak[CoreRule.HAND_TYPE.BOOOOM].length > 0)
            result = handBreak[CoreRule.HAND_TYPE.BOOOOM][0];
    }

    return result;
};

AI.prototype.breakHand = function(handCards) {
    //joker bomb check
    var rule = new CoreRule();
    var cards = [handCards[handCards.length - 2], handCards[handCards.length - 1]];
    var result = {};
    for(var key in CoreRule.HAND_TYPE)
        result[CoreRule.HAND_TYPE[key]] = [];

    //early exit if only 1 card in hand.
    if(handCards.length < 2) {
        result[CoreRule.HAND_TYPE.SINGLE].push(handCards);
        return result;
    }

    if(rule.getHandTypeAndPower(cards)[0] == CoreRule.HAND_TYPE.BOOOOM) {
        result[CoreRule.HAND_TYPE.BOOOOM].push(cards);
        handCards.splice(handCards.length - 2);
    }

    var i;
    //bomb check
    for(i=0; i<handCards.length - 3; ++i) {
        cards = [handCards[i], handCards[i+1], handCards[i+2], handCards[i+3]];
        if(rule.getHandTypeAndPower(cards)[0] == CoreRule.HAND_TYPE.BOOOOM) {
            result[CoreRule.HAND_TYPE.BOOOOM].push(cards);
            handCards.splice(i, 4);
        }
    }

    //three of a kind check
    for(i=0; i<handCards.length - 2; ++i) {
        cards = [handCards[i], handCards[i+1], handCards[i+2]];
        if(rule.getHandTypeAndPower(cards)[0] == CoreRule.HAND_TYPE.THREE_OF_A_KIND) {
            result[CoreRule.HAND_TYPE.THREE_OF_A_KIND].push(cards);
            handCards.splice(i, 3);
        }
    }

    //pair check
    for(i=0; i<handCards.length - 1; ++i) {
        cards = [handCards[i], handCards[i+1]];
        if(rule.getHandTypeAndPower(cards)[0] == CoreRule.HAND_TYPE.PAIR) {
            result[CoreRule.HAND_TYPE.PAIR].push(cards);
            handCards.splice(i, 2);
        }
    }

    //put whatever rest to singles
    BOK.each(handCards, function(card){
        result[CoreRule.HAND_TYPE.SINGLE].push([card]);
    });

    return result;
};
