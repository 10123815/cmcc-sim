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
function allocatePosition() {
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

    this.userNodes = new Map();

    sim_mng.cloudlets.set(id, this);

}

Cloudlet.prototype = new Node;

Cloudlet.prototype.discoverNode = function (range) {
    // console.log(sim_mng.userNodes.size);
    // New nodes come.
    var cld = this;
    sim_mng.userNodes.forEach(function (node, id, map) {
        var dis = v2.vector2Distance(node.position, cld.position);
        if (dis < range && !cld.userNodes.has(id)) {
            // Add new nodes.
            cld.userNodes.set(id, node);
            // Joins
            node.joinCloudlet(cld);
        }
    });
    setTimeout(this.discoverNode.bind(this, range), sim_mng.DELTA_TIME * 10);
}

Cloudlet.prototype.startDiscover = function (range) {
    this.discoverNode(range);
}

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

    sim_mng.userNodes.set(id, this);

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
 * @param   {Cloudlet} c The cloudlet node is joining.
 */
UserNode.prototype.joinCloudlet = function (c) {
    this.cloudlet = c;
    this.app.speed = c.speed;
}

exports.UserNode = UserNode;
exports.Cloudlet = Cloudlet;