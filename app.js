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

var fs = require('fs');
var fd = fs.openSync('output.txt', 'a');

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
    this.load = 0;   // intros
    this.arg = 0;    // bits
    this.res = 0;    // bits

    this.call = rand.geo(0.25) + 1;

    this.compFreq = f;
}

Method.prototype.run = function (speed) {
    return this.load * this.call / speed;
};

Method.prototype.expectSpeed = function () {
    return this.load * this.call * this.compFreq;
};

function Component(app, id) {

    this.id = id;

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

    // The instruction size of the components.
    this.codeSize = sim_mng.COMP_CODE_SIZE * sim_mng.METHOD_PERC;

    // Calculate the methods' load and arguments' size.
    var methodCount = rand.geo(0.25) + 1;
    this.methods = new Array(methodCount);
    // 10 for Java code and 32 for 32-bits machine.
    var oneMethodload = this.codeSize / methodCount / 320;
    var oneMethodArg = (sim_mng.COMP_CODE_SIZE - this.codeSize) / methodCount;  // bits.
    // console.log(oneMethodload);
    for (var i = 0; i < methodCount; i++) {
        var mt = new Method(this.freq);
        // Set up the method.
        mt.load = rand.penorm(1 / (oneMethodload / mt.call), 167);
        var arg = oneMethodArg / mt.call / 11;
        mt.arg = rand.penorm(1 / (arg * 10), 83);
        mt.res = rand.penorm(1 / arg, 83);
        this.methods[i] = mt;
    }
}

/**
 * Run a component on a node. The speed is dynamic.
 * @param {Number}      index   Index of the method in the component.
 */
Component.prototype.run = function (index) {
    if (index >= this.methods.length) {
        compEvent.emit('end', this.belong);
        return;
    }

    // The method's execution time.
    var exeTime = 0;

    // Offloaded??
    if (this.belong.nodeId >= 1000 &&               // At a cloudlet.
        this.belong.speed > this.belong.oriSpeed) { // The cloudlet is more powerful.
        // Add current request, and get the actual speed the cloudlet offered.
        var cld = this.belong.node;
        // If the cloudlet does not has the component.
        if (!cld.CR.has(this.id)) {
            cld.CR.add(this.id);
            // Transmit the component bit code.
            var transmitTime = this.codeSize / sim_mng.BANDWIDTH;
            this.belong.addTime(transmitTime);
            // Execute thie method after transmit.
            setTimeout(this.run.bind(this, index), transmitTime * sim_mng.DELTA_TIME);
        }
        var spd = cld.allocateResource(this.methods[index]);
        exeTime += this.methods[index].run(spd);
        // Add the transmit time.
        exeTime += (this.methods[index].arg + this.methods[index].res) / sim_mng.BANDWIDTH;
        // Remove the current request after it has completed.
        setTimeout(cld.removeMethod.bind(cld, this.methods[index]), exeTime * sim_mng.DELTA_TIME);
    }
    else {
        // Execute locally.
        exeTime = this.methods[index].run(this.belong.oriSpeed);
    }

    this.belong.addTime(exeTime);
    if (this.belong.oriNodeId === 0) {
        try {
            fs.writeSync(fd, exeTime + '\n', 0, 'utf8');
        } catch (error) {
            console.log(error);
            fs.closeSync(fd);
        }
    }
    // Run the next method.
    setTimeout(this.run.bind(this, index + 1), exeTime * sim_mng.DELTA_TIME);
};

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
    if (sum === 0) {
        // Is the last component.
        // Restart the app.
        app.currentCompIndex = 0;
        var ari = app.interval();
        app.addTime(ari);
        setTimeout(app.start.bind(app), ari * sim_mng.DELTA_TIME);
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
        var ari = app.interval();
        app.addTime(ari);
        setTimeout(app.start.bind(app), ari * sim_mng.DELTA_TIME);
        return;
    }

    app.currentCompIndex = nextIndex;
    // Run next component.
    app.components[app.currentCompIndex].run(0);
});

/**
 * App class defination.
 * @param {Cloudlet} c Cloudlet this app want to execute on.
 */
function App(n) {

    this.oriNodeId = 0;

    /**
     * All components of this app.
     */
    this.components = new Array(7);
    var pbl = 0;
    for (var i = 0; i < 7; i++) {
        this.components[i] = new Component(this, i);
    }

    this.node = n;
    this.nodeId = n.id;

    /**
     * @type {Number} Speed of the node that this app run at.
     */
    this.speed = n.speed;

    /**
     * @type {Number} Speed of the origin node.
     */
    this.oriSpeed = n.speed;

    this.currentCompIndex = 0;

    this.time = 0;

}

App.prototype.addTime = function (time) {
    this.time += time;
};

App.prototype.interval = function () {
    return rand.exp(rand.pnorm(0.0001, 0.000025));
};

/**
 * User launch this App.
 */
App.prototype.start = function () {
    // Do not offload first components.
    this.components[0].run(0);
};

exports.App = App;
