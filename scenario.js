/**
 * @fileoverview Simulation scenario. All events take place at this scene.
 * @author ysd
 */

var sim = require('./sim-mng');
var App = require('./app').App;
var UserNode = require('./net-node').UserNode;
var Cloudlet = require('./net-node').Cloudlet;

for (var i = 0; i < sim.USER_NUMBER; i++) {
    var userNode = new UserNode(i);
}

for (var i = 0; i < sim.CLOUDLET_NUMBER; i++) {
    var cloudlet = new Cloudlet(1000 + i);
    cloudlet.startDiscover(1000);
    cloudlet.startCheck();
}