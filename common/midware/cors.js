/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-1
 * Time: 下午2:39
 * Write the description in this section.
 */

//CORS middleware
module.exports = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
