/**
 * @fileoverview Simulation management and set up
 *               Also  provide some common 
 *               utilities for the simulation.
 * @author ysd
 */

exports.cloudlets = new Map();
exports.userNodes = new Map();

// All time in ms.
exports.DELTA_TIME = 0.001;      // 1 delta time == 1ms       
exports.TOTAL_TIME = 3600000;    // number of delta time.

exports.SIM_BORDER = [1000, 1000];

exports.USER_NUMBER = 50;
exports.CLOUDLET_NUMBER = 5;

exports.BANDWIDTH = 200000000;              // bits

exports.COMP_CODE_SIZE = 1024 * 1024 * 4;   // 500 KB

exports.METHOD_PERC = 0.6;
