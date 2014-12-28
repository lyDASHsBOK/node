/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-11
 * Time: 下午5:37
 * Write the description in this section.
 */
module.exports = CoreRule;

var SingletonBase = require('../../../common/bok/SingletonBase');
var CardHelper = require('../util/CardHelper');


function CoreRule() {
    return SingletonBase.call(this);
}
new CoreRule();

CoreRule.HAND_TYPE = {
    UNKNOWN: 'unknown',
    SINGLE: 'single',
    PAIR: 'pair',
    THREE_OF_A_KIND: 'threeOfAKind',
    THREE_OF_A_KIND_AND1: 'threeOfAKindAnd1',
    STRAIGHT: 'straight',
    STRAIGHT_PAIR: 'straightPair',
    SIDE_BY_SIDE: 'sideBySide',             //something like AAABBB
    SIDE_BY_SIDE_AND1: 'sideBySideAnd1',    //something like XAAABBBY
    FOUR_OF_A_KIND_AND2: 'fourOfAKindAnd2',
    BOOOOM: 'bomb'
};

/**
 * PLayer order 'banker'->'player1'->'player2'
 * */
CoreRule.prototype.getNextPlayer = function(currentPlayer) {
    switch(currentPlayer) {
        case 'banker':
            return 'player1';
        case 'player1':
            return 'player2';
        case 'player2':
            return 'banker';
        default:
            throw new Error('CoreRule.getNextPlayer: invalid player name ['+currentPlayer+']');
    }
};

/**
 * @param {Array} cards contains {string} An array of sorted cards
 * */
CoreRule.prototype.getHandTypeAndPower = function(cards) {
    var nbrCards = cards.length;

    //check single
    if(1 == nbrCards)
        return [CoreRule.HAND_TYPE.SINGLE, CardHelper.getCardPoint(cards[0])];

    //check pair
    if(2 == nbrCards && CardHelper.sameKindInCards(cards)) {
        return [CoreRule.HAND_TYPE.PAIR, CardHelper.getCardPoint(cards[0])];
    }

    //check three-of-a-kind
    if(3 == nbrCards && CardHelper.sameKindInCards(cards)) {
        return [CoreRule.HAND_TYPE.THREE_OF_A_KIND, CardHelper.getCardPoint(cards[0])];
    }

    //check three-of-a-kind and one
    if(4 == nbrCards && !CardHelper.sameKindInCards(cards)) {
        if(CardHelper.sameKindInCards(cards, 0, 3) ||
            CardHelper.sameKindInCards(cards, 1, 3))
            return [CoreRule.HAND_TYPE.THREE_OF_A_KIND_AND1, CardHelper.getCardPoint(cards[1])];
    }

    //check straight
    if(nbrCards >= 5 && CardHelper.straightInCards(cards)) {
        return [CoreRule.HAND_TYPE.STRAIGHT, CardHelper.getCardPoint(cards[0])];
    }

    //check straight pair
    var isValid, currentPoint, i, point;
    if(nbrCards >= 6 && 0 == nbrCards % 2 && CardHelper.sameKindInCards(cards, 0, 2)) {
        isValid = true;
        currentPoint = 0;
        for(i = 1; i < cards.length; i += 2) {
            point = CardHelper.getCardPoint(cards[i]);

            if(!currentPoint)
                currentPoint = point;
            else if(++currentPoint != point)
                isValid = false;
        }

        if(isValid)
            return [CoreRule.HAND_TYPE.STRAIGHT_PAIR, CardHelper.getCardPoint(cards[0])];
    }

    //check side-by-side
    if(nbrCards >= 6 &&  0 == nbrCards % 3 && CardHelper.sameKindInCards(cards, 0, 3)) {
        isValid = true;
        currentPoint = 0;
        for(i = 2; i < cards.length; i += 3) {
            point = CardHelper.getCardPoint(cards[i]);

                if(!currentPoint)
                currentPoint = point;
            else if(++currentPoint != point)
                isValid = false;
        }

        if(isValid)
            return [CoreRule.HAND_TYPE.SIDE_BY_SIDE, CardHelper.getCardPoint(cards[0])];
    }

    //check side-by-side and one
    if (nbrCards >= 8 && 0 == nbrCards % 4) {
        isValid = true;
        currentPoint = 0;
        i = 0;
        var expectedStraight = nbrCards / 4;
        var actualStraight = 0;
        while (i < cards.length && expectedStraight > actualStraight) {
            if(CardHelper.sameKindInCards(cards, i, 3)) {
                point = CardHelper.getCardPoint(cards[i]);
                if(!currentPoint)
                    currentPoint = point;
                else if(++currentPoint != point)
                    isValid = false;

                i += 3;
                actualStraight++;
            } else {
                i++;
            }
        }

        if(expectedStraight == actualStraight && isValid)
            return [CoreRule.HAND_TYPE.SIDE_BY_SIDE_AND1, point];
    }

    //check four-of-a-kind and two
    if (6 == nbrCards) {
        for (i = 0; i < 3; i++) {
            if (CardHelper.sameKindInCards(cards, i, 4))
                return [CoreRule.HAND_TYPE.FOUR_OF_A_KIND_AND2, CardHelper.getCardPoint(cards[i])];
        }
    }

    //check bomb
    if( (4 == nbrCards && CardHelper.sameKindInCards(cards, 0, 4)) ||
        (2 == nbrCards && 'BJ' == cards[0] && 'RJ' == cards[1]) )
        return [CoreRule.HAND_TYPE.BOOOOM, CardHelper.getCardPoint(cards[0])];

    return [CoreRule.HAND_TYPE.UNKNOWN, 0];
};





