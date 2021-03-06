const LineSprite = require("../../../game_engine/line_sprite")

class ParticleSprite extends LineSprite {
  constructor(transform, color) {
    super(transform)
    this.rectLength = 15;
    this.rectWidth = 2;
    this.color = color
  }

  draw(ctx) {
    let pos = this.transform.absolutePosition();
    let vel = this.transform.absoluteVelocity();
    let l = this.rectLength;
    let w = this.rectWidth;
    let movementDirection = Math.atan2(vel[0], -vel[1])

    ctx.save();
    ctx.translate(pos[0], pos[1]);
    ctx.rotate(movementDirection - Math.PI);

    ctx.beginPath();
    ctx.strokeStyle = this.color.evaluateColor();
    ctx.lineWidth = w;

    ctx.moveTo(0, 0); //1
    ctx.lineTo(0, l); //2

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

module.exports = ParticleSprite;