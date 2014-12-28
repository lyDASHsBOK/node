/**
 * Created by Administrator on 14-7-8.
 */
var BOK = require('../../common/bok/BOK');
var AbstractDao = require('../../common/dao/AbstractDao');

module.exports = AlbumDao;

BOK.inherits(AlbumDao, AbstractDao);
/**
 * @param {monk} db Instance of monk
 * */
function AlbumDao(db) {
    AbstractDao.call(this, db);
    this.albumData_ = this.db_.get("tAlbum");
}

/**
 * @param {string} id Music category
 * @param {Function} cb The callback function
 * */
AlbumDao.prototype.getAlbum = function(id,cb) {
    this.albumData_.findOne({id: id}, function(err, doc){
        if(!err) {
            cb(null, doc);
        } else {
            cb(err);
        }
    });
};
