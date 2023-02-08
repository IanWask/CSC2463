let sheetNames = ["SpelunkyGuy.png", "Green.png","Purple.png"];
let spriteSheets = [];

let totalAnimations = 5;
let animations = [];


function preload() {
  for(let i=0;i<sheetNames.length;i++){
    spriteSheets[i]= loadImage("assets/"+sheetNames[i])
  }
}

function setup() {
  createCanvas(400, 400);
  imageMode(CENTER);

  
    for(let i=0;i<totalAnimations;i++){
      animations[i] = new WalkingAnimation(random(spriteSheets),80,80,random(100,300),random(100,300),9);
    }
}

function draw() {
  background(220);
  for(let i=0;i<animations.length; i++){
    animations[i].draw();
  }
  
}

function keyPressed() {
  for(let i=0;i<animations.length;i++){
    animations[i].keyPressed(RIGHT_ARROW,LEFT_ARROW);
  }
  
}

function keyReleased() {
  for(let i=0;i<animations.length;i++){
    animations[i].keyReleased(RIGHT_ARROW,LEFT_ARROW);
  }
}

class WalkingAnimation {
  constructor(spritesheet, sw, sh, dx, dy, animationLength, offsetX = 0, offsetY = 0) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 0;
    this.xDirection = 1;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  draw() {
    this.u = (this.moving != 0) ? this.currentFrame % this.animationLength : 0;
    push();
    translate(this.dx,this.dy);
    scale(this.xDirection,1);
  
    image(this.spritesheet,0,0,this.sw,this.sh,this.u*this.sw+this.offsetX,this.v*this.sh+this.offsetY,this.sw,this.sh);
    pop();
    if (frameCount % 6 == 0) {
      this.currentFrame++;
    }
  
    this.dx += this.moving;
  }

  keyPressed(right, left) {
    if (keyCode === right) {
      this.moving = 1;
      this.xDirection = 1;
      this.currentFrame = 1;
    } else if (keyCode === left) {
      this.moving = -1;
      this.xDirection = -1;
      this.currentFrame = 1;
    }
  }

  keyReleased(right,left) {
    if (keyCode === right || keyCode === left) {
      this.moving = 0;
    }
  }
}