/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-3
 * Time: 下午1:56
 * Write the description in this section.
 */

var _ = require('underscore'),
    http = require("http"),
    url = require("url"),
    fs = require('fs'),
    crypto = require('crypto');
    multiparty = require('multiparty'),
    util = require('util'),
    BOK = require("../common/bok/BOK"),
    ERROR_CODE = require('../common/error/ErrorCode'),
    AdminLoginDao = require('../common/dao/AdminLoginDao'),
    GameUserDao = require('../common/dao/GameUserDao'),
    QuestionDao = require('../GameServer/dao/QuizQuestionDao'),
    GameDao = require('../common/dao/GameDao'),
    ccap = require('ccap'),
    captchaTxt = null;
    ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db){
    var adminLoginDao = new AdminLoginDao(db);
    var gameUserDao = new GameUserDao(db);
    var questionDao = new QuestionDao(db);
    var gameDao = new GameDao(db);

    app.get('/', function (req, res) {
        res.send('Wifi-GamePlatform http RESTful services');
    });

    /**
     * @param {Object} data User info, in format:
     *  {
     *      user: {string}
     *      pwd: {string}
     *  }
     * */
    app.post('/adminLogin', function (req, res, next) {
        console.log(req.cookies);

        var data = req.body;
        adminLoginDao.getUserPwd(data, function(err, password) {
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
                    error = new Error();
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
     * @param {Object} data User info , in format:
     *  {
     *      email: {string}
     *      password: {string}
     *  }
     */
    app.post('/game/user/login', function (req, res, next) {
        var data = req.body;
        var md5Cry=crypto.createHash("md5");
        md5Cry.update(data.password);
        data.password = md5Cry.digest('hex');
        gameUserDao.getPwdByEmail(data.email, function (err, password) {
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
     *             password:{string},
     *             verify:{string}
     *         }
     */
    app.post('/game/user/register', function (req, res, next) {
        var data = req.body;
        if(data.verify && data.verify.toLowerCase() != captchaTxt.toLowerCase()){
            res.send({success: 0});
        }
        var md5Cry=crypto.createHash("md5");
        md5Cry.update(data.password);
        data.password = md5Cry.digest('hex');
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

    app.get('/captcha', function (req, res, next) {
        var captcha = ccap({

            width:150,//set width,default is 256

            height:45,//set height,default is 60

            offset:35,//set text spacing,default is 40

            quality:100,//set pic quality,default is 50

            fontsize: 35 ,

            generate:function(){//Custom the function to generate captcha text
                //generate captcha text here
                var charArr = ['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                var text = '';
                for(var i = 0; i < 4; i ++){
                    var flag = BOK.randN(2);
                    var randText = charArr[BOK.randN(charArr.length)];
                    text += flag == 1 ? randText : randText.toLowerCase();
                }
                return text;//return the captcha text
            }
        });
        var ary = captcha.get();

        var txt = ary[0];

        var buf = ary[1];
        captchaTxt = txt;
        res.end(buf);
        console.log(txt);
    });
    app.post('/validate/captcha', function (req, res, next){
        var captcha = req.body.verify;
        console.log('xx' +captcha +'--' + captchaTxt);
        res.send({success:captchaTxt.toLowerCase() == captcha.toLowerCase()});
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
                if(doc != null){
                    //record _id to id for consistency
                    doc.id = doc._id;
                    delete doc._id;
                    res.send(doc);
                }else{
                    res.send(null);
                }
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


    app.post('/quiz/topic/add', function(req, res, next){
        var data = req.body;
        questionDao.getTopicByTopic(data.topic, function(err, doc){
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_TOPIC_ADD_ERROR;
                error.topic = data.topic;
                next(err);
            } else {
                if(doc != null){
                    res.send({success: 2});
                }else{
                    questionDao.addTopic(data, function (err, doc) {
                        if (err) {
                            var error = new Error();
                            error.code = ERROR_CODE.QUIZ_TOPIC_ADD_ERROR;
                            error.topic = data.topic;
                            next(err);
                        } else {
                            doc == null ? (res.send({success: 0})) : (res.send({success: 1}));
                        }
                    });
                }

            }
        });

    });

    app.post('/quiz/topic/:topic/remove', function(req, res, next){
        var topic = req.params.topic;
        questionDao.removeTopic(topic, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_TOPIC_REMOVE_ERROR;
                error.topic = topic;
                next(err);
            } else {
                doc == null ? (res.send({success: 0})) : (res.send({success: 1}));
            }
        });
    });

    app.get('/quiz/topic/list', function(req, res, next){
        var data = req.body;
        questionDao.getAllTopics(data.row, data.page, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_TOPIC_GET_ERROR;
                next(err);
            } else {
                res.send(doc);
            }
        });
    });

    app.post('/quiz/question/add', function(req, res, next){
        var data = req.body;
        var choices = data.choices.split(',');
        if (choices.length != 4) {
            res.send({success: 0});
            return;
        }
        data.choices = choices;
        questionDao.addQuestion(data, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_QUESTION_ADD_ERROR;
                error.name = data.question;
                next(err);
            } else {
                doc == null ? (res.send({success: 0})) : (res.send({success: 1}));
            }
        });

    });

    app.post('/quiz/question/remove', function(req, res, next){
        var data = req.body;
        BOK.each(data.ids, function(id, index){
            data.ids[index]['_id'] = ObjectID.createFromHexString(id._id);
        },this);
        questionDao.removeQuestions(data.ids, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_QUESTION_REMOVE_ERROR;
                error.id = data._id;
                next(err);
            } else {
                doc == null ? (res.send({success: 0})) : (res.send({success: 1}));
            }
        });
    });

    app.get('/quiz/question/list', function (req, res, next) {
        var params = url.parse(req.url, true).query;
        var query = {};
        for(var profile in params){
            if(profile.slice(0, 5) == 'query'){
                var key = profile.substring(profile.indexOf('[') + 1,profile.indexOf(']'));
                query[key] = params[profile];
            }
        }
        questionDao.getQuestionsByPage(params.sorts, query, parseInt(params.rows), parseInt(params.page), function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.QUIZ_QUESTION_GET_ERROR;
                next(err);
            } else {
                var data = doc;
                questionDao.getQuestionsCount(query, function (err, doc) {
                    if (err) {
                        var error = new Error();
                        error.code = ERROR_CODE.QUIZ_QUESTION_GET_ERROR;
                        next(err);
                    } else {
                        res.send({count: doc, data: data});
                    }
                });
            }
        });
    });

    app.post('/quiz/question/upload', function (req, res, next) {
        var form = new multiparty.Form({uploadDir:__dirname  + '\\upload\\questions', keepExtensions:true});

        form.parse(req, function (err, fields, files) {
            if (files && files.file && files.file.length == 1) {
                var file = files.file[0];
                // get file temp path
                var tmp_path = file.path;
                var fileNameSplit = file.originalFilename.split('.');
                // target file path
                var target_path = __dirname + '\\upload\\questions\\' + fileNameSplit[0]  + new Date().getTime() + '.' + fileNameSplit[1];
                // rename file
                fs.rename(tmp_path, target_path, function (err) {
                    if (err) console.log(err);
                    // 删除临时文件夹文件,
                    fs.unlink(tmp_path, function () {
                        if (err) console.log(err);
                        console.log('File uploaded to: ' + target_path + ' - ' + file.size + ' bytes');
                    });
                });

                fs.readFile(target_path,'utf-8' ,function(err,data){
                    if(err) throw err;
                    questionDao.addQuestion(JSON.parse(data), function (err, doc) {
                        if (err) {
                            var error = new Error();
                            error.code = ERROR_CODE.QUIZ_QUESTION_ADD_ERROR;
                            next(err);
                        } else {
                            res.send({success: 1});
                        }
                    });
                });
            } else {
                res.writeHead(500, {'content-type': 'text/plain'});
                res.write('wrong upload:\n\n');
                res.end();
            }
        });
    });
    app.get('/game/list/:type', function (req, res, next) {
        var params = url.parse(req.url, true).query;
        var query = {};
        //TODO:each params from client
        /*for(var profile in params){
            if(profile.slice(0, 5) == 'query'){
                var key = profile.substring(profile.indexOf('[') + 1,profile.indexOf(']'));
                query[key] = params[profile];
            }
        }*/
        if(req.params.type != 'all'){
            query.type = req.params.type.toLowerCase();
        }
        gameDao.getGameList(query, function (err, docs) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_LIST_GET_ERROR;
                next(err);
            } else {
                BOK.each(docs, function(doc){
                    doc.id =doc._id;
                    doc.gameName=doc.name;
                }, this);
                res.send(docs);
            }
        });
    });
    app.get('/game/:id', function (req, res, next) {
        gameDao.getGameById(req.params.id, function (err, doc) {
            if (err) {
                var error = new Error();
                error.code = ERROR_CODE.GAME_GET_ONE_ERROR;
                next(err);
            } else {
                doc.id = doc._id;
                res.send(doc);
            }
        });
    });
};
