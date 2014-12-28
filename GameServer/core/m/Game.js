/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-11
 * Time: 下午6:00
 * Write the description in this section.
 */
module.exports = Game;

var Hand = require('./Hand');
var BOK = require('../../../common/bok/BOK');
var CardType = require('../util/CardType');

/**
 * @param {Array} playerNames
 * */
function Game(playerNames) {
    //public var
    /** @type {Hand}*/
    this.centerHand = new Hand();
    this.deckCopy = null;

    //init deck
    this.deck_ = [];
    for(var i=1; i<=54; ++i) {
        this.deck_.push(CardType[i]);
    }
    BOK.shuffleArray(this.deck_);
    this.deckCopy = BOK.cloneObject(this.deck_);

    //generate the banker card after shuffle.
    this.bankerCard = this.deck_[BOK.randN(40)+7];

    //init hands
    this.hands_ = [];
    for(i=0; i < 3; ++i) {
        this.hands_[i] = new Hand([], playerNames[i]);
    }

    //setup table and
    this.bidingPlayerIndex = -1;
    var cardDealToPlayer = 0;
    //deal cards to each player until only 3 banker cards left
    while(this.deck_.length > 3) {
        var card = this.deck_.pop();
        this.hands_[cardDealToPlayer].addCard(card);
        if(card == this.bankerCard)
            this.bidingPlayerIndex = cardDealToPlayer;
        cardDealToPlayer = this.findOutNextPlayerIndex(cardDealToPlayer);
    }
    this.bottomCards = BOK.cloneObject(this.deck_);

    /** @type {number} suppose to be 0, 1, 2*/
    this.currentPlayerIndex_ = 0;
}

Game.prototype.setBanker = function(bankerName) {
    var bankerHand = null;
    BOK.each(this.hands_, function(hand, index){
        if(hand.getOwnerName() == bankerName) {
            bankerHand = hand;
            hand.setOwner('banker');
            this.currentPlayerIndex_ = index;
            var nextHandIndex = this.findOutNextPlayerIndex(index);
            this.hands_[nextHandIndex].setOwner('player1');
            nextHandIndex = this.findOutNextPlayerIndex(nextHandIndex);
            this.hands_[nextHandIndex].setOwner('player2');

            return BOK.BREAK;
        }
    }, this);

    //add all remaining cards to banker hand
    bankerHand.addCard(this.deck_);
    this.deck_ = [];
};

/**
 * @return {Hand}
 * */
Game.prototype.getCurrentPlayerHand = function() {
    return this.hands_[this.currentPlayerIndex_];
};

/**
 * @return {string}
 * */
Game.prototype.getCurrentPlayer = function() {
    return this.hands_[this.currentPlayerIndex_].getOwner();
};
Game.prototype.getNextPlayer = function() {
    return this.hands_[this.findOutNextPlayerIndex(this.currentPlayerIndex_)].getOwner();
};
/**
 * @return {string}
 * */
Game.prototype.getCurrentPlayerName = function() {
    return this.hands_[this.currentPlayerIndex_].getOwnerName();
};

Game.prototype.isFinished = function() {
    return this.getCurrentPlayerHand().isEmpty();
};

Game.prototype.nextPlayer = function() {
    if(!this.isFinished()) {
        this.currentPlayerIndex_ = this.findOutNextPlayerIndex(this.currentPlayerIndex_);
    }
};

Game.prototype.findOutNextPlayerIndex = function(currentHandNbr) {
    var next = currentHandNbr + 1;
    if(next >=3)
        next = 0;
    return next;
};


