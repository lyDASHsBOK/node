/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-3
 * Time: 下午1:56
 * Write the description in this section.
 */

var _ = require('underscore');
var ERROR_CODE = require('../common/error/ErrorCode');
var GuestDao = require('../common/dao/GuestDao');
var ServiceDao = require('../common/dao/ServiceDao');
var ReportingDao = require('../common/dao/ReportingDao');
var MusicDao = require('./dao/MusicDao');
var AlbumDao = require('./dao/AlbumDao');
var AdminLoginDao = require('../common/dao/AdminLoginDao');
var GameUserDao = require('../common/dao/GameUserDao');
var TransactionDao = require('../common/dao/TransactionDao');

module.exports = function(app, db){
    var guestDao = new GuestDao(db);
    var musicDao = new MusicDao(db);
    var albumDao = new AlbumDao(db);
    var serviceDao = new ServiceDao(db);
    var adminLoginDao = new AdminLoginDao(db);
    var reportingDao = new ReportingDao(db);
    var gameUserDao = new GameUserDao(db);
    var transactionDao = new TransactionDao(db);

    app.get('/reporting/:type', function (req, res, next) {
        reportingDao.getReportByType(req.params.type,function(err, doc) {
            if(err) {
                var error = new Error();
                next(error);
            } else {
                res.send(doc);
            }
        });
    });

    app.get('/', function (req, res) {
        res.send('Wifi http RESTful services');
    });
    /**
     * */
    app.get('/clearGuests', function (req, res, next) {
        guestDao.removeUserAll(function(err, doc) {
            if(err) {
                var error = new Error();
                error.code = ERROR_CODE.REMOVE_USER_ALL;
                next(error);
            } else {
                res.send(doc);
            }
        });
    });
    /**
     * */
    app.get('/seatMap', function (req, res, next) {
        guestDao.getUserAll(function(err, doc) {
            if(err) {
                var error = new Error();
                error.code = ERROR_CODE.USER_NOT_FOUND;
                next(error);
            } else {
                res.send(doc);
            }
        });
    });
    /**
     * @param {Object} data User info, in format:
     *  {
     *      user: {string}
     *      pwd: {string}
     *  }
     * */
    app.post('/adminLogin', function (req, res, next) {
        console.log("request cookie - ");
        console.log(req.cookies);


        var data = req.body;
        adminLoginDao.getUserPwd(data, function(err, password) {
            console.log("admin password: "+password);
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.ADMIN_LOGIN_ERROR;
                error.user = data.user;
                next(error);
            } else {
                if (password && password == data.pwd) {
                    //write cookie
                    var date=new Date();
                    var expireDays=10; //set cookie after ten days can't used
                    date.setTime(date.getTime() + expireDays*24*3600*1000);
                    res.setHeader('Set-Cookie',['SSID=Ap4GTEq','user=' + data.user, 'password=' + password , 'expire=' + date.toGMTString()]);
                    res.send({success: 0});
                } else {
                    var error = new Error();
                    error.code = ERROR_CODE.ADMIN_LOGIN_ERROR;
                    error.user = data.user;
                    next(error);
                }
            }
        });
    });

    app.post('/checklogin', function(req, res, next){
        // 获得客户端的Cookie
        var cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
            var parts = Cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        });

        if(cookies.user && cookies.password){
            adminLoginDao.getUserPwd({user: cookies.user}, function(err, password) {
                if (err) {
                    var error = new Error();
                    error.code = ERROR_CODE.ADMIN_LOGIN_ERROR;
                    error.user = data.user;
                    next(error);
                    res.send({success: 0});
                } else {
                    if (password && password == cookies.password) {
                        res.send({success: 1});
                    } else {
                        res.send({success: 0});
                    }
                }
            });
        }else{
            res.send({success: 0});
        }

    });

    /**
     * @param {Object} data User info, in format:
     *  {
     *      seat: {string}
     *      name: {string}
     *      avatar: {string}
     *      sex: {string}
     *      lang: {string}
     *  }
     * */
     app.post('/guestLogin', function (req, res, next) {
         console.log("request cookie - ");
         console.log(req.cookies);

         var data = req.body;
         data.seat = data.seat.toUpperCase();
         if(data.seat[0] == '0')
            data.seat = data.seat.substr(1);

         guestDao.getUserOnSeat(data.seat, function(err, doc) {
             if(doc) {
                 var error = new Error();
                 error.code = ERROR_CODE.SEAT_ALREADY_TAKEN;
                 error.user = doc;
                 next(error);
             } else {
                 guestDao.addUser(req.body, function(err, doc) {
                     if (err) {
                         var error = new Error();
                         error.code = ERROR_CODE.USER_ADD_ERROR;
                         error.user = {name: data.name};
                         next(error);
                     } else {
                         console.log('user added - ');
                         console.log(doc);
                         //noinspection JSUnusedGlobalSymbols
                         res.send({guestID:doc._id});
                     }
                 });
             }
         });
    });
    /**
     * @param {Object} data User info, in format:
     *  {
     *      seat: {string}
     *      name: {string}
     *      avatar: {string}
     *      sex: {string}
     *      lang: {string}
     *  }
     * */
    app.post('/exitLogin', function (req, res, next) {

        var data = req.body;
        data.seat = data.seat.toUpperCase();
        guestDao.removeUserOnSeat(data.seat, function(err, doc) {
            if(doc) {
                var error = new Error();
                error.code = ERROR_CODE.SEAT_ALREADY_TAKEN;
                error.user = doc;
                next(error);
            } else {
                guestDao.removeUser(req.body, function(err, doc) {
                    if (err) {
                        var error = new Error();
                        error.code = ERROR_CODE.USER_REMOVE_ERROR;
                        error.user = {name: data.name};
                        next(error);
                    } else {
                        console.log('user removed - ');
                        console.log(doc);
                        //noinspection JSUnusedGlobalSymbols
                        res.send({success:doc});
                    }
                });
            }
        });
    });
    /**
     * @param {Object} data User id, in format:
     *  {
     *      id: {string}
     *  }
     * */
    app.post('/guestInfo', function (req, res, next) {
        var data = req.body;
        guestDao.getUserById(data.id, function(err, doc) {
            if(err) {
                var error = new Error();
                error.code = ERROR_CODE.USER_NOT_FOUND;
                error.user = {id: data.id};
                next(error);
            } else {
                res.send(doc);
            }
        });
    });
    /**
     * @param {Object} data User id, in format:
     *  {
     *      id: {string}
     *  }
     * */
    app.get('/serviceMsg/:id', function (req, res, next) {
        var data = req.params;
        serviceDao.getMsgById(data.id, function(err, doc) {
            if(err) {
                var error = new Error();
                error.code = ERROR_CODE.SERVICEMSG_NOT_FOUND;
                error.user = {id: data.id};
                next(error);
            } else {
                res.send(doc);
            }
        });
    });
    app.get('/music/:cat', function (req, res, next) {
        musicDao.getMusic(req.params.cat, function(err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.MUSIC_DATA_ERROR;
                next(error);
            } else {
                _.each(doc, function(item){
                    delete item._id;
                });
                res.send(doc);
            }
        });

    });
    app.get('/album/:id', function (req, res, next) {
        albumDao.getAlbum(req.params.id, function(err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.MUSIC_DATA_ERROR;
                next(error);
            } else {
                _.each(doc, function(item){
                    delete item._id;
                });
                res.send(doc);
            }
        });

    });
    app.get('/login', function (req, res) {
        res.send('login page');
    });

    /**
     * @param {Object} data User info , in format:
     *  {
     *      email: {string}
     *      password: {string}
     *  }
     */
    app.post('/game/user/login', function (req, res, next) {
        var data = req.body;
        console.log(data);
        gameUserDao.getPwdByEmail(data.email, function (err, password) {
            console.log("admin password: " + password);
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_USER_LOGIN_ERROR;
                error.user = data.user;
                next(error);
            } else {
                if (password && password == data.password) {
                    //write cookie
                    var date = new Date();
                    var expireDays = 1; //set cookie after ten days can't used
                    expireDays = data['isRemember'] ? 1 : 0.5;
                    date.setTime(date.getTime() + expireDays * 24 * 3600 * 1000);
                    res.setHeader('Set-Cookie', ['SSID=Ap4GTEq', 'email=' + data.email, 'password=' + password , 'expire=' + date.toGMTString()]);
                    res.send({code:200});
                } else {
                    res.send({code:400});
                }
            }
        });
    });
    /**
     * @param {Object} user  the data in format:
     *         {
     *             email: {string},
     *             name : {string},
     *             IdCard: {string},
     *             avatar: {string} // the path of avatar,
     *             password:{string}
     *         }
     */
    app.post('/game/user/register', function (req, res, next) {
        var data = req.body;
        console.log("register:" + JSON.stringify(data));
        gameUserDao.getUserByEmail(data.email, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_USER_NOT_FOUND_ERROR;
                error.email = data.email;
                next(error);
            } else {
                if(doc != null){
                    res.send({success: 2});
                }else{
                    gameUserDao.addUser(data, function (err, doc) {
                        if (err) {
                            var error = new Error();
                            error.code = ERROR_CODE.GAME_USER_REGISTER_ERROR;
                            error.user = data.name;
                            next(err);
                        } else {
                            doc == null ? (res.send({success: 0})) : (res.send({success: 1}));
                        }
                    });
                }
            }
        });

    });

    app.get('/game/user/info', function (req, res, next) {
        // 获得客户端的Cookie
        var cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
            var parts = Cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        });
        console.log("cookie:"+ JSON.stringify(cookies));
        var email = cookies.email;
        gameUserDao.getUserByEmail(email, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_USER_NOT_FOUND_ERROR;
                error.email = email;
                next(error);
            } else {
                res.send(doc);
            }
        });
    });
    /**
     * get all game user
     */
    app.get('/game/user/all', function (req, res, next) {
        gameUserDao.getAllUser(function (err, docs) {
            if(err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_ALLUSER_NOT_FOUND_ERROR;
                next(error);
            } else {
                res.send(docs);
            }
        });
    });
    /**
     *  exit game platform
     */
    app.post('/game/user/exit', function (req, res, next) {
        res.setHeader('Set-Cookie', ['SSID=Ap4GTEq', 'email=,password=,expire=' +(new Date(0)).toGMTString()]);
        res.send({success:0});
    });
    /**
     * @param {Object} data Credit, in format:
     * {
     *             email: {string},
     *             amount : {num},
     *             operate: {string}
     * }
     */
    app.post('/transaction/CreditAccount', function (req, res, next) {
        var data = req.body;
        data.time = getTime();
        transactionDao.addTransaction(data, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.TRANSACTION_CREDIT_ERROR;
                next(error);
            } else {
                var t = doc;
                console.log("transaction Credit Account data:" + doc);
                gameUserDao.updateAccount(t,function (err, doc) {
                    if(err) {
                        var error = new Error();
                        error.code = ERROR_CODE.GAME_ALLUSER_NOT_FOUND_ERROR;
                        next(error);
                        transactionDao.removeTransaction(t);
                    } else {
                        if(doc != null){
                            transactionDao.updateTransaction(t);
                            res.send(doc);
                        }else{
                            res.send(null);
                        }
                    }
                });
            }
        });
    });
    /**
     * @param {Object} data Credit, in format:
     * {
     *             email: {string},
     *             amount : {num},
     *             operate: {string}
     * }
     */
    app.post('/transaction/DebitAccount', function (req, res, next) {
        var data = req.body;
        data.time = getTime();
        transactionDao.addTransaction(data, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.TRANSACTION_DEBIT_ERROR;
                next(error);
            } else {
                var t = doc;
                console.log("transaction Debit Account data:" + doc);
                gameUserDao.getUserByEmail(t.email, function (err, doc) {
                    if (err) {
                        var error = new Error();
                        error.code = ERROR_CODE.GAME_USER_NOT_FOUND_ERROR;
                        error.email = email;
                        next(error);
                    } else {
                        if(doc != null){
                            if(doc.balance >= t.amount){
                                gameUserDao.updateAccount(t,function (err, doc) {
                                    if(err) {
                                        var error = new Error();
                                        error.code = ERROR_CODE.GAME_ALLUSER_NOT_FOUND_ERROR;
                                        next(error);
                                    } else {
                                        if(doc != null){
                                            transactionDao.updateTransaction(t);
                                            res.send(doc);
                                        }else{
                                            res.send(null);
                                        }
                                    }
                                });
                            }else{
                                transactionDao.removeTransaction(t);
                                res.send({error: 10});
                            }
                        }else{
                            res.send(null);
                        }
                    }
                });

            }
        });
    });
};

function getTime(){
    var date = new Date();
    return date.getFullYear() + '-' + getTimeFormat(date.getMonth()+1) + '-' + getTimeFormat(date.getDate()) + ' ' +getTimeFormat(date.getHours()) + ':' + getTimeFormat(date.getMinutes()) + ':' + getTimeFormat(date.getSeconds());
}
function getTimeFormat(t){
    if( parseInt(t) < 10 ){
        t = '0' + t;
    }
    return t;
}