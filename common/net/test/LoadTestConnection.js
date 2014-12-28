/**
 * Created by Envee.
 *
 * Date: 14-10-16
 * Time: 下午3:55
 * @author: <a href="526597516@qq.com">luyc</a>
 * @version: 0.1
 */

var BOK = require('../../bok/BOK');

var Connection = require('../ws/Connection');

module.exports = LoadTestConnection;


BOK.inherits(LoadTestConnection, Connection);

function LoadTestConnection(socket, server){
    Connection.call(this, socket, server);
}

LoadTestConnection.prototype.onConnectServer = function(data){
    console.log("load test");
    this.send_("test", data);
};