/**
 * Created by Enveesoft.
 * User: Liu Xinyi
 * Date: 14-7-4
 * Time: 下午3:35
 * Write the description in this section.
 */

var BOK = require('../../common/bok/BOK');

var Connection = require('../../common/net/ws/Connection'),
    CONST = require('../const');

module.exports = MessageCon;


BOK.inherits(MessageCon, Connection);
/**
 * @param {socket.io} socket
 * @param {MessageLobby} lobby
 * */
function MessageCon(socket, lobby) {
    Connection.call(this, socket);

    this.lobby_ = lobby;
    this.channel = null;
}

/**
 * data detail refer to event definition
 * */
MessageCon.prototype.isAdmin = function() {
    return this.channel == CONST.CHANNEL.ADMIN;
};


////////////////////////////////////////////Client Socket Listener/////////////////////////////////////////////////////
/**
 * data detail refer to event definition
 * */
MessageCon.prototype.onDisconnect = function() {
    this.socket_.leave(this.channel);
};

/**
 * Data format:
 *  {
 *      title: {string}
 *      message: {string}
 *  }
 * */
MessageCon.prototype.onPostSysMsg = function(data) {
    if(this.isAdmin()) {
        console.log('Broadcast message: '+data.title+ ' - ' + data.message);
        this.broadcast_(CONST.CHANNEL.SYS_MSG, SERVER2CLIENT.SYS_MESSAGE, data);
        this.lobby_.reportDao.addReport(data, 'broadcastmessage');
    }
};

/**
 * Data format:
 *  {
 *      title: {string}
 *      message: {string}
 *  }
 * */
MessageCon.prototype.onPostSysAlert = function(data) {
    if(this.isAdmin()) {
        console.log('Broadcast alert: '+data.title+ ' - ' + data.message);
        this.broadcast_(CONST.CHANNEL.SYS_MSG, SERVER2CLIENT.SYS_ALERT, data);
    }
};

/**
 * Data format:
 *  {
 *      title: {string}
 *      message: {string}
 *  }
 * */
MessageCon.prototype.onLockClient = function(data) {
    console.log('is admin ' + this.isAdmin());
    console.log('is locked ' + this.lobby_.isClientLocked());
    if(this.isAdmin() && !this.lobby_.isClientLocked()) {
        this.lobby_.lockClient(data);
        this.broadcast_(CONST.CHANNEL.SYS_MSG, SERVER2CLIENT.SYS_ALERT, data);
        this.broadcast_(CONST.CHANNEL.SYS_MSG, SERVER2CLIENT.SYS_LOCK);
        this.broadcast_(CONST.CHANNEL.ADMIN, SERVER2CLIENT.CLIENT_LOCKED);
    }
};

/**
 * Data: null
 * */
MessageCon.prototype.onUnlockClient = function() {
    if(this.isAdmin()) {
        this.lobby_.unlockClient();
        this.broadcast_(CONST.CHANNEL.SYS_MSG, SERVER2CLIENT.SYS_UNLOCK);
        this.broadcast_(CONST.CHANNEL.ADMIN, SERVER2CLIENT.SYS_UNLOCK);
    }
};

/**
 * Data format:
 *  {
 *      channel: {number}       //either passenger or admin channel
 *      name: {string}
 *  }
 * */
MessageCon.prototype.onLogin = function(data) {
    var locked = this.lobby_.isClientLocked();

    switch(data.channel) {
        case CONST.CHANNEL.SYS_MSG:
            if(locked) {
                this.send_(SERVER2CLIENT.SYS_LOCK);
                this.send_(SERVER2CLIENT.SYS_ALERT, this.lobby_.getSysLockMsg());
            }
            break;

        case CONST.CHANNEL.ADMIN:
            if(locked) {
                this.send_(SERVER2CLIENT.CLIENT_LOCKED);
            }
            break;

        default:
            this.send_(SERVER2CLIENT.SYS_ALERT, {title:'Error', message: 'passenger channel not ready yet'});
            return;
    }

    this.channel = data.channel;
    this.name = data.name;

    // Add the client to the room
    this.socket_.join(this.channel);
};

/**
 * Data format:
 *  {
 *      msg: {string}
 *      guestId: {string},
 *      seat: {string},
 *      name: {string},
 *      time: {number}
 *  }
 * */
MessageCon.prototype.onPostServiceMsg = function(data) {
    console.log('Service message: ', data);
    this.lobby_.recordUserConnection(data.guestId, this);
    this.broadcast_(CONST.CHANNEL.ADMIN, SERVER2CLIENT.SERVICE_MSG, data);
    this.lobby_.serviceDao.addServiceMsg(data);
    this.lobby_.reportDao.addReport({title:"say" ,seat:data.seat, name:data.name, message: data.msg, toSeat:'Airline company', toName: 'CA997'}, 'passengersmessage');
};

/**
 * Data format:
 *  {
 *      id: {string},
 *      seat: {string},
 *      name: {string},
 *      time: {number},
 *  }
 * */
MessageCon.prototype.onPostServiceCall = function(data) {
    console.log('Service call message: ', data);
    this.lobby_.recordUserConnection(data.id, this);
    this.broadcast_(CONST.CHANNEL.ADMIN, SERVER2CLIENT.SERVICE_CALL, data);
    this.lobby_.reportDao.addReport({title:'call',seat:data.seat, name:data.name, message: data.msg}, 'passengerscall');

};

/**
 * Data format:
 *  {
 *      id: {string},
 *      seat: {string},
 *      name: {string},
 *      time: {number},
 *  }
 * */
MessageCon.prototype.onPostServiceCallCancel = function(data) {
    console.log('Passengers Call Cancel message: ', data);
    this.broadcast_(CONST.CHANNEL.ADMIN, SERVER2CLIENT.SERVICE_CALL_CANCEL, data);
    this.lobby_.reportDao.addReport({title:'Cancel call',seat:data.seat, name:data.name, message: data.msg}, 'passengerscall');
};

/**
 * Data format:
 *  {
 *      guestId: {string},
 *      seat: {string},
 *      name: {string},
 *      msg: {string}
 *      time: {number}
 *      toSeat: {string}
 *      toName: {string}
 *  }
 * */
MessageCon.prototype.onPostReplyMsg = function(data) {
    console.log('Passengers message: ', data);
    var userCon = this.lobby_.retrieveUserConnection(data.guestId);
    if(userCon){
        this.broadcast_(userCon.getSocketID(), SERVER2CLIENT.REPLY_MSG, data);
        this.lobby_.serviceDao.addServiceMsg(data);
        this.lobby_.reportDao.addReport({title:'replay to -- ' + (data.toSeat + ', ' + data.toName),seat:data.seat, name:data.name, message: data.msg}, 'passengersmessage');
    }
};

/**
 *
 * Data format:
 *  {
 *      id: {string},
 *      seat: {string},
 *      name: {string},
 *      status: {string}
 *  }
 * */
MessageCon.prototype.onPostReplyCall = function(data) {
    console.log('Passengerscall message: ' + data);
    var userCon = this.lobby_.retrieveUserConnection(data.id), message = '';
    if(userCon){
        this.broadcast_(userCon.getSocketID(), SERVER2CLIENT.REPLY_CALL, data);
        message = data.status ? 'The flight attendant is coming' : 'The flight attendant is busy, please try again later';
        this.lobby_.reportDao.addReport({title: ' Get a Reply --',seat:data.seat, name:data.name,  message: message}, 'passengerscall');
    }
};

var SERVER2CLIENT = {
    /**
     * Data format:
     *  {
     *      title: {string}
     *      message: {string}
     *  }
     * */
    SYS_MESSAGE: 'sysmsg',

    /**
     * Data format:
     *  {
     *      title: {string}
     *      message: {string}
     *  }
     * */
    SYS_ALERT: 'sysalert',

    /**
     * Data: null
     * */
    CLIENT_LOCKED: 'clientlocked',

    /**
     * Data: null
     * */
    SYS_LOCK: 'syslock',

    /**
     * Data: null
     * */
    SYS_UNLOCK: 'sysunlock',
    /**
     * Data format:
     * {
     *      id: {number}
     *  }
     *  */
    SERVICE_MSG: 'servicemsg',
    /**
     * Data format:
     * {
     *      id: {number}
     *      seat: {string}
     *      name: {string}
     *  }
     *  */
    SERVICE_CALL: 'servicecall',
    /**
     * Data format:
     * {
     *      id: {number}
     *      seat: {string}
     *      name: {string}
     *  }
     *  */
    SERVICE_CALL_CANCEL: 'servicecallcancel',
    /**
     * Data format:
     * {
     *      id: {number}
     *  }
     *  */
    REPLY_MSG: 'replymsg',
    /**
     * Data format:
     * {
     *      id: {number},
     *      msg: { string }
     *  }
     *  */
    REPLY_CALL: 'replycall'
};


