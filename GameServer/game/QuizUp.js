/**
 * Created by Envee.
 *
 * Date: 14-10-30
 * Time: 下午2:29
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

module.exports = QuizUp;
var BOK = require('../../common/bok/BOK'),
    QuizUpCon = require('../connection/QuizUpCon'),
    GamePlay = require('../core/l/GamePlay'),
    Game = require('./Game');

var TIMER_BAR_DURATION = 10000;

BOK.inherits(QuizUp, Game);
/**
 * @constructor
 * */
function QuizUp(id) {
    Game.call(this, id);
    this.readyPlayerCons_ = [];
}

/**
 *
 * @override
 */
QuizUp.prototype.start_ = function () {
    console.log("quizUp game network play start........");

    this.ai_ = {id:'1000',name: 'Robot', seat: 'Japan', avatar: 'assets/img/ai_avatar.jpg'};
    this.result_ = {};
    this.enableAI_ = false;
    this.finishedNumber_ = 0;
    this.timerTimerOutId_ = null;
    this.finishedQuestionPlayers_ = [];
    this.rematchInfo_ = {};
    //init player connections
    BOK.each(this.playerCons_, function (con) {
        con.requestPlayerInfo();
        con.addEventListener('playerInfoReady', BOK.createDelegate(this, this.onOnePlayerInfoReady_));
        con.addEventListener('selectOption', BOK.createDelegate(this, this.onSelectOption_));
        con.addEventListener('finishSelect', BOK.createDelegate(this, this.onFinishSelect_));
        con.addEventListener('gameStart', BOK.createDelegate(this, this.onGameStart_));
        con.addEventListener('rematchSelectTopic', BOK.createDelegate(this, this.onRematchSelectTopic_));
    }, this);
};

/**
 * @param {QuizUpCon} con
 * */
QuizUp.prototype.removeAllConHandlers_ = function (con) {
    if (con) {
        con.removeEventListener('playerInfoReady');
        con.removeEventListener('selectOption');
        con.removeEventListener('finishSelect');
        con.removeEventListener('gameStart');
        con.removeEventListener('rematchSelectTopic');
    }
};

/***********************socket enven listener ****************/
QuizUp.prototype.onFinishSelect_ = function (e) {
    var score = e.body.score;
    var playerName = e.target.getPlayer().name;

    if(this.enableAI_){
        this.finishedNumber_++;
    }

    this.result_[playerName].oppName = e.body.oppName;
    this.result_[playerName].score =  e.body.score || 0;
    this.finishedNumber_++;

    if (this.finishedNumber_ == this.maxPlayerNumber_) {
        BOK.each(this.playerCons_, function (con) {
            var myName = con.getPlayer().name;
            var oppName = this.result_[myName].oppName;
            var result = this.result_[myName].score - this.result_[oppName].score;
            var victory = 100;
            var finish = (this.result_[myName].correctNum || 0) * 10;
            var myscore = this.result_[myName].score || 0;
            var powerup = 1;
            var grade = {match: myscore, finish: finish , victory: (result > 0 ? victory : 0), powerup: powerup, total: (myscore + finish + (result > 0 ? victory : 0)) * powerup};
            con.getResult(result, grade);

            var history  =  {topic: con.getTopic(), playerId: myName, oppId: oppName, score: this.result_[myName].score, oppScore: this.result_[oppName].score, correct: this.result_[myName].correctNum || 0, total: this.questions_.length, time: new Date().getTime(), questions:this.result_[myName].questions};
            this.addHistory_(history);
        }, this);
    }
};
QuizUp.prototype.onGameStart_ = function (e) {
    BOK.each(this.playerCons_, function (con, index) {
        if (e.target == con) {
            //this.clearTimerTimeOut_();
            if (e.body.questionIndex < (this.questions_.length - 1)) {
                this.startTimerActionTimeOut_(con);
            }
        }
    }, this);
};
QuizUp.prototype.onOnePlayerInfoReady_ = function (e) {
    console.log('player ' + e.target.getPlayer().name + ' is ready to play ' + this.type);
    if (this.onePlayerReadyAndCheckAll_(e.target)) {
        var players = [];
        BOK.each(this.playerCons_, function (con) {
            players.push(con.getPlayer());
        }, this);
        if(this.type == 'default'){
            this.getRandomTopic_(BOK.createDelegate(this, function(randomTopic){
                this.type = randomTopic;
                this.gameStart_(players);
            }));
        }else{
            this.gameStart_(players);
        }
    }
};
QuizUp.prototype.onSelectOption_ = function (e) {
    var player = e.target;
    var playerName = player.getPlayer().name;
    var questionIndex = e.body.questionIndex;
    var option = e.body.option;
    var result = (this.questions_[questionIndex].correctAnswer == option);
    var quizTime = Math.floor(e.body.time / 1000);

    var score = Math.floor(this.questions_[questionIndex].score * (1 - quizTime / 10));
    if(!this.result_[playerName]) this.result_[playerName] = {};
    if(this.result_[playerName].questions && this.result_[playerName].questions[questionIndex]) return;
    // ai select  option random
    if(this.enableAI_){
        var aiTime = Math.floor(e.body.time / 1000);
        this.aiSelectOption_(questionIndex, aiTime);
    }
    BOK.each(this.playerCons_, function (con) {
        con.checkAnswerResult(playerName, e.body.option,
            player == con ? this.questions_[questionIndex].correctAnswer : null,
            result, score);
        if (player == con) {
            this.finishedQuestionPlayers_.push(con);
            if(result){
                if(!this.result_[playerName].correctNum) this.result_[playerName].correctNum = 0;
                this.result_[playerName].correctNum ++;
                this.result_[playerName].quizTime = quizTime;
                if(!this.result_[playerName].questions) this.result_[playerName].questions = [];
                this.result_[playerName].questions.push({id: this.questions_[questionIndex].id, score: score});
            }else{
                if(!this.result_[playerName].questions) this.result_[playerName].questions = [];
                this.result_[playerName].questions.push({id: this.questions_[questionIndex].id, score: 0});
            }
        }
    }, this);
    if (this.finishedQuestionPlayers_.length == this.maxPlayerNumber_) {
        BOK.each(this.playerCons_, function (con, index) {
            this.clearTimerTimeOut_();
            if (questionIndex < (this.questions_.length - 1)) {
                this.startTimerActionTimeOut_(con);
            }
        }, this);
        this.finishedQuestionPlayers_ = [];
    }
};
QuizUp.prototype.onRematchSelectTopic_ = function(e){
    var player = e.target.getPlayer();
    console.log(player.name + 'start rematch game');
    console.log(this.rematchInfo_ );
    var oppPlayer = null;
    if(!this.enableAI_){
        BOK.each(this.playerCons_,function(con){
            if(con != e.target){
                oppPlayer = con.getPlayer();
            }
        }, this);
        this.rematchInfo_[player.id] = e.body.topic;
        if(oppPlayer){
            this.rematchInfo_[oppPlayer.id] = this.rematchInfo_[oppPlayer.id] || null;
        }

        BOK.each(this.playerCons_,function(con){
            var result = this.rematchInfo_[player.id] == this.rematchInfo_[oppPlayer.id];
            con.rematchTopicResult(player.id, e.body.topic, result);
            if(result){
                this.removeAllConHandlers_(con);
            }
        }, this);
    }else{
        BOK.each(this.playerCons_,function(con){
            var result = true;
            con.rematchTopicResult(player.id, e.body.topic, result);
            if(result){
                this.removeAllConHandlers_(con);
            }
        }, this);
    }
};

/**
 * @override
 * @param {QuizUpCon} con
 * @private
 */
QuizUp.prototype.playerLeaveGame_ = function (con) {

    QuizUp.superClass_.playerLeaveGame_.call(this, con);
    this.enableAI_ = true;
    this.ai_ = con.getPlayer();
    this.removeAllConHandlers_(con);
};

/**
 * @public
 * @param {Object} daoListObj // the array contains quiz dao
 * */
QuizUp.prototype.injectDao = function (daoListObj) {
    this.questionDao_ = daoListObj.questionDao;
    this.historyDao_ = daoListObj.historyDao;
};

QuizUp.prototype.startTimerActionTimeOut_ = function (con) {
    if (con) {
        con.nextQuestion(TIMER_BAR_DURATION);
        this.timerTimerOutId_ = setTimeout(BOK.createDelegate(this, this.startTimerActionTimeOut_), TIMER_BAR_DURATION);
    }
};

/**
 * get random topic when private game
 * @param cb
 * @private
 */
QuizUp.prototype.getRandomTopic_ = function(cb){
    var randomTopic = "default";
    this.questionDao_.getAllTopics(null, null, function (error, doc) {
        if (error) {
            error.code = "get topic error";
        } else {
            randomTopic =  doc[BOK.randN(doc.length)].topic.toLowerCase();
            cb(randomTopic);
        }
    });
};

/**
 * the ai player select option
 * @param {number} questionIndex // the current question index
 * @private
 */
QuizUp.prototype.aiSelectOption_ = function(questionIndex, quizTime){
    //ai select option
    if(this.enableAI_){
        if(!this.result_[this.ai_.name]) this.result_[this.ai_.name] = {};
        var aiOption = BOK.randN(3);
        var aiResult = (this.questions_[questionIndex].correctAnswer == aiOption);
        var score = Math.round(this.questions_[questionIndex].score * (1 - quizTime / 10));
        this.playerCons_[0].checkAnswerResult(this.ai_.name, aiOption, null, aiResult, score);
        if(aiResult){
            if(!this.result_[this.ai_.name].correctNum) this.result_[this.ai_.name].correctNum = 0;
            this.result_[this.ai_.name].correctNum ++;
            if(!this.result_[this.ai_.name].score) this.result_[this.ai_.name].score = 0;
            this.result_[this.ai_.name].score += score;
            this.result_[this.ai_.name].quizTime = quizTime;
            if(!this.result_[this.ai_.name].questions) this.result_[this.ai_.name].questions = [];
            this.result_[this.ai_.name].questions.push({id: this.questions_[questionIndex].id, score: score});
        }else{
            if(!this.result_[this.ai_.name].questions) this.result_[this.ai_.name].questions = [];
            this.result_[this.ai_.name].questions.push({id: this.questions_[questionIndex].id, score: 0});
        }
        this.finishedQuestionPlayers_.push(this.ai_);
    }
};

/**
 * @param {QuizUpCon} con
 * @return {boolean} return true if all player ready.
 * */
QuizUp.prototype.onePlayerReadyAndCheckAll_ = function (con) {
    this.readyPlayerCons_.push(con);
    //all player ready check
    var ready = true;
    if (this.readyPlayerCons_.length == this.playerCons_.length) {
        BOK.each(this.readyPlayerCons_, function (con) {
            if (BOK.findInArray(this.playerCons_, con) < 0) {
                ready = false;
                return BOK.BREAK;
            }
        }, this);
    } else {
        ready = false;
    }
    return ready;
};

/**
 *
 * @param {Array} players // the players info ,data format:{
 *      name: {string} // the name of player
        seat: {string} // the seat of player
        avatar: {string} // the avatar of player
 * }
 * @private
 */
QuizUp.prototype.gameStart_ = function (players) {
    if(players.length < this.maxPlayerNumber_){
        players.push(this.ai_);
        this.enableAI_ = true;
    }
    var self = this;
    this.questionDao_.getTenQuestionByTopic(this.type, function (error, doc) {
        if (error) {
            error.code = "get question error";
        } else {
            console.log(self.type);
            self.questions_ = self.questionToGameData_(doc, false);

            BOK.each(self.playerCons_, function (con) {
                con.gameInit(players, self.questions_, con.getPlayer());
            }, self);
        }
    });
    this.resetAllReadyState_();
};

QuizUp.prototype.resetAllReadyState_ = function () {
    this.readyPlayerCons_ = [];
};

QuizUp.prototype.clearTimerTimeOut_ = function () {
    if (this.timerTimerOutId_) {
        clearTimeout(this.timerTimerOutId_);
        this.timerTimerOutId_ = null;
    }
};

/**
 * add the player play game  history in db
 * @param {Object} history // the history object , data format:
 * {
 *        topic: {string} // this play topic
 *        playerId :{string}  // the player 's identity , maybe a name or id
 *        oppId:{string}     // the opponent 's identity, maybe a name or id
 *        score: {number}  // the player's score
 *        oppScore:{number}  // the oppplayer's score
 *        correctQuestionNum:{number} // the player quiz correct answer number
 *        allQuestionNum:{number} // this quiz contains questions number
 *        time: {number} // the create time
 *        questions: {Array} // the questions result : Obejct format:
 *        {
 *          id: {string} // the question id
 *          score: {number}// the question quiz grade
 *        }
 *  }
 * @private
 */
QuizUp.prototype.addHistory_ = function (history) {
    this.historyDao_.addHistory(history, function (err, doc) {
        if (err) {
            var error = new Error("add history error");
        } else {
            console.log("player:" + history.playerId + "finish quiz, the history add success:" + doc);
        }
    });
};

/**
 *
 * @param {Array} questions // the db question data format:{
 *      question:{string}
 *      correctAnswer: {string}
 *      answer2:{string}
 *      answer3:{string}
 *      answer4: {string}
 *      topic:{string}
 *      difficulty:{number}
 * }
 * @private
 *
 * @return {Array} questions // the reward question result, format:{
 *      question:{string},
 *      choices:{Array},
 *      correctAnswer:{number}, // the correct answer inf answer 's index
 *      topic:{string},
 *      score:{number} // default 10
 *
 * }
 */
QuizUp.prototype.questionToGameData_ = function(questions, isClient){
    var resultQuestions = [];
    BOK.each(questions, function(question){
        var resultQuestion = {id:question._id, question:question.question, topic: question.topic, score: question.difficulty * 20};

        //shuffle function make the array element random
        if (!Array.prototype.shuffle) {
            Array.prototype.shuffle = function() {
                for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
                return this;
            };
        }
        var choices = [question.correctAnswer, question.answer2, question.answer3, question.answer4];
        resultQuestion.choices = choices.shuffle();// random the choices element
        resultQuestion.correctAnswer = isClient ? null : BOK.findInArray(choices, question.correctAnswer);
        resultQuestions.push(resultQuestion);
    }, this);
    return resultQuestions;
};
