/**
 * @fileoverview Simulation scenario. All events take place at this scene.
 * @author ysd
 */

var sim = require('./sim-mng');
var App = require('./app').App;
var StartApp = require('./app').StartApp;
var UserNode = require('./net-node').UserNode;
var Cloudlet = require('./net-node').Cloudlet;

var userNode = new UserNode(1);