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
var fs = require('fs');

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

    this.CR = new Set();

    this.userNodes = new Map();

    /**
     * Nodes will request computation capacity from this cloudlet.
     */
    this.runningMethods = [];

    sim_mng.cloudlets.set(id, this);

}

Cloudlet.prototype = new Node();

/**
 * Remove a method when it has running off.
 */
Cloudlet.prototype.removeMethod = function (m) {
    var index = this.runningMethods.indexOf(m);
    this.runningMethods = this.runningMethods.slice(index, 1);
};

/**
 * A method request computation resource from a cloudlet.
 * @param  {Method}  m  The method a node want to run.
 */
Cloudlet.prototype.allocateResource = function (m) {
    var l = this.runningMethods.length;
    if (l === 0) {
        // This is the first method that monopolize the resource.
        this.runningMethods.push(m);
        return this.speed;
    }
    var total = 0;
    for (var i = 0, length = this.runningMethods.length; i < length; i++) {
        total += this.runningMethods[i].expectSpeed();
    }
    return m.expectSpeed() / total;
};

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
    setTimeout(this.discoverNode.bind(this, range), sim_mng.DELTA_TIME * 1000);
};

Cloudlet.prototype.startDiscover = function (range) {
    this.range = range;
    this.discoverNode(range);
};

Cloudlet.prototype.check = function () {
    var cld = this;
    this.userNodes.forEach(function (node, id, map) {
        var dis = v2.vector2Distance(node.position, cld.position);
        // console.log(dis);
        if (dis > cld.range) {
            // Remove this node.
            map.delete(id);
            // Leave
            node.leaveCloudlet();
        }
    });
    setTimeout(this.check.bind(this), sim_mng.DELTA_TIME * 1000);
};

Cloudlet.prototype.startCheck = function () {
    this.check();
};

function UserNode(id) {

    // this.speed = rand.pnorm(1, 0.4) * rand.uniInt(1, 4);    // intros/ms
    this.speed = 2.5;

    Node.call(this, id, this.speed);

    this.cloudlet = null;

    this.app = new App(this);
    this.app.oriNodeId = id;

    this.mobility = new mm.RWP(this);

    // Start run app.
    this.app.start();

    // Start moving.
    this.mobility.move();

    sim_mng.userNodes.set(id, this);

}

UserNode.prototype = new Node();

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
};

/**
 * User node join a cloudlet and offload its components to the cloudlet.
 * @param   {Cloudlet} c The cloudlet node is joining.
 */
UserNode.prototype.joinCloudlet = function (c) {
    if (this.cloudlet !== null)
        return;
    this.cloudlet = c;
    this.app.node = c;
    this.app.speed = c.speed;
    this.app.nodeId = c.id;
};

UserNode.prototype.leaveCloudlet = function () {
    if (this.cloudlet === null)
        return;
    this.cloudlet = null;
    this.app.node = this;
    this.app.speed = this.speed;
    this.app.nodeId = this.id;
};

exports.UserNode = UserNode;
exports.Cloudlet = Cloudlet;