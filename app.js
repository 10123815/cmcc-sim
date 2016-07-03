/**
 * @fileoverview Defination of app, component and method.
 * @author ysd.
 */

/**
 * C++ pseudo random library.
 */
var rand = require('./pseudo_rand');

function Method() {
    this.load = rand.pnorm(0.025, 1.67);
    this.call = rand.geo(0.25) + 1;
    this.arg = rand.pnorm(0.00000125, 0.0000083)
    this.res = rand.pnorm(0.0000125, 0.000083)
}

Method.prototype.run = function (speed, freq) {
    return this.load * thid.call * freq / speed;
}

function Component() {
    var methodCount = rand.geo(0.25) + 1;
    this.methods = new Array(methodCount);
    for (var i = 0; i < methodCount; i++) {
        this.methods[i] = new Method();
    }
}

function App(cid) {

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

    this.cloudletId = cid;

}

App.prototype.start = function () {

}

App.prototype.runComp = function (index) {

}

exports.App = App;
