/**
 * @fileoverview Simulation scenario. All events take place at this scene.
 * @author ysd
 */

var sim = require('./sim-mng');
var App = require('./app').App;
var UserNode = require('./net-node').UserNode;
var Cloudlet = require('./net-node').Cloudlet;

var app = new App(new Cloudlet(10));
app.start();