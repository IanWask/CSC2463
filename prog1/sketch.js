function setup() {
  createCanvas(700, 700);
  colorMode(HSB);
}


  function draw() {
    //START OF EXAMPLE 1
    background(0,0,100);
    push();
    noStroke();
    fill(120,100,100);
    rect(25,25,310,150);//draws green background
    pop();
    circle(110,100,100);//draws white cicle
    square(210,50,100);//draws white square

    //START OF EXAMPLE 2

    //draws green, blue, red circle (in that order)
    push();
    noStroke();
    fill(120,100,100,0.5);
    ellipse(150,300,100,100);
    fill(220,100,100,0.5);
    ellipse(100,300,100,100);
    fill(0,100,100,0.5);
    ellipse(125,250,100,100);
    pop();

    //START OF EXAMPLE 3

    //draws black background
    push();
    fill(0,0,0);
    rect(425,25,310,150);
    pop();

    //draws pacman
    push();
    fill(60,75,100);
    beginShape();
    circle(485,100,100);
    fill(0,0,0);
    vertex(485,100);
    vertex(435,55);
    vertex(435,145);
    endShape(CLOSE);
    pop();

    //draws red ghost body
    push();
    noStroke();
    fill(0,100,100);
    beginShape();
    fill(0,100,100);
    ellipse(625,100,100,100);
    vertex(675,100);
    vertex(575,100);
    vertex(575,150);
    vertex(675,150);
    endShape(CLOSE);
    pop();

    //draws red ghost's eyes
    push();
    circle(600,100,30);
    fill(240,100,100);
    circle(600,100,15);
    pop();
    push();
    circle(650,100,30);
    fill(240,100,100);
    circle(650,100,15);
    pop();

    //START OF EXAMPLE 4

    //draws blue square background 
    push();
    fill(240,100,50)
    square(425,250,200);
    pop();

    //draws green circle
    push();
    stroke(0,0,100);
    strokeWeight(3);
    fill(120,100,50);
    circle(525,350,100);
    pop();

    //draws red star
    push();
    stroke(0,0,100);
    strokeWeight(3);
    fill(0,100,100);
    rotate(0.3);
    star(605,180,55,20,5);
    pop();

  }

//function that creates a star (found on p5js examples)
  function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints; 
    let halfAngle = angle / 2.0; 
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
