/**
 * @fileoverview Simulation scenario. All events take place at this scene.
 * @author ysd
 */

var sim_mng = require('./sim-mng');
var App = require('./app').App;
var UserNode = require('./net-node').UserNode;
var Cloudlet = require('./net-node').Cloudlet;

sim_mng.START_TIME = Date.now();

for (var i = 0; i < sim_mng.USER_NUMBER; i++) {
    var userNode = new UserNode(i);
}

for (var i = 0; i < sim_mng.CLOUDLET_NUMBER; i++) {
    var cloudlet = new Cloudlet(1000 + i);
    cloudlet.startDiscover(500);
    cloudlet.startCheck();
}