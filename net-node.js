/**
 * @fileoverview Node type defination.
 * @author ysd
 */

var event_define = require('./event-define');
var events = require('events');
var sim_mng = require('./sim-mng');
var App = require('./app').App;
var StartApp = require('./app').StartApp;
var rand = require('./pseudo_rand');
var v2 = require('./common');
var Vector2 = v2.Vector2;
var mm = require('./mobility');

/**
 * Allocate a random position for a node.
 */
function allocatePosition(){
    var x = rand.uniInt(0, sim_mng.SIM_BORDER[0]);
    var y = rand.uniInt(0, sim_mng.SIM_BORDER[1]);
    return new Vector2(x, y);
}

function Node(id, spd) {
    this.id = id;
    this.speed = spd;
    this.position = allocatePosition();
}

function Cloudlet(id) {

    this.speed = 16;    // intros/ms

    Node.call(this, id, this.speed);

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

    this.speed = rand.pnorm(1, 0.4) * rand.uniInt(1, 4);    // intros/ms

    Node.call(this, id, this.speed);

    this.cloudlet = null;

    this.app = new App(this);

    this.mobility = new mm.RWP(this);

    // Start run app.
    this.app.start();

    // Start moving.
    this.mobility.move();

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

/**
 * User node join a cloudlet and offload its components to the cloudlet.
 * @parma   {Cloudlet} c The cloudlet node is joining.
 */
UserNode.prototype.joinCloudlet = function (c) {
    this.cloudlet = c;
    this.app.speed = c.speed;
    this.cloudlet.userNodes.Set(this.id, this);
}

exports.UserNode = UserNode;
exports.Cloudlet = Cloudlet;