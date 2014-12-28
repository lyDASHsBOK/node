/**
 * Created by Envee.
 *
 * Date: 14-8-20
 * Time: 上午9:33
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = ReportingDao;

BOK.inherits(ReportingDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function ReportingDao(db) {
    AbstractDao.call(this, db);
    this.reportingData_ = this.db_.get("tReporting");
}


/**
 * @param {Object} data log info, in format:
 *  {
 *      id: {number}
 *      seat: {string}
 *      name: {string}
 *      title: {string}
 *      msg: {string}
 *      type: {string}
 *  }
 *  @param {string} type //the callback function
 * */
ReportingDao.prototype.addReport = function(data, type) {
    data.type = type;
    data.date = getTime();
    console.log("add " + type + "log data...");
    this.reportingData_.insert(data);
};

/**
 * db retrieval method
 * */
ReportingDao.prototype.getReportByType = function(type, cb) {
    this.reportingData_.col.find({ type: type }).toArray(function(e,docs){
        cb(e,docs);
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