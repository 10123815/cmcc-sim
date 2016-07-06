/**
 * @fileoverview Simulation management and provide some common 
 *               utilities for the simulation.
 * @author ysd
 */

exports.cloudlets = new Map();
exports.usernodes = new Map();

// All time in ms.
exports.DELTA_TIME = 0.1;
exports.SIM_TIME = 0;
exports.TOTAL_TIME = 3600000;

exports.SIM_BORDER = [1000, 1000];
