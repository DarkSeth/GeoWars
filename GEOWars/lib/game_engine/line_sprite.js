class LineSprite {
  constructor(transform) {
    // this.drawFunction = draw
    this.transform = transform 
  }

  draw(ctx) {
    pos = this.transform.absolutePosition()
    angle = this.transform.abosluteAngle()
    this.drawFunction(ctx, pos, angle)
  }
}

module.exports = LineSprite;