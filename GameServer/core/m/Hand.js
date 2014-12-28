/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-10
 * Time: 上午11:26
 * Write the description in this section.
 */
module.exports = Hand;
var BOK = require('../../../common/bok/BOK');
var CoreRule = require('../l/CoreRule');
var CardHelper = require('../util/CardHelper');

/**
 * @param {Array=} cards (optional) contains {string}
 * @param {string=} ownerName (optional) The name of the owner of this hand.
 * @param {string=} owner (optional) The side of the owner of this hand.
 * */
function Hand(cards, ownerName, owner) {
    this.owner_ = owner;
    this.ownerName_ = ownerName;
    this.cards_ = {};
    this.handType_ = null;
    this.handPower_ = 0;
    this.addCard(cards);
}

/**@param {Array} cards contains {string}
 * */
Hand.prototype.checkCardsInHand = function(cards) {
    var isInHand = true;
    BOK.each(cards, function(card){
        if(!this.cards_[card])
            isInHand = false;
    }, this);

    return isInHand;
};

Hand.prototype.isEmpty = function() {
    return 0 == this.getNumberOfCards();
};

Hand.prototype.setOwner = function(side) {
    this.owner_ = side;
};

Hand.prototype.getOwner = function() {
    return this.owner_;
};

Hand.prototype.getOwnerName = function() {
    return this.ownerName_;
};

Hand.prototype.getType = function() {
    if(!this.handType_) {
        this.calculateHandTypeAndPower_();
    }

    return this.handType_;
};

Hand.prototype.getPower = function() {
    //if hand type is not valid, recalculate power.
    if(!this.handType_) {
        this.calculateHandTypeAndPower_();
    }

    return this.handPower_;
};

/**
 * @return {Object}
 * */
Hand.prototype.getCards = function() {
    return this.cards_;
};

/**
 * @return {Array}
 * */
Hand.prototype.getSortedCards = function() {
    var sorted = [];
    BOK.each(this.cards_, function(card){
        CardHelper.insertCardToHand(card, sorted);
    });

    return sorted;
};

/**
 * @return {number}
 * */
Hand.prototype.getNumberOfCards = function() {
    return Object.keys(this.cards_).length;
};

/**@param {string|Array} card
 * */
Hand.prototype.addCard = function(card) {
    if('string' == typeof card)
        this.cards_[card] = card;
    else if('object' == typeof card) {
        BOK.each(card, function(c){
            this.cards_[c] = c;
        }, this);
    }

    this.handType_ = null;
};

/**@param {string|Array} card
 * */
Hand.prototype.removeCard = function(card) {
    if('string' == typeof card)
        delete this.cards_[card];
    else if('object' == typeof card) {
        BOK.each(card, function(c){
            delete this.cards_[c];
        }, this);
    }

    this.handType_ = null;
};

Hand.prototype.calculateHandTypeAndPower_ = function() {
    var aryTypeAndPower = CoreRule._getInstance_().getHandTypeAndPower(this.getSortedCards());
    this.handType_ = aryTypeAndPower[0];
    this.handPower_ = aryTypeAndPower[1];
};

