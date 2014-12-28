var BOK = require('./BOK');

module.exports = EventDispatcher;

function EventDispatcher()
{
	this.listeners = {};
}

/**
 * @param {string} eventStr
 * @param {Function} callBack
 * */
EventDispatcher.prototype.addEventListener = function(eventStr, callBack)
{
	if(!this.listeners[eventStr])
	{
		this.listeners[eventStr] = new Array();
	}
	
	this.listeners[eventStr].push(callBack);
};

/**
 * @public
 * @param {String} eventStr
 * @param {Function=null} [func]
 * */
EventDispatcher.prototype.removeEventListener = function(eventStr, func)
{
	var listenerQueue = this.listeners[eventStr];
	
	if(listenerQueue)
	{
		if(func)
		{
			BOK.each(listenerQueue, function(listener, index){
				if(func == listener)
				{
					listenerQueue.splice(index, 1);
					return 'break';
				}
			});
		}
		else
			listenerQueue.splice(0, listenerQueue.length);
	}
};

/**
 * @param {Event|String} event
 * @param {*=} body
 * */
EventDispatcher.prototype.dispatchEvent = function(event, body)
{
    var e;
    if('string' == typeof event) {
        e = {name:event, body:body};
    } else {
        e = event;
    }
    
	e.target = this;
	var listenerQueue = this.listeners[e.name];

	if(listenerQueue)
	{
		for(var i=0; i < listenerQueue.length; ++i)
			listenerQueue[i].call(this, e);
	}
};
