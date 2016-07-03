/**
 * @fileOverview Node type defination.
 * @author ysd
 */

var event_define = require('./event-define');
var events = require('events');
var app = require('./app');

function Node(id) {
    this.id = id;
}

function Cloudlet(id) {

    this.base = Node;
    this.base(id);

    this.componentRegistry = new Map();

    /**
     * {id : UserNode}
     */
    this.userNodes = new Map();

    this.emitter = new events.EventEmitter();

    /**
     * pkg {compId, compSize}
     */
    this.emitter.on(event_define.OFFLADING_REQUEST, function (pkg) {

    });


}

Cloudlet.prototype = new Node;

function UserNode(id) {

    this.cloudlet;
    
}

UserNode.prototype = new Node;

/**
 * Emit a event on a cloudlet node.
 * @event   {String}    Event name.
 * @id      {Number}    Cloudlet id.
 * @time    {Number}    Send duration(ms).
 * @obj     {Object}    Sent package.
 */
UserNode.prototype.sendToCloudlet = function (event, id, time, obj) {
    setTimeout(function () {
        cloudets[id].emitter.emit(event, obj);
    }, time);
}