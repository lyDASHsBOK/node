/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-10
 * Time: 上午11:28
 * Write the description in this section.
 */
var BOK = require('../../../common/bok/BOK');

var CardHelper = {
    /**
     * @param {string} type Should came from CardType.
     * @return {number}
     * */
    getCardSuitOrder: function(type) {
        var v = type[1];
        var p = 0;
        switch(v) {
            case '0':
                p = 0;
                break;
            case 'D':
                p = 1;
                break;
            case 'C':
                p = 2;
                break;
            case 'H':
                p = 3;
                break;
            case 'S':
                p = 4;
                break;
            case 'J':
                p = 100;
                break;
            default:
                BOK.error("CardHelper.getCardSuitOrder: Unknown card value ["+type+"]");
        }

        return p;
    },

    /**
     * @param {string} type Should came from CardType.
     * @return {number}
     * */
    getCardPoint: function(type) {
        var v = type[0];
        var p = parseInt(v);
        switch(v) {
            case '0':
                p = 0;
                break;
            case 'X':
                p = 10;
                break;
            case 'J':
                p = 11;
                break;
            case 'Q':
                p = 12;
                break;
            case 'K':
                p = 13;
                break;
            case '1':
                p = 14;
                break;
            case '2':
                p = 50;
                break;
            case 'B':
                p = 99;
                break;
            case 'R':
                p = 100;
                break;
            default:
                if(isNaN(p))
                    BOK.error("CardHelper.getCardPoint: Unknown card value ["+type+"]");
        }

        return p;
    },

    /**@param {string|Object} card
     * @param {Array} hand contains {string|Object}
     * @param {Function=} getterFunc (optional) The function to extract card value
     *     if the hand contains something other than string
     * */
    insertCardToHand: function (card, hand, getterFunc) {
        //add card to proper place
        var cardValue = getterFunc ? getterFunc(card) : card;
        var p = this.getCardPoint(cardValue);
        var s = this.getCardSuitOrder(cardValue);
        var insertIndex = 0;
        BOK.each(hand, function(cardInHand){
            var cardValue = getterFunc ? getterFunc(cardInHand) : cardInHand;
            var cp = this.getCardPoint(cardValue);
            var cs = this.getCardSuitOrder(cardValue);

            if(cp > p || (cp == p && cs > s))
                return BOK.BREAK;

            insertIndex++;
        }, this);

        hand.splice(insertIndex, 0, card);

        return hand;
    },

    /**
     * @param {Array|Object} cards contains {string}
     * @param {number=} startIndex
     * @param {number=} checkLength
     * */
    sameKindInCards: function (cards, startIndex, checkLength) {
        var checkingCards = checkLength ? cards.concat().splice(startIndex, checkLength) : cards;
        var isSameKind = true;
        var onThePoint = 0;
        BOK.each(checkingCards, function(card){
            var point = this.getCardPoint(card);

            if(!onThePoint)
                onThePoint = point;
            else if(onThePoint != point)
                isSameKind = false;
        }, this);

        return isSameKind;
    },

    /**
     * @param {Array} cards contains {string}, must be a sorted card array
     * */
    straightInCards: function (cards) {
        var isStraight = true;
        var currentPoint = 0;
        BOK.each(cards, function(card){
            var point = this.getCardPoint(card);

            if(!currentPoint)
                currentPoint = point;
            else if(++currentPoint != point)
                isStraight = false;
        }, this);

        return isStraight;
    }
};

module.exports = CardHelper;