/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-8
 * Time: 上午10:26
 * Write the description in this section.
 */


var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = MusicDao;

BOK.inherits(MusicDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function MusicDao(db) {
    AbstractDao.call(this, db);
    this.musicData_ = this.db_.get("tMusic");
}

/**
 * @param {string} cat Music category
 * @param {Function} cb The callback function
 * */
MusicDao.prototype.getMusic = function(cat, cb) {
    this.musicData_.col.find({cat:{$in:[cat]}}).toArray(function(err, doc){
        if(!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};