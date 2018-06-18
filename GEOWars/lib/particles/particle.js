

class Particle {
  constructor(xpos, ypos, velocity, ctx, game, explosionId, particleID) {
    this.game = game
    this.active = true
    this.hue = this.rand(50, 0, 1);
    this.particleId
    this.explosionId;
    

    this.x = xpos; // x and y position
    this.y = ypos;

    this.rectLength = 20;
    this.rectWidth = 2;
    this.r = this.rand(15, 10, 0);
    this.initialVelocity = velocity
    this.movementAngle = Math.random() * Math.PI * 2
    this.vx = this.initialVelocity * Math.cos(this.movementAngle)
    this.vy = this.initialVelocity * Math.sin(this.movementAngle)
    this.acceleration = -0.1;

    this.opacity = Math.random() + .5;
    this.active = true;

    ctx.fillStyle = "hsla(" + this.hue + ",100%,50%,1)";
    ctx.fillRect(this.x, this.y, this.rectLength, this.rectWidth);
  }




  // private method
  rand(max, min, _int) {
    var max = (max === 0 || max) ? max : 1,
      min = min || 0,
      gen = min + (max - min) * Math.random();

    return (_int) ? Math.round(gen) : gen;
  };

  draw(ctx) {
    this.active = true;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.acceleration * Math.sin(this.movementAngle);
    this.vx += this.acceleration * Math.cos(this.movementAngle);
    this.hue -= 0.5;
    if ((Math.abs(this.vx) + Math.abs(this.vy)) < 0.05) {
      // debugger;
      this.remove();
    } else {
      // ctx.save();
      ctx.fillStyle = "hsla(" + this.hue + ",100%,50%,1)";
      ctx.fillRect(this.x, this.y, this.rectLength, this.rectWidth);
      // ctx.restore();
    }
  }

  remove() {
    this.game.remove(this, );
  }
}


//Drawing loop
// calls draw on all of the particles

module.exports = Particle;