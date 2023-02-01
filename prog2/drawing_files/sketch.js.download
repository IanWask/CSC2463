let x = 0;
let y = 0;
let size = 30;
let h = 0;
let s = 0;
let b = 100;
let paints;

function setup() {
  createCanvas(800, 800);
  colorMode(HSB);
  paints =[ 
    new PaintSquare(0,0,20,0,100,100),
    new PaintSquare(0,20,20,30,100,100),
    new PaintSquare(0,40,20,60,100,100),
    new PaintSquare(0,60,20,120,100,100),
    new PaintSquare(0,80,20,180,100,100),
    new PaintSquare(0,100,20,240,100,100),
    new PaintSquare(0,120,20,300,100,100),
    new PaintSquare(0,140,20,15,50,40),
    new PaintSquare(0,160,20,0,0,100),
    new PaintSquare(0,180,20,0,0,0)
  ]
}

function draw() {
  if (mouseIsPressed) {
    stroke(h,s,b);
    line(mouseX,mouseY,mouseX,mouseY,mouseX,mouseY);    
    strokeWeight(20);
  } 
  

  for(let i=0;i<paints.length;i++){
    paints[i].draw();
  }
  
}

function mousePressed(){
  for(let i=0;i<paints.length;i++){
    paints[i].mousePressed();
  }
}

class PaintSquare {
  constructor(x,y,size,h,s,b){
    this.x=x;
    this.y=y;
    this.size=size;
    this.h=h;
    this.s=s;
    this.b=b;
  }

  draw(){
    noStroke();
    fill(this.h,this.s,this.b);
    square(this.x,this.y,this.size)
  }

  mousePressed(){
    let insideX = mouseX >= this.x && mouseX <= this.x + this.size;
    let insideY = mouseY >= this.y && mouseY <= this.y + this.size;
    
    console.log("in x:"+ insideX);
    console.log("in y:"+ insideY);
   
    let inside = insideX && insideY;
    if (inside) {
      h=this.h;
      s=this.s;
      b=this.b;
    }
  }


}


