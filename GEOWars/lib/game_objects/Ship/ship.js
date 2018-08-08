const GameObject = require("../../game_engine/game_object");
const Util = require("../../game_engine/util");
const Sound = require("../../game_engine/sound");

const Bullet = require("../Bullet/bullet");
const ShipSprite = require("./ship_sprite")

class Ship extends GameObject {
  constructor(engine, pos) { 
    super(engine);
    this.transform.pos = pos
    this.addPhysicsComponent()
    this.addMousePosListener()
    this.addLeftControlStickListener()
    this.radius = 5
    this.addCollider("General", this, this.radius)
    this.addLineSprite(new ShipSprite(this.transform))
    this.maxSpeed = 10;
    this.mousePos = [0,0];
    this.fireAngle = 0;
    this.bulletSound = new Sound("GEOWars/sounds/Fire_normal.wav", 0.2);
    this.bulletTimeCheck = 0;
    this.bulletInterval = 120;
    this.controlsDirection = [0,0];
    this.powerLevel = 1;
    this.bulletNumber = 0;
    this.speed
    this.shipEngineAcceleration = 0.5;
  }
  
  update(deltaTime){
    
    this.bulletTimeCheck += deltaTime
    if (this.bulletTimeCheck >= this.bulletInterval ) {
      this.bulletNumber += 1
      this.bulletTimeCheck = 0;
      this.fireBullet();
    } 

    
    this.moveInControllerDirection(deltaTime)

    if (this.isOutOfBounds()) {
      this.wallGraze();
    } else {
      this.movementMechanics(deltaTime)
    }
    // if ship is out of x bounds, maintain y speed, keep x at edge value
  }

  isOutOfBounds(){
    return this.gameEngine.gameScript.isOutOfBounds(this.transform.pos, this.radius)
  }

  updateMousePos(mousePos){
    this.setFireAngle(mousePos)
    
  }

  updateRightControlStickInput(){

  }

  updateLeftControlStickInput(unitVector) {
    this.controlsDirection = unitVector
    // console.log(this.controlsDirection);
  }

  wallGraze() {
    this.gameEngine.gameScript.wallGraze(this.transform, this.radius)
  }

  moveInControllerDirection(timeDelta){
    let maxSpeed = this.maxSpeed

    const velocityScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
    
  }

  movementMechanics(timeDelta){
    if (this.checkInputDirectionSpeed() < this.maxSpeed) {
      // console.log("Slower than maxspeed");
      
      const timeScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
      this.transform.acc[0] += this.shipEngineAcceleration * this.controlsDirection[0]
      this.transform.acc[1] += this.shipEngineAcceleration * this.controlsDirection[1]
      this.transform.angle = Math.atan2(this.controlsDirection[1], this.controlsDirection[0])
    } else {
      // console.log("Faster than maxspeed");
      
    }
  }

  checkInputDirectionSpeed(){

    //calculate input direction speed
    let movementDirection = Math.atan2(this.transform.vel[1], this.transform.vel[0])
    let controlsAngle = Math.atan2(this.controlsDirection[1], this.controlsDirection[0])
    let relativeAngle =  controlsAngle - movementDirection
    let currentSpeed = Math.sqrt((this.transform.vel[1] * this.transform.vel[1] + this.transform.vel[0] * this.transform.vel[1]))
    return currentSpeed * Math.cos(relativeAngle)
  }

  setFireAngle(mousePos) {
    
    if (mousePos === undefined){
      mousePos = this.mousePos;
    } else {
      this.mousePos = mousePos
    }
    let dy = mousePos[1] - this.transform.pos[1];
    let dx = mousePos[0] - this.transform.pos[0];
    this.fireAngle =  Math.atan2(dy, dx)
  }

  fireBullet() {
    
    this.gameEngine.queueSound(this.bulletSound)
    let shipvx = this.transform.vel[0];
    let shipvy = this.transform.vel[1];

    let relBulletVelX1 = Bullet.SPEED * Math.cos(this.fireAngle);
    let relBulletVelY1 = Bullet.SPEED * Math.sin(this.fireAngle);

    const bulletVel1 = [shipvx + relBulletVelX1, shipvy + relBulletVelY1];
    this.addChildGameObject(new Bullet(this.gameEngine, this.transform.pos, bulletVel1, this.bulletNumber))

    if (this.powerLevel === 2) {

      let relBulletVelX2 = (Bullet.SPEED - 0.5) * Math.cos(this.fireAngle + Math.PI / 32);
      let relBulletVelY2 = (Bullet.SPEED - 0.5) * Math.sin(this.fireAngle + Math.PI / 32);
      let relBulletVelX3 = (Bullet.SPEED - 0.5) * Math.cos(this.fireAngle - Math.PI / 32);
      let relBulletVelY3 = (Bullet.SPEED - 0.5) * Math.sin(this.fireAngle - Math.PI / 32);

      const bulletVel2 = [shipvx + relBulletVelX2, shipvy + relBulletVelY2];
      const bulletVel3 = [shipvx + relBulletVelX3, shipvy + relBulletVelY3];
      // doesn't support parent transformations... yet
      this.addChildGameObject(new Bullet(this.gameEngine, this.transform.pos, bulletVel2))
      this.addChildGameObject(new Bullet(this.gameEngine, this.transform.pos, bulletVel3))
    }
  }


  // implement threshold so it's not too sensitive

  

  relocate() {
    // this.GameScript.die();
    // this.transform.pos = this.game.randomPosition();
    // this.vel = [0, 0];
    // this.acc = [0, 0];
  }
}

module.exports = Ship;
const NORMAL_FRAME_TIME_DELTA = 1000 / 60;

