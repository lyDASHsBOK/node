/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-23
 * Time: 上午9:36
 * Write the description in this section.
 */
/*
 Card define:
 spade   1-13 [1S, 2S ... XS, JS, QS, KS]
 heart   1-13 [1H, 2H ... XH, JH, QH, KH]
 club    1-13 [1C, 2C ... XC, JC, QC, KC]
 diamond 1-13 [1D, 2D ... XD, JD, QD, KD]
 jokers       [BJ, RJ]
 */

var CardType = [ '00',
    '1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'XD', 'JD', 'QD', 'KD',
    '1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'XC', 'JC', 'QC', 'KC',
    '1H', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'XH', 'JH', 'QH', 'KH',
    '1S', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'XS', 'JS', 'QS', 'KS',
    'BJ', 'RJ'
];

module.exports = CardType;