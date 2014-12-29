/**
 * Created by Envee.
 *
 * Date: 14-10-30
 * Time: 下午6:04
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */


var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = QuizQuestionDao;

BOK.inherits(QuizQuestionDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function QuizQuestionDao(db) {
    AbstractDao.call(this, db);
    this.questionData_ = this.db_.get("tQuizQuestion");
    this.topicData_ = this.db_.get("tQuizTopic");
}

/**
 * get 10 questions by topic
 * @param topic
 * @param {Function} cb
 */
QuizQuestionDao.prototype.getTenQuestionByTopic = function (topic, cb) {
    var self = this;
    this.getQuestionsCount({topic: topic}, function(error, doc){
       if(error){
            var err = new Error();
            err.message = "get question by topic error"
       }else{
           var random = BOK.randN(doc - 7);
           random = random < 0 ? 0 : random;

           self.questionData_.col.find({topic: topic}).skip(random).limit(7).toArray(
               function (err, doc) {
                   if (!err)
                       cb(null, doc);
                   else {
                       cb(err);
                   }
               }
           );
       }
    });

};

/**
 * add question
 * @param {Object} data // format :
 *  {
 *      question: {string},
 *      correctAnswer: {string}
 *      answer2 : {string},
 *      answer3: {string},
 *      answer4: {string},
 *      difficulty: {number}
 *  }
 * @param {Function} cb
 */
QuizQuestionDao.prototype.addQuestion = function (data, cb) {
    if(data.topic) data.topic.toLowerCase();

    this.questionData_.insert(data,
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};

QuizQuestionDao.prototype.getQuestionsByPage = function(sorts, querys, row, page, cb){
    if(!sorts) sorts = {};
    if(!querys) querys = {};

    this.questionData_.col.find(querys).sort(sorts).skip((page - 1) * row).limit(row).toArray(
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        });
};

QuizQuestionDao.prototype.getQuestionsCount = function(querys,cb){
    this.questionData_.col.count(querys, function(err, doc){
        if (!err)
            cb(null, doc);
        else {
            cb(err);
        }
    });
};

/**
 * remove more than one question
 * @param {Array} ids // the questions id collection
 * @param {Function} cb
 */
QuizQuestionDao.prototype.removeQuestions = function (ids, cb) {
    this.questionData_.remove({"$or": ids},
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );

};

/**
 * add question topic
 * @param {Object} data // format :
 *  {
 *      topic: {string}
 *  }
 * @param {Function} cb
 */
QuizQuestionDao.prototype.addTopic = function (data, cb) {
    this.topicData_.insert(data,
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};

QuizQuestionDao.prototype.getAllTopics = function (row, page, cb) {
    if (row && page) {
        this.topicData_.col.find().skip((page - 1) * row).limit(row).toArray(
            function (err, doc) {
                if (!err)
                    cb(null, doc);
                else {
                    cb(err);
                }
            });
    } else {
        this.topicData_.col.find().toArray(
            function (err, doc) {
                if (!err)
                    cb(null, doc);
                else {
                    cb(err);
                }
            });
    }
};

QuizQuestionDao.prototype.getTopicsCount = function(querys,cb){
    this.topicData_.col.count(querys, function(err, doc){
        if (!err)
            cb(null, doc);
        else {
            cb(err);
        }
    });
};

QuizQuestionDao.prototype.getTopicByTopic = function (topic, cb) {
    this.topicData_.findOne({topic: topic},
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        });
};

QuizQuestionDao.prototype.removeTopic = function (topic, cb) {
    this.topicData_.remove({topic: topic},
        function (err, doc) {
            if (!err)
                cb(null, doc);
            else {
                cb(err);
            }
        }
    );
};
