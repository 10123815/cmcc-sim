
var sim_mng = require('./sim-mng');
var v2 = require('./common');
var Vector2 = v2.Vector2;
var rand = require('./pseudo_rand');

/**
 * Return a random position.
 */
function randPosition() {
    var x = rand.uniInt(0, sim_mng.SIM_BORDER[0]);
    var y = rand.uniInt(0, sim_mng.SIM_BORDER[1]);
    return new Vector2(x, y);
}

function RWP(node) {
    this.node = node;
    this.speed = rand.uniReal(10, 15);     // m/s
    this.destination = randPosition();
    this.pause = 0;     // seconds
    this.moving = true;
}

/**
 * Move in random way point mobility model.
 */
RWP.prototype.move = function () {

    if (this.moving) {
        // Still move along the road.
        var dir = v2.vector2Minus(this.destination, this.node.position);
        dir.normalize();
        var movement = v2.vector2Multi(dir, this.speed);
        this.node.position = v2.vector2Add(this.node.position, movement);

        var dis = v2.vector2Distance(this.destination, this.node.position);
        // Reach the destination.
        if (dis < 1) {
            this.moving = false;
            this.pause = rand.uniReal(1, 5);
        }
    } else {
        this.pause -= 1;
        if (this.pause <= 0) {
            // Reset.
            this.moving = true;
            this.speed = rand.uniInt(10, 15);  
            this.destination = randPosition();
        }
    }

    setTimeout(this.move.bind(this), 1 * sim_mng.DELTA_TIME);
    // console.log(this.node.position);
}

exports.RWP = RWP;