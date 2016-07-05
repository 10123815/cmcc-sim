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
 * App component relationship
 */
var CALL_GRAPH = [
    [0, 1, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];

function Method(f) {
    this.load = rand.penorm(0.025, 1.67);            // intros
    this.call = rand.geo(0.25) + 1;
    this.arg = rand.penorm(0.00000125, 0.0000083)    // bits
    this.res = rand.penorm(0.0000125, 0.000083)      // bits

    this.compFreq = f;
}

Method.prototype.run = function (speed) {
    return this.load * this.call / speed;
}

Method.prototype.expectSpeed = function () {
    return this.load * this.call * this.compFreq;
}

function Component(app) {

    /**
     * Machine code size in bits to transmit to the cloudlet.
     */
    this.codeSize = 0;

    /**
     * @type {App} Which application this component belong to. 
     */
    this.belong = app;

    /**
     * How often this component be called in 1/ms. 
     * Initialized with the sequence's arrival interval.
     */
    this.freq = 1 / rand.exp(rand.pnorm(0.0001, 0.000025)) * 7;

    var methodCount = rand.geo(0.25) + 1;
    this.methods = new Array(methodCount);

    for (var i = 0; i < methodCount; i++) {
        var mt = new Method(this.freq);
        this.methods[i] = mt;
        this.codeSize += mt.load * mt.call;
    }
    this.codeSize *= 32;
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
    console.log(comp.belong.currentCompIndex + '     ' + sim_mng.SIM_TIME);
    var exeTime = comp.methods[index].run(speed, comp.freq);
    sim_mng.SIM_TIME += exeTime;
    setTimeout(function () {
        runComp(speed, comp, index + 1);
    }, sim_mng.DELTA_TIME);
}

/**
 * When a component is completed, run the next one.
 */
compEvent.on('end', function (app) {
    // Randomly select the next component index.
    var nextCompIndices = CALL_GRAPH[app.currentCompIndex];
    var sum = 0;
    var probilities = {};
    for (var i = 0; i < 7; i++) {
        if (nextCompIndices[i] == 1) {
            sum += app.components[i].freq;
            probilities[i] = sum;
        }
    }
    if (sum == 0) {
        // Is the last component.
        // Restart the app.
        app.currentCompIndex = 0;
        sim_mng.SIM_TIME += app.interval();
        setTimeout(function () {
            StartApp(app);
        }, sim_mng.DELTA_TIME);
        return;
    }

    var rv = Math.random() * sum;
    var nextIndex = -1;
    for (var index in probilities) {
        if (rv < probilities[index]) {
            nextIndex = index;
            break;
        }
    }

    if (nextIndex == -1) {
        // No next component.
        // Restart the app.
        app.currentCompIndex = 0;
        sim_mng.SIM_TIME += app.interval();
        setTimeout(function () {
            StartApp(app);
        }, SIM_TIME);
        return;
    }
    
    app.currentCompIndex = nextIndex;
    // Run next component.
    runComp(app.cloudlet.speed, app.components[app.currentCompIndex], 0);
});

/**
 * App class defination.
 * @param {Cloudlet} c Cloudlet this app want to execute on.
 */
function App(c) {

    /**
     * All components of this app.
     */
    this.components = new Array(7);
    var pbl = 0;
    for (var i = 0; i < 7; i++) {
        this.components[i] = new Component(this);
    }

    /**
     * @type {Cloudlet}
     */
    this.cloudlet = c;

    this.currentCompIndex = 0;

}

App.prototype.interval = function () {
    return rand.exp(rand.pnorm(0.0001, 0.000025));
}

function StartApp(app) {
    runComp(app.cloudlet.speed, app.components[0], 0);
}

exports.App = App;
exports.StartApp = StartApp;
