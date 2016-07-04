/**
 * @fileoverview Defination of app, component and method.
 * @author ysd.
 */

/**
 * C++ pseudo random library.
 */
var rand = require('./pseudo_rand');

var sim_mng = require('./sim-mng');
var events = require('events');

/**
 * Component related events.
 */
var compEvent = new events.EventEmitter();

/**
 * When a component is completed, run the next one.
 */
compEvent.on('end', function (app) {
    // TODO(ysd): Randomly select the next component index.

    runComp(app.cloudlet.speed, app.components[app.currentCompIndex], 0);
});

function Method() {
    this.load = rand.pnorm(0.025, 1.67);            // intros
    this.call = rand.geo(0.25) + 1;
    this.arg = rand.pnorm(0.00000125, 0.0000083)    // bits
    this.res = rand.pnorm(0.0000125, 0.000083)      // bits
}

Method.prototype.run = function (speed, freq) {
    return this.load * this.call * freq / speed;
}

function Component(app) {

    /**
     * Machine code size in bits to transmit to the cloudlet.
     */
    this.codeSize = 0;

    var methodCount = rand.geo(0.25) + 1;
    this.methods = new Array(methodCount);

    for (var i = 0; i < methodCount; i++) {
        var mt = new Method();
        this.methods[i] = mt;
        this.codeSize += mt.load * mt.call * 320;
    }

    /**
     * @type {App} Which application this component belong to. 
     */
    this.belong = app;
}

/**
 * Run a component on a node of speed.
 * @param {Number}      speed   Speed of the node.
 * @param {Component}   comp    Component need to run.
 * @param {Number}      index   Index of the method in the component.
 */
function runComp(speed, comp, index) {
    if (index >= comp.methods.length) {
        compEvent.emit('end', comp.belong);
        return;
    }
    // console.log(index + '    ' + comp.methods.length + '     ' + sim_mng.SIM_TIME);
    var exeTime = comp.methods[index].run(speed, 1);
    sim_mng.SIM_TIME += exeTime;
    setTimeout(function () {
        runComp(speed, comp, index + 1);
    }, sim_mng.DELTA_TIME);
}

function App(c) {

    this.callGraph = [
        [0, 1, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 1],
        [0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];

    /**
     * All components of this app.
     */
    this.components = new Array(7);
    for (var i = 0; i < 7; i++) {
        this.components[i] = new Component(this);
    }

    /**
     * @type {Cloudlet}
     */
    this.cloudlet = c;

    this.currentCompIndex = 0;

}

App.prototype.start = function () {
    runComp(this.cloudlet.speed, this.components[0], 0);
}

exports.App = App;
