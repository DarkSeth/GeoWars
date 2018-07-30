const Bullet = require("./game_objects/bullet");
const Ship = require("./game_objects/ship");
const Util = require("./game_engine/util");
const Particle = require("./particles/particle");
const EnemySpawn = require("./particles/enemy_spawn");
const ParticleExplosion = require("./particles/particle_explosion");
const BulletWallExplosion = require("./particles/bullet_wall_explosion");
const SingularityExplosion = require("./particles/singularity_explosion");
const BoxBox = require("./game_objects/enemies/boxbox");
const Pinwheel = require("./game_objects/enemies/pinwheel");
const Arrow = require("./game_objects/enemies/arrow");
const Grunt = require("./game_objects/enemies/grunt");
const Weaver = require("./game_objects/enemies/weaver");
const Singularity = require("./game_objects/enemies/singularity");
const Sound = require("./game_engine/sound")

class Game {
  constructor() {
    this.enemies = [];
    this.bullets = [];
    this.ships = [];
    this.particleExplosions = [];
    this.spawningEnemies = [];
    this.singularities = [];
    this.muted = true;
    // this.addEnemies();
    this.gameTime = 0;
    this.spawned = false; // REFACTOR PLEASE
    this.enemyCreatorList = this.createEnemyCreatorList()
    this.deathSound = new Audio("GEOWars/sounds/Enemy_explode.wav")
    this.deathSound.volume = 0.5;
    this.bulletWallhit = new Audio("GEOWars/sounds/bullet_hitwall.wav")
    this.bulletWallhit.volume = 0.5;

    this.intervalTiming = 1;
    this.intervalTime = 0;
    this.hugeSequenceTime = 0;
    this.sequenceCount = 0;
    this.lives = 3;
    this.addEnemies();
    this.soundsToPlay = {}
  }

  

  randomArrowDirection () {
    let angles = [0, Math.PI / 2, Math.PI, Math.PI * 3/2]
    return angles[Math.floor(Math.random() * angles.length) % angles.length]
  }
  createEnemyCreatorList() {
    return {
      BoxBox: (pos) => (new BoxBox({ game: this, pos: pos})),
      Pinwheel: (pos) => (new Pinwheel({ game: this, pos: pos })),
      Arrow: (pos, angle) => (new Arrow({game: this, pos: pos, angle: angle})),
      Grunt: (pos) => (new Grunt({game: this, pos: pos})),
      Weaver: (pos) => (new Weaver({game: this, pos: pos})),
      Singularity: (pos) => (new Singularity({game: this, pos: pos}))
    };
    
  }

  add(object) {
    if (this.enemies.length < 50 || object instanceof Bullet || !(object instanceof EnemySpawn)){
      if (object instanceof BoxBox || object instanceof Pinwheel || object instanceof Arrow || object instanceof Grunt || object instanceof Weaver) {
        this.enemies.push(object)
      } else if (object instanceof Singularity) {
        this.singularities.push(object)
      } else if (object instanceof Bullet) {
        this.bullets.push(object);
      } else if (object instanceof Ship) {
        this.ships.push(object);
      } else if (object instanceof ParticleExplosion || object instanceof BulletWallExplosion || object instanceof SingularityExplosion) {
        this.particleExplosions.push(object);
      } else if (object instanceof EnemySpawn) {
        this.spawningEnemies.push(object);
      } else {
        throw new Error("unknown type of object");
      }
    }
    
  }

  addEnemies() {
    for (let i = 0; i < Game.NUM_BOXES; i++) {
      this.add(new BoxBox({ game: this}));
    }
    for (let i = 0; i < Game.NUM_PINWHEELS; i++) {
      this.add(new Pinwheel({game: this}));
    }
    for (let i = 0; i < Game.NUM_ARROWS; i++) {
      this.add(new Arrow({ game: this }));
    }
    for (let i = 0; i < Game.NUM_GRUNTS; i++) {
      this.add(new Grunt({ game: this }));
    }
    for (let i = 0; i < Game.NUM_WEAVERS; i++) {
      this.add(new Weaver({ game: this }));
    }
    for (let i = 0; i < Game.NUM_SINGULARITIES; i++) {
      this.add(new Singularity({ game: this, id: this.singularities.length, pos: [500,500] }));
    }
  }

  randomSpawnEnemy(enemy){
    if (this.enemies.length < 50) {
      let pos = this.randomPosition();
      let enemyCreators = Object.values(this.enemyCreatorList)
      let spawn = new EnemySpawn(enemyCreators[Math.floor(Math.random() * enemyCreators.length) % enemyCreators.length](), this);
      this.add(spawn)
    }
  }
  
  spawnEnemies(spawnList) {
    if (this.enemies.length < 50 ) {
      spawnList.forEach((enemy) => {
        let spawn = new EnemySpawn(enemy, this)
        this.add(spawn)
      })
    }
  }

  spawnSequence(delta) {
    this.intervalTime += delta;
    // this.gameTime += delta;
    if (this.intervalTime > (500 * this.intervalTiming) && this.sequenceCount < 10) {
      this.intervalTime = 0;
      this.randomSpawnEnemy();
      this.sequenceCount += 1
    } else if (this.intervalTime > (2500 * this.intervalTiming) && this.sequenceCount === 10 && this.hugeSequenceTime % 2 === 0) {
      this.intervalTime = 0
      this.sequenceCount +=1
      let enemies_to_spawn = []
      let randomPos = this.randomPosition();
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          enemies_to_spawn.push(
            this.enemyCreatorList["BoxBox"]([i * 40 + randomPos[0], j * 40 + randomPos[1]])
          )
        }
      }
      this.spawnEnemies(enemies_to_spawn);

    } else if (this.intervalTime > (2500 * this.intervalTiming) && this.sequenceCount === 10 && this.hugeSequenceTime % 2 === 1) {
      this.intervalTime = 0
      this.sequenceCount += 1
      let enemies_to_spawn = []
      let randomPos = this.randomPosition();
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          enemies_to_spawn.push(
            this.enemyCreatorList["Weaver"]([i * 40 + randomPos[0], j * 40 + randomPos[1]])
          )
        }
      }
      this.spawnEnemies(enemies_to_spawn);
    } else if (this.intervalTime > (5000 * this.intervalTiming) && this.sequenceCount === 11) {
      this.intervalTime = 0;
      this.sequenceCount += 1;
    } else if (this.intervalTime > 250 && this.sequenceCount < (11 + 15) && (this.sequenceCount > 11) && this.hugeSequenceTime % 2 === 0) {
      this.intervalTime = 0;
      this.sequenceCount += 1 ;

      let enemies_to_spawn = [];
      let fourCorners = [
        [40,              40],
        [Game.DIM_X - 40, 40],
        [40, Game.DIM_Y - 40],
        [Game.DIM_X - 40, Game.DIM_Y - 40]
      ]
      fourCorners.forEach((corner) => {
        enemies_to_spawn.push(this.enemyCreatorList["Grunt"]( corner))
      })
      this.spawnEnemies(enemies_to_spawn);
    } else if (this.intervalTime > 250 && this.sequenceCount < (11 + 15) && (this.sequenceCount > 11) && this.hugeSequenceTime % 2 === 1) {
      this.intervalTime = 0;
      this.sequenceCount += 14;

      let enemies_to_spawn = [];
      let arrowWallPositions = []
      let arrowDirection = Math.PI * 3 / 2 + Math.PI
      for (let i = 40; i < Game.DIM_X; i += 40) {
        arrowWallPositions.push([i,50])
      }
  
      arrowWallPositions.forEach((position) => {
        enemies_to_spawn.push(this.enemyCreatorList["Arrow"](position, arrowDirection))
      })

      this.spawnEnemies(enemies_to_spawn);
    } else if( this.sequenceCount >= 26) {
      this.sequenceCount = 0;
      if (!(this.intervalTiming < 0.5)){
        this.intervalTiming *= 0.9;
      }
      this.hugeSequenceTime += 1;
    }
    // if (this.gameTime % 2000 === 0){
    //   this.spawned = false
    // }
    // if( !this.spawned){
    //   this.spawnEnemy()
    //   this.spawned = true
    // }
  }

  addShip() {
    const ship = new Ship({
      pos: this.randomPosition(),
      game: this
    });

    this.add(ship);

    return ship;
  }

  

  die(){
    this.intervalTiming = this.intervalTiming;
    this.intervalTime = 0;
    this.hugeSequenceTime = 0;
    this.sequenceCount = 0;
    this.lives -= 1;
    this.enemies = [];
    if (this.lives === 0){
      this.intervalTiming = 1;
      this.lives = 3;
      location.reload();
    }
  }


  // draw(ctx) {

  //   // var ctx = document.createElement("canvas").getContext("2d");
  //   // ctx.canvas.width = this.DIM_X;
  //   // ctx.canvas.height = this.DIM_Y;

  //   ctx.save()
  //   ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
  //   ctx.fillStyle = Game.BG_COLOR;
  //   ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);

  //   this.ships.forEach((object) => {
  //     object.draw(ctx);
  //   })
  //   this.allObjects().forEach((object) => {
  //     object.draw(ctx);
  //   });
  //   this.bullets.forEach((object) => {
  //     object.draw(ctx)
  //   });
  //   this.particleObjects().forEach((particle) => {
  //     particle.draw(ctx);
  //   });
  //   this.singularities.forEach((object) => {
  //     object.draw(ctx);
  //   });
  // }
  

  playSounds() {
    Object.values(this.soundsToPlay).forEach((sound) => {
      sound.play();
    })
    this.soundsToPlay = {};
  }


  isOutOfBounds(pos) {
    return (pos[0] < 0) || (pos[1] < 0) ||
      (pos[0] > Game.DIM_X) || (pos[1] > Game.DIM_Y);
  }
  // move physics objects
  moveObjects(delta) {
    this.allObjects().forEach((object) => {
      object.move(delta);
    });
    this.bullets.forEach((object) => {
      object.move(delta);
    });
    this.ships.forEach((object) => {
      object.move(delta);
    });
    this.particleObjects().forEach((object) => {
      object.move(delta)
    });
  }

  randomPosition() {
    return [
      Game.DIM_X * Math.random(),
      Game.DIM_Y * Math.random(),
      // 500,300
    ];
  }

  remove(object) {
    // object.pos = [-1000,-1000];
    if (object instanceof Bullet) {
      this.bullets.splice(this.bullets.indexOf(object), 1);
    } else if (object instanceof Ship) {
      this.ships.splice(this.ships.indexOf(object), 1);
    } else if (object instanceof ParticleExplosion || object instanceof BulletWallExplosion || object instanceof SingularityExplosion) {
      this.particleObjects.splice(this.particleObjects.indexOf(object), 1);
    } else if (object instanceof Particle){
      object.active = false
    } else if (object instanceof BoxBox) {
      this.enemies.splice(this.enemies.indexOf(object), 1);
    } else if (object instanceof Pinwheel) {
      this.enemies.splice(this.enemies.indexOf(object),1);
    } else if (object instanceof Arrow) {
      this.enemies.splice(this.enemies.indexOf(object), 1);
    } else if (object instanceof Grunt) {
      this.enemies.splice(this.enemies.indexOf(object), 1);
    } else if (object instanceof Weaver) {
      this.enemies.splice(this.enemies.indexOf(object), 1);
    } else if (object instanceof Singularity) {
      this.singularities.splice(this.singularities.indexOf(object), 1)
    } else if (object instanceof EnemySpawn) {
      this.spawningEnemies.splice(this.spawningEnemies.indexOf(object), 1)
    }
    else {
      throw new Error("unknown type of object");
    }
  }

  updateShipFireAngle(){
    this.ships[0].setFireAngle()
  }

  // spawning handled here. checks the delta time, 
  // adds units when appropriate
  step(delta, ctx) {
    this.ctx = ctx
    this.spawnSequence(delta);
    this.checkCollisions(ctx);
    // this.updateObjects(delta);
    this.moveObjects(delta);
    this.updateShipFireAngle();
    this.playSounds();
  }

  wrap(pos) {
    return [
      Util.wrap(pos[0], Game.DIM_X), Util.wrap(pos[1], Game.DIM_Y)
    ];
  }
}

Game.BG_COLOR = "#000000";

Game.DIM_X = 1000;
Game.DIM_Y = 600;
// Game.FPS = 32;
Game.NUM_BOXES = 10;
Game.NUM_PINWHEELS = 0;
Game.NUM_ARROWS = 0;
Game.NUM_GRUNTS = 0;
Game.NUM_WEAVERS = 0;
Game.NUM_SINGULARITIES = 1;
module.exports = Game;

Game.Spawn1 = {
  BoxBox: 50,
}
  
Game.spawnListList = [
  Game.Spawn1
]