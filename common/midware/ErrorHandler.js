/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-1
 * Time: 下午3:45
 * Write the description in this section.
 */

var CODE = require('../error/ErrorCode');

module.exports = function(err, req, res, next) {
    var msg = 'unknown error';
    switch(err.code) {
        case CODE.SEAT_ALREADY_TAKEN:
            msg = 'Seat ['+err.user.seat+'] already taken by: ' + err.user.name;
            console.error('error msg: '+msg);
            break;

        case CODE.USER_NOT_FOUND:
            msg = 'User id['+err.user.id+'] not found. ';
            console.error('error msg: '+msg);
            break;

        case CODE.USER_ADD_ERROR:
            msg = 'Server error when add new user ['+err.user.name+']. ';
            console.error('error msg: '+msg);
            break;

        case CODE.MUSIC_DATA_ERROR:
            msg = 'Cannot find music data. ';
            console.error('error msg: '+msg);
            break;

        case CODE.REMOVE_USER_ALL:
            msg = 'Unable to clear all users. ';
            console.error('error msg: '+msg);
            break;

        case CODE.GAME_ALLUSER_NOT_FOUND_ERROR:
            msg = 'Cannot find all game user data.';
            console.error('error msg: '+msg);
            break;

        default:
            msg = 'Unknown internal error. ';
            console.error(msg);
            console.error(err.stack);
    }

    res.send(500, {code:err.code, msg: msg});
};

