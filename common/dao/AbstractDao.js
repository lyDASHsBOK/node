/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-4
 * Time: 下午1:05
 * Write the description in this section.
 */

var cache_manager = require('cache-manager');
var memory_cache = cache_manager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});

module.exports = AbstractDao;

/**
 * @param {monk} db Instance of monk
 * */
function AbstractDao(db) {
    this.db_ = db;
    this.memoryCache_ = memory_cache;
}
