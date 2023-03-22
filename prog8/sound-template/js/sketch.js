let spriteSheetFilenames = ["ant.png"];
let spriteSheets = [];
let animations = [];

let midi;

let synthMain = new Tone.PolySynth().toDestination();

const GameState = {
  Start: "Start",
  Playing: "Playing",
  GameOver: "GameOver"
};

let game = {score: 0, maxScore: 0, maxTime: 30, elapsedTime: 0, totalSprites: 5, state: GameState.Start, targetSprite: 0,speed: 1, song: 1};

let sounds = new Tone.Players({

  "squish":"sounds/squish.wav",
  "miss":"sounds/miss.ogg",
  "over":"sounds/gameover.wav"

})

let soundNames = ["squish", "miss"];
let buttons =[];

function preload() {
  for(let i=0; i < spriteSheetFilenames.length; i++) {
    spriteSheets[i] = loadImage("assets/" + spriteSheetFilenames[i]);
  }
}

let button1, button2;

function setup() {
  createCanvas(400, 400);
  imageMode(CENTER);
  angleMode(DEGREES);
  sounds.toDestination();

  reset();
}

function reset() {
  game.elapsedTime = 0;
  game.score = 0;
  game.totalSprites = random(40,60);
  game.speed=1;
  game.song=1;

  animations = [];
  for(let i=0; i < game.totalSprites; i++) {
    animations[i] = new WalkingAnimation(random(spriteSheets),80,80,random(50,350),random(50,350),4,game.speed,6,random([0,1]));
  }
}

function draw() {
  switch(game.state) {
    case GameState.Playing:
      background(220);
  
      for(let i=0; i < animations.length; i++) {
        animations[i].draw();
      }
      fill(0);
      textSize(40);
      text(game.score,20,40);
      let currentTime = game.maxTime - game.elapsedTime;
      text(ceil(currentTime), 300,40);
      game.elapsedTime += deltaTime / 1000;

      if (currentTime < 0){
        buttonSound("over");
        game.state = GameState.GameOver;
      }
      break;
    case GameState.GameOver:
      game.maxScore = max(game.score,game.maxScore);

      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text("Game Over!",200,200);
      textSize(35);
      text("Score: " + game.score,200,270);
      text("Max Score: " + game.maxScore,200,320);
      break;
    case GameState.Start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text("Ant Squish Game",200,200);
      textSize(30);
      text("Press Any Key to Start",200,300);
      if(game.song === 1){
        playMidi();
        game.song=0;
      }
      break;
  }
  
}

function keyPressed() {
  switch(game.state) {
    case GameState.Start:
      synthMain.volume.value = -1000;
      game.state = GameState.Playing;
      break;
    case GameState.GameOver:
      reset();
      game.state = GameState.Playing;
      break;
  }
}

function mousePressed() {
  switch(game.state) {
    case GameState.Playing:
      for (let i=0; i < animations.length; i++) {
        let contains = animations[i].contains(mouseX,mouseY);
        if (contains) {
          if (animations[i].moving != 0) {
            animations[i].stop();
            game.score += 1;
            buttonSound("squish");
          }
        }
        else{
          buttonSound("miss");
        }
      }
      break;
  }
  
}

class WalkingAnimation {
  constructor(spritesheet, sw, sh, dx, dy, animationLength, speed, framerate, vertical = false, offsetX = 0, offsetY = 0) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 1;
    this.xDirection = 1;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.speed = speed;
    this.framerate = framerate*game.speed;
    this.vertical = vertical;
  }

  draw() {
    this.u = (this.moving != 0) ? this.currentFrame % this.animationLength : this.u;
    push();
    translate(this.dx,this.dy);
    if (!this.vertical)
      rotate(90);
    else{
      rotate(180);
    }
    scale(this.xDirection,1);
    

    image(this.spritesheet,0,0,this.sw,this.sh,this.u*this.sw+this.offsetX,this.v*this.sh+this.offsetY,this.sw,this.sh);
    pop();
    let proportionalFramerate = round(frameRate() / this.framerate);
    if (frameCount % proportionalFramerate == 0) {
      this.currentFrame++;
    }
  
    if (this.vertical) {
      this.dy += this.moving*game.speed;
      this.move(this.dy,this.sw / 4,height - this.sw / 4);
    }
    else {
      this.dx += this.moving*game.speed;
      this.move(this.dx,this.sw / 4,width - this.sw / 4);
    }

    
  }

  move(position,lowerBounds,upperBounds) {
    if (position > upperBounds) {
      this.moveLeft();
    } else if (position < lowerBounds) {
      this.moveRight(); 
    }
  }

  moveRight() {
    this.moving = 1;
    this.xDirection = 1;
    this.v = 0;
  }

  moveLeft() {
    this.moving = -1;
    this.xDirection = -1;
    this.v = 0;
    //rotate(180);
  }

  contains(x,y) {
    x - 26 && x <= this.dx + 25;
    let insideX = x >= this.dx - 26 && x <= this.dx + 25;
    let insideY = y >= this.dy - 35 && y <= this.dy + 35;
    return insideX && insideY;
  }

  stop() {
    this.moving = 0;
    this.u = 4;
    this.v = 0;
    game.speed++;
  }
}

function buttonSound(whichSound) {
  sounds.player(whichSound).start();
}

function playMidi() {
  // const name = midi.name
  //get the tracks
  zelda.tracks.forEach(track => {
    //tracks have notes and controlChanges
  
    //notes are an array
    const notes = track.notes
    notes.forEach(note => {
      //note.midi, note.time, note.duration, note.name
      synthMain.triggerAttackRelease(note.name, note.duration, note.time)
    })
  
  })}

  let zelda={
    "header": {
      "keySignatures": [
        {
          "key": "D",
          "scale": "major",
          "ticks": 0
        },
        {
          "key": "C",
          "scale": "major",
          "ticks": 264192
        }
      ],
      "meta": [],
      "name": "",
      "ppq": 1024,
      "tempos": [
        {
          "bpm": 120.00024000048,
          "ticks": 0
        },
        {
          "bpm": 143.99988480009216,
          "ticks": 0
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 0
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 19969
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 20188
        },
        {
          "bpm": 133.47659821541788,
          "ticks": 20407
        },
        {
          "bpm": 127.96805917243056,
          "ticks": 20626
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 20845
        },
        {
          "bpm": 117.47982284042716,
          "ticks": 21064
        },
        {
          "bpm": 112.49985937517579,
          "ticks": 21283
        },
        {
          "bpm": 63.98409781888875,
          "ticks": 21504
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 24576
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 47616
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 47798
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 47980
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 48162
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 48344
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 48526
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 48708
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 48890
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 49408
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 72192
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 72374
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 72556
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 72738
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 72920
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 73102
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 73284
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 73466
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 73984
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 81408
        },
        {
          "bpm": 143.49535553365922,
          "ticks": 81590
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 81772
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 81954
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 82136
        },
        {
          "bpm": 141.97184698274333,
          "ticks": 82318
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 82500
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 82682
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 82944
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 96768
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 96950
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 97132
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 97314
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 97496
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 97678
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 97860
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 98042
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 98560
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 133632
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 133814
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 133996
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 134178
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 134360
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 134542
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 134724
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 134906
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 135424
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 145920
        },
        {
          "bpm": 143.49535553365922,
          "ticks": 146102
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 146284
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 146466
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 146648
        },
        {
          "bpm": 141.97184698274333,
          "ticks": 146830
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 147012
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 147194
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 147456
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 172032
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 195072
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 195254
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 195436
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 195618
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 195800
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 195982
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 196164
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 196346
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 196864
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 219648
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 219830
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 220012
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 220194
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 220376
        },
        {
          "bpm": 139.97988955586715,
          "ticks": 220558
        },
        {
          "bpm": 139.45250944790752,
          "ticks": 220740
        },
        {
          "bpm": 138.45653272535532,
          "ticks": 220922
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 225792
        },
        {
          "bpm": 143.49535553365922,
          "ticks": 225974
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 226156
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 226338
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 226520
        },
        {
          "bpm": 141.97184698274333,
          "ticks": 226702
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 226884
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 227066
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 227328
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 228864
        },
        {
          "bpm": 143.49535553365922,
          "ticks": 229046
        },
        {
          "bpm": 142.96811334512026,
          "ticks": 229228
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 229410
        },
        {
          "bpm": 142.49953687650515,
          "ticks": 229592
        },
        {
          "bpm": 141.97184698274333,
          "ticks": 229774
        },
        {
          "bpm": 141.44438288994448,
          "ticks": 229956
        },
        {
          "bpm": 140.97611864550146,
          "ticks": 230138
        },
        {
          "bpm": 143.9639514265628,
          "ticks": 230400
        },
        {
          "bpm": 95.99984640024576,
          "ticks": 264192
        },
        {
          "bpm": 95.97573733360207,
          "ticks": 264192
        },
        {
          "bpm": 95.97573733360207,
          "ticks": 286721
        },
        {
          "bpm": 92.4601804822723,
          "ticks": 287013
        },
        {
          "bpm": 88.94475937477763,
          "ticks": 287305
        },
        {
          "bpm": 85.48823040787859,
          "ticks": 287597
        },
        {
          "bpm": 81.97191642143402,
          "ticks": 287889
        },
        {
          "bpm": 78.45639655001072,
          "ticks": 288181
        },
        {
          "bpm": 74.99990625011719,
          "ticks": 288473
        }
      ],
      "timeSignatures": [
        {
          "ticks": 0,
          "timeSignature": [
            6,
            8
          ],
          "measures": 0
        },
        {
          "ticks": 264192,
          "timeSignature": [
            4,
            4
          ],
          "measures": 21.5
        }
      ]
    },
    "tracks": [
      {
        "channel": 0,
        "controlChanges": {
          "7": [
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.7952755905511811
            },
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 10,
              "time": 0.004070029296875,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 24536,
              "time": 11.61090266308594,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 127707,
              "time": 53.68022355273436,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 127707,
              "time": 53.68022355273436,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 128964,
              "time": 54.19182623535154,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 128964,
              "time": 54.19182623535154,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 133851,
              "time": 56.18095444628904,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 133851,
              "time": 56.18095444628904,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 135109,
              "time": 56.7048170019531,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 135109,
              "time": 56.7048170019531,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 146139,
              "time": 61.199208170898416,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 146139,
              "time": 61.199208170898416,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 147396,
              "time": 61.717143346679656,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 147396,
              "time": 61.717143346679656,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 152283,
              "time": 63.70668422265622,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 152283,
              "time": 63.70668422265622,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 153540,
              "time": 64.2182869052734,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 153540,
              "time": 64.2182869052734,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 158427,
              "time": 66.20731022265622,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 158427,
              "time": 66.20731022265622,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 159684,
              "time": 66.71891290527341,
              "value": 0.8031496062992126
            },
            {
              "number": 7,
              "ticks": 159684,
              "time": 66.71891290527341,
              "value": 0.8661417322834646
            },
            {
              "number": 7,
              "ticks": 249051,
              "time": 103.20991356249996,
              "value": 0.8031496062992126
            }
          ],
          "10": [
            {
              "number": 10,
              "ticks": 0,
              "time": 0,
              "value": 0.5039370078740157
            }
          ]
        },
        "pitchBends": [],
        "instrument": {
          "family": "piano",
          "number": 1,
          "name": "bright acoustic piano"
        },
        "name": "Piano",
        "notes": [
          {
            "duration": 1.2458359677734374,
            "durationTicks": 3061,
            "midi": 57,
            "name": "A3",
            "ticks": 10,
            "time": 0.004070029296875,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2458359677734374,
            "durationTicks": 3061,
            "midi": 62,
            "name": "D4",
            "ticks": 10,
            "time": 0.004070029296875,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 3072,
            "time": 1.2503129999999998,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 3072,
            "time": 1.2503129999999998,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 6144,
            "time": 2.5006259999999996,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 6144,
            "time": 2.5006259999999996,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703121,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 9216,
            "time": 3.7509389999999994,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703121,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 9216,
            "time": 3.7509389999999994,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 12288,
            "time": 5.001251999999999,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 12288,
            "time": 5.001251999999999,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 15360,
            "time": 6.251564999999999,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 15360,
            "time": 6.251564999999999,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.3319350244140642,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 18432,
            "time": 7.501877999999999,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.3319350244140642,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 18432,
            "time": 7.501877999999999,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 2.4130141162109364,
            "durationTicks": 2635,
            "midi": 57,
            "name": "A3",
            "ticks": 21504,
            "time": 8.83433385839844,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 2.4130141162109364,
            "durationTicks": 2635,
            "midi": 61,
            "name": "C#4",
            "ticks": 21504,
            "time": 8.83433385839844,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.42531806152343776,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 24576,
            "time": 11.647532858398439,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 24576,
            "time": 11.647532858398439,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 24576,
            "time": 11.647532858398439,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.1961754121093744,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 25622,
            "time": 12.073257922851564,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031322,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 26135,
            "time": 12.28205042578125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1876283505859373,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 26645,
            "time": 12.489621919921875,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1953614062499991,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 27137,
            "time": 12.689867361328126,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 27648,
            "time": 12.897845858398439,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 27648,
            "time": 12.897845858398439,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703126,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 27648,
            "time": 12.897845858398439,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.615388429687501,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 29207,
            "time": 13.53236342578125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269531136,
            "durationTicks": 431,
            "midi": 69,
            "name": "A4",
            "ticks": 30720,
            "time": 14.148158858398439,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 30720,
            "time": 14.148158858398439,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 30720,
            "time": 14.148158858398439,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 31766,
            "time": 14.573883922851563,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031322,
            "durationTicks": 479,
            "midi": 69,
            "name": "A4",
            "ticks": 32279,
            "time": 14.78267642578125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1876283505859373,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 32789,
            "time": 14.990247919921876,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1953614062499991,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 33281,
            "time": 15.190493361328127,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.42531806152343776,
            "durationTicks": 1045,
            "midi": 67,
            "name": "G4",
            "ticks": 33792,
            "time": 15.398471858398437,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 33792,
            "time": 15.398471858398437,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 33792,
            "time": 15.398471858398437,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 69,
            "name": "A4",
            "ticks": 34838,
            "time": 15.824196922851563,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 66,
            "name": "F#4",
            "ticks": 35351,
            "time": 16.032989425781253,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 36864,
            "time": 16.648784858398436,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 36864,
            "time": 16.648784858398436,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 36864,
            "time": 16.648784858398436,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 37910,
            "time": 17.07450992285156,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 38423,
            "time": 17.28330242578125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 38933,
            "time": 17.490873919921874,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140624999732,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 39425,
            "time": 17.691119361328127,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 39936,
            "time": 17.899097858398438,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 39936,
            "time": 17.899097858398438,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 39936,
            "time": 17.899097858398438,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 41495,
            "time": 18.53361542578125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.2083855000000021,
            "durationTicks": 512,
            "midi": 69,
            "name": "A4",
            "ticks": 43008,
            "time": 19.149410858398436,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.6341105644531275,
            "durationTicks": 1558,
            "midi": 55,
            "name": "G3",
            "ticks": 43008,
            "time": 19.149410858398436,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.6341105644531275,
            "durationTicks": 1558,
            "midi": 59,
            "name": "B3",
            "ticks": 43008,
            "time": 19.149410858398436,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 67,
            "name": "G4",
            "ticks": 43551,
            "time": 19.370413449218752,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 44054,
            "time": 19.575135922851562,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.15751013378906364,
            "durationTicks": 387,
            "midi": 67,
            "name": "G4",
            "ticks": 44567,
            "time": 19.783928425781248,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296875027,
            "durationTicks": 1512,
            "midi": 57,
            "name": "A3",
            "ticks": 44567,
            "time": 19.783928425781248,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 0.6153884296875027,
            "durationTicks": 1512,
            "midi": 61,
            "name": "C#4",
            "ticks": 44567,
            "time": 19.783928425781248,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 66,
            "name": "F#4",
            "ticks": 45569,
            "time": 20.191745361328124,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2628027490234395,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 46080,
            "time": 20.39972385839844,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2628027490234395,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 46080,
            "time": 20.39972385839844,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4294625615234402,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 49152,
            "time": 21.66294979980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2540504970703132,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 49152,
            "time": 21.66294979980469,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2540504970703132,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 49152,
            "time": 21.66294979980469,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937262,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 50198,
            "time": 22.092819364257817,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031322,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 50711,
            "time": 22.301611867187503,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 51221,
            "time": 22.509183361328127,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 51713,
            "time": 22.70942880273438,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 52224,
            "time": 22.91740729980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 52224,
            "time": 22.91740729980469,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 52224,
            "time": 22.91740729980469,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296875027,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 53783,
            "time": 23.551924867187502,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269530958,
            "durationTicks": 431,
            "midi": 69,
            "name": "A4",
            "ticks": 55296,
            "time": 24.167720299804692,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 55296,
            "time": 24.167720299804692,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 55296,
            "time": 24.167720299804692,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937262,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 56342,
            "time": 24.593445364257818,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031322,
            "durationTicks": 479,
            "midi": 69,
            "name": "A4",
            "ticks": 56855,
            "time": 24.802237867187504,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 57365,
            "time": 25.009809361328127,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 57857,
            "time": 25.210054802734376,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.42531806152343776,
            "durationTicks": 1045,
            "midi": 67,
            "name": "G4",
            "ticks": 58368,
            "time": 25.41803329980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 58368,
            "time": 25.41803329980469,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 58368,
            "time": 25.41803329980469,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 69,
            "name": "A4",
            "ticks": 59414,
            "time": 25.843758364257816,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296875027,
            "durationTicks": 1512,
            "midi": 66,
            "name": "F#4",
            "ticks": 59927,
            "time": 26.052550867187502,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.42531806152343776,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 61440,
            "time": 26.66834629980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 61440,
            "time": 26.66834629980469,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 61440,
            "time": 26.66834629980469,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 62486,
            "time": 27.094071364257815,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 62999,
            "time": 27.302863867187504,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 63509,
            "time": 27.510435361328128,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 64001,
            "time": 27.710680802734377,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 64512,
            "time": 27.91865929980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 64512,
            "time": 27.91865929980469,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703108,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 64512,
            "time": 27.91865929980469,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 66071,
            "time": 28.553176867187503,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.2083855000000021,
            "durationTicks": 512,
            "midi": 69,
            "name": "A4",
            "ticks": 67584,
            "time": 29.16897229980469,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.6341105644531275,
            "durationTicks": 1558,
            "midi": 55,
            "name": "G3",
            "ticks": 67584,
            "time": 29.16897229980469,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.6341105644531275,
            "durationTicks": 1558,
            "midi": 59,
            "name": "B3",
            "ticks": 67584,
            "time": 29.16897229980469,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 67,
            "name": "G4",
            "ticks": 68127,
            "time": 29.389974890625002,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937262,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 68630,
            "time": 29.594697364257815,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031322,
            "durationTicks": 479,
            "midi": 66,
            "name": "F#4",
            "ticks": 69143,
            "time": 29.8034898671875,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 57,
            "name": "A3",
            "ticks": 69143,
            "time": 29.8034898671875,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 61,
            "name": "C#4",
            "ticks": 69143,
            "time": 29.8034898671875,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.18762835058593552,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 69653,
            "time": 30.011061361328128,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 70145,
            "time": 30.211306802734377,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 70656,
            "time": 30.41928529980469,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 70656,
            "time": 30.41928529980469,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17956276269531557,
            "durationTicks": 431,
            "midi": 74,
            "name": "D5",
            "ticks": 73728,
            "time": 31.68251124121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.212530000000001,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 73728,
            "time": 31.68251124121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 74271,
            "time": 31.907658332031254,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 74774,
            "time": 32.11238080566407,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 74774,
            "time": 32.11238080566407,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 75287,
            "time": 32.32117330859376,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 75287,
            "time": 32.32117330859376,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 75797,
            "time": 32.52874480273438,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 75797,
            "time": 32.52874480273438,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 76289,
            "time": 32.728990244140626,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 76289,
            "time": 32.728990244140626,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637499999786,
            "durationTicks": 128,
            "midi": 75,
            "name": "D#5",
            "ticks": 76672,
            "time": 32.88487236621094,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 76800,
            "time": 32.93696874121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 76800,
            "time": 32.93696874121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 77343,
            "time": 33.15797133203125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 55,
            "name": "G3",
            "ticks": 77846,
            "time": 33.362693805664065,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 78359,
            "time": 33.571486308593755,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 78359,
            "time": 33.571486308593755,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 78869,
            "time": 33.77905780273438,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140624999376,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 79361,
            "time": 33.97930324414063,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 79872,
            "time": 34.18728174121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 47,
            "name": "B2",
            "ticks": 79872,
            "time": 34.18728174121094,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 80415,
            "time": 34.40828433203125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 55,
            "name": "G3",
            "ticks": 80415,
            "time": 34.40828433203125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 80918,
            "time": 34.613006805664064,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 80918,
            "time": 34.613006805664064,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4103413115234318,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 81431,
            "time": 34.821799308593754,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19558752441405858,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 81431,
            "time": 34.821799308593754,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18966739648436715,
            "durationTicks": 461,
            "midi": 59,
            "name": "B3",
            "ticks": 81941,
            "time": 35.03009180761719,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19905613964844093,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 82433,
            "time": 35.23255333398437,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19905613964844093,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 82433,
            "time": 35.23255333398437,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 82944,
            "time": 35.44449396972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 61,
            "name": "C#4",
            "ticks": 82944,
            "time": 35.44449396972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 83487,
            "time": 35.66549656054687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 61,
            "name": "C#4",
            "ticks": 83990,
            "time": 35.870219034179684,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 84503,
            "time": 36.07901153710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 55,
            "name": "G3",
            "ticks": 84503,
            "time": 36.07901153710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 85013,
            "time": 36.28658303125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 61,
            "name": "C#4",
            "ticks": 85505,
            "time": 36.48682847265624,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637499999786,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 85888,
            "time": 36.64271059472656,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269531668,
            "durationTicks": 431,
            "midi": 74,
            "name": "D5",
            "ticks": 86016,
            "time": 36.69480696972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 86016,
            "time": 36.69480696972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 86559,
            "time": 36.91580956054687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 87062,
            "time": 37.12053203417968,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 87062,
            "time": 37.12053203417968,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 87575,
            "time": 37.32932453710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 87575,
            "time": 37.32932453710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 88085,
            "time": 37.536896031249995,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 88085,
            "time": 37.536896031249995,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 88577,
            "time": 37.73714147265625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 88577,
            "time": 37.73714147265625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 76,
            "name": "E5",
            "ticks": 89088,
            "time": 37.945119969726555,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 89088,
            "time": 37.945119969726555,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 89631,
            "time": 38.16612256054687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 73,
            "name": "C#5",
            "ticks": 90134,
            "time": 38.37084503417968,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 90134,
            "time": 38.37084503417968,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 90647,
            "time": 38.57963753710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 90647,
            "time": 38.57963753710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 91157,
            "time": 38.78720903124999,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 91649,
            "time": 38.987454472656246,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 92160,
            "time": 39.19543296972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 47,
            "name": "B2",
            "ticks": 92160,
            "time": 39.19543296972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 92703,
            "time": 39.41643556054687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 55,
            "name": "G3",
            "ticks": 92703,
            "time": 39.41643556054687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 93206,
            "time": 39.621158034179686,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 93206,
            "time": 39.621158034179686,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.40740993261719183,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 93719,
            "time": 39.82995053710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031677,
            "durationTicks": 479,
            "midi": 57,
            "name": "A3",
            "ticks": 93719,
            "time": 39.82995053710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 59,
            "name": "B3",
            "ticks": 94229,
            "time": 40.03752203124999,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 73,
            "name": "C#5",
            "ticks": 94721,
            "time": 40.237767472656245,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 61,
            "name": "C#4",
            "ticks": 94721,
            "time": 40.237767472656245,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2628027490234288,
            "durationTicks": 3071,
            "midi": 74,
            "name": "D5",
            "ticks": 95232,
            "time": 40.44574596972656,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269530958,
            "durationTicks": 431,
            "midi": 62,
            "name": "D4",
            "ticks": 95232,
            "time": 40.44574596972656,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 61,
            "name": "C#4",
            "ticks": 96278,
            "time": 40.871471034179685,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4128971337890519,
            "durationTicks": 1001,
            "midi": 62,
            "name": "D4",
            "ticks": 96791,
            "time": 41.08026353710937,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20227368945312918,
            "durationTicks": 480,
            "midi": 57,
            "name": "A3",
            "ticks": 97793,
            "time": 41.493579257812485,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.054168625000002635,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 98176,
            "time": 41.6548032861328,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.42946256152343665,
            "durationTicks": 1045,
            "midi": 74,
            "name": "D5",
            "ticks": 98304,
            "time": 41.7089719111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.212530000000001,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 98304,
            "time": 41.7089719111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 98847,
            "time": 41.93411900195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 99350,
            "time": 42.13884147558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 99350,
            "time": 42.13884147558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 99863,
            "time": 42.34763397851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 99863,
            "time": 42.34763397851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 100373,
            "time": 42.55520547265623,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 100373,
            "time": 42.55520547265623,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 100865,
            "time": 42.755450914062486,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 100865,
            "time": 42.755450914062486,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 101376,
            "time": 42.9634294111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 101376,
            "time": 42.9634294111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 101919,
            "time": 43.18443200195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 102422,
            "time": 43.389154475585926,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 102935,
            "time": 43.59794697851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031677,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 102935,
            "time": 43.59794697851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 103445,
            "time": 43.80551847265623,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 103937,
            "time": 44.005763914062484,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 104448,
            "time": 44.2137424111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 47,
            "name": "B2",
            "ticks": 104448,
            "time": 44.2137424111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 104991,
            "time": 44.43474500195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 104991,
            "time": 44.43474500195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 105494,
            "time": 44.639467475585924,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 61,
            "name": "C#4",
            "ticks": 105494,
            "time": 44.639467475585924,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.40740993261719183,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 106007,
            "time": 44.84825997851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332031677,
            "durationTicks": 479,
            "midi": 59,
            "name": "B3",
            "ticks": 106007,
            "time": 44.84825997851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593197,
            "durationTicks": 461,
            "midi": 61,
            "name": "C#4",
            "ticks": 106517,
            "time": 45.05583147265624,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05779441601562496,
            "durationTicks": 142,
            "midi": 74,
            "name": "D5",
            "ticks": 107009,
            "time": 45.25607691406248,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 57,
            "name": "A3",
            "ticks": 107009,
            "time": 45.25607691406248,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637499999786,
            "durationTicks": 128,
            "midi": 74,
            "name": "D5",
            "ticks": 107392,
            "time": 45.4119590361328,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234342,
            "durationTicks": 1045,
            "midi": 76,
            "name": "E5",
            "ticks": 107520,
            "time": 45.4640554111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 49,
            "name": "C#3",
            "ticks": 107520,
            "time": 45.4640554111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 55,
            "name": "G3",
            "ticks": 108063,
            "time": 45.68505800195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 73,
            "name": "C#5",
            "ticks": 108566,
            "time": 45.88978047558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 108566,
            "time": 45.88978047558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 109079,
            "time": 46.09857297851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 62,
            "name": "D4",
            "ticks": 109079,
            "time": 46.09857297851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637499999786,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 110464,
            "time": 46.6622720361328,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 74,
            "name": "D5",
            "ticks": 110592,
            "time": 46.714368411132796,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 110592,
            "time": 46.714368411132796,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 111135,
            "time": 46.93537100195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 111638,
            "time": 47.14009347558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 111638,
            "time": 47.14009347558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 112151,
            "time": 47.34888597851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 112151,
            "time": 47.34888597851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 112661,
            "time": 47.556457472656234,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 112661,
            "time": 47.556457472656234,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 113153,
            "time": 47.75670291406249,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 113153,
            "time": 47.75670291406249,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6341105644531311,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 113664,
            "time": 47.964681411132794,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 113664,
            "time": 47.964681411132794,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 114207,
            "time": 48.185684001953106,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 61,
            "name": "C#4",
            "ticks": 114710,
            "time": 48.39040647558592,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 115223,
            "time": 48.59919897851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 115223,
            "time": 48.59919897851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 115733,
            "time": 48.80677047265623,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 116225,
            "time": 49.007015914062485,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 116736,
            "time": 49.2149944111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999856,
            "durationTicks": 512,
            "midi": 47,
            "name": "B2",
            "ticks": 116736,
            "time": 49.2149944111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 117279,
            "time": 49.43599700195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 55,
            "name": "G3",
            "ticks": 117279,
            "time": 49.43599700195311,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 117782,
            "time": 49.640719475585925,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 117782,
            "time": 49.640719475585925,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4074099326171847,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 118295,
            "time": 49.84951197851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 57,
            "name": "A3",
            "ticks": 118295,
            "time": 49.84951197851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 59,
            "name": "B3",
            "ticks": 118805,
            "time": 50.05708347265623,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 73,
            "name": "C#5",
            "ticks": 119297,
            "time": 50.257328914062484,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 61,
            "name": "C#4",
            "ticks": 119297,
            "time": 50.257328914062484,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 74,
            "name": "D5",
            "ticks": 119808,
            "time": 50.4653074111328,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269530958,
            "durationTicks": 431,
            "midi": 62,
            "name": "D4",
            "ticks": 119808,
            "time": 50.4653074111328,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19617541210937617,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 120854,
            "time": 50.891032475585924,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 62,
            "name": "D4",
            "ticks": 121367,
            "time": 51.09982497851561,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 71,
            "name": "B4",
            "ticks": 122880,
            "time": 51.7156204111328,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 122880,
            "time": 51.7156204111328,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 122880,
            "time": 51.7156204111328,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 69,
            "name": "A4",
            "ticks": 125952,
            "time": 52.965933411132795,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 54,
            "name": "F#3",
            "ticks": 125952,
            "time": 52.965933411132795,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 61,
            "name": "C#4",
            "ticks": 125952,
            "time": 52.965933411132795,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 67,
            "name": "G4",
            "ticks": 129024,
            "time": 54.21624641113279,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 52,
            "name": "E3",
            "ticks": 129024,
            "time": 54.21624641113279,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 129024,
            "time": 54.21624641113279,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 66,
            "name": "F#4",
            "ticks": 132096,
            "time": 55.46655941113279,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 50,
            "name": "D3",
            "ticks": 132096,
            "time": 55.46655941113279,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 57,
            "name": "A3",
            "ticks": 132096,
            "time": 55.46655941113279,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 1.2540504970703097,
            "durationTicks": 3071,
            "midi": 71,
            "name": "B4",
            "ticks": 135168,
            "time": 56.72978535253904,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2540504970703097,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 135168,
            "time": 56.72978535253904,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2540504970703097,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 135168,
            "time": 56.72978535253904,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.2588538632812458,
            "durationTicks": 636,
            "midi": 69,
            "name": "A4",
            "ticks": 138240,
            "time": 57.98424285253904,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.2588538632812458,
            "durationTicks": 636,
            "midi": 54,
            "name": "F#3",
            "ticks": 138240,
            "time": 57.98424285253904,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.2588538632812458,
            "durationTicks": 636,
            "midi": 61,
            "name": "C#4",
            "ticks": 138240,
            "time": 57.98424285253904,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 0.24013172851562814,
            "durationTicks": 590,
            "midi": 67,
            "name": "G4",
            "ticks": 139799,
            "time": 58.61876041992185,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.24013172851562814,
            "durationTicks": 590,
            "midi": 52,
            "name": "E3",
            "ticks": 139799,
            "time": 58.61876041992185,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 0.24013172851562814,
            "durationTicks": 590,
            "midi": 59,
            "name": "B3",
            "ticks": 139799,
            "time": 58.61876041992185,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703073,
            "durationTicks": 3071,
            "midi": 66,
            "name": "F#4",
            "ticks": 141312,
            "time": 59.23455585253904,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703073,
            "durationTicks": 3071,
            "midi": 50,
            "name": "D3",
            "ticks": 141312,
            "time": 59.23455585253904,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703073,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 141312,
            "time": 59.23455585253904,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 64,
            "name": "E4",
            "ticks": 144384,
            "time": 60.48486885253904,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 49,
            "name": "C#3",
            "ticks": 144384,
            "time": 60.48486885253904,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 55,
            "name": "G3",
            "ticks": 144384,
            "time": 60.48486885253904,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 71,
            "name": "B4",
            "ticks": 147456,
            "time": 61.74208108105466,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 147456,
            "time": 61.74208108105466,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 147456,
            "time": 61.74208108105466,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 69,
            "name": "A4",
            "ticks": 150528,
            "time": 62.992394081054655,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 54,
            "name": "F#3",
            "ticks": 150528,
            "time": 62.992394081054655,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.2588538632812529,
            "durationTicks": 636,
            "midi": 61,
            "name": "C#4",
            "ticks": 150528,
            "time": 62.992394081054655,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 74,
            "name": "D5",
            "ticks": 153600,
            "time": 64.24270708105466,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 153600,
            "time": 64.24270708105466,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 66,
            "name": "F#4",
            "ticks": 153600,
            "time": 64.24270708105466,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.25885386328126003,
            "durationTicks": 636,
            "midi": 73,
            "name": "C#5",
            "ticks": 156672,
            "time": 65.49302008105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.25885386328126003,
            "durationTicks": 636,
            "midi": 55,
            "name": "G3",
            "ticks": 156672,
            "time": 65.49302008105465,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.25885386328126003,
            "durationTicks": 636,
            "midi": 64,
            "name": "E4",
            "ticks": 156672,
            "time": 65.49302008105465,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 73,
            "name": "C#5",
            "ticks": 159744,
            "time": 66.74333308105466,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 159744,
            "time": 66.74333308105466,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 64,
            "name": "E4",
            "ticks": 159744,
            "time": 66.74333308105466,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 72,
            "name": "C5",
            "ticks": 162816,
            "time": 67.99364608105466,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 54,
            "name": "F#3",
            "ticks": 162816,
            "time": 67.99364608105466,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 63,
            "name": "D#4",
            "ticks": 162816,
            "time": 67.99364608105466,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 71,
            "name": "B4",
            "ticks": 165888,
            "time": 69.24395908105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 2.50021899707032,
            "durationTicks": 6143,
            "midi": 53,
            "name": "F3",
            "ticks": 165888,
            "time": 69.24395908105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 2.50021899707032,
            "durationTicks": 6143,
            "midi": 62,
            "name": "D4",
            "ticks": 165888,
            "time": 69.24395908105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 69,
            "name": "A4",
            "ticks": 166934,
            "time": 69.66968414550779,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1575101337890601,
            "durationTicks": 387,
            "midi": 81,
            "name": "A5",
            "ticks": 167447,
            "time": 69.87847664843747,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 168449,
            "time": 70.28629358398435,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 81,
            "name": "A5",
            "ticks": 168960,
            "time": 70.49427208105466,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 172032,
            "time": 71.74458508105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 172032,
            "time": 71.74458508105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 172032,
            "time": 71.74458508105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 173078,
            "time": 72.17031014550777,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 173591,
            "time": 72.37910264843747,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 174101,
            "time": 72.58667414257809,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 174593,
            "time": 72.78691958398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 175104,
            "time": 72.99489808105466,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 175104,
            "time": 72.99489808105466,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 175104,
            "time": 72.99489808105466,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 176663,
            "time": 73.62941564843746,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269531668,
            "durationTicks": 431,
            "midi": 69,
            "name": "A4",
            "ticks": 178176,
            "time": 74.24521108105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 178176,
            "time": 74.24521108105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 178176,
            "time": 74.24521108105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 179222,
            "time": 74.67093614550778,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 69,
            "name": "A4",
            "ticks": 179735,
            "time": 74.87972864843746,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 180245,
            "time": 75.08730014257809,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 180737,
            "time": 75.28754558398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 67,
            "name": "G4",
            "ticks": 181248,
            "time": 75.49552408105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 181248,
            "time": 75.49552408105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 181248,
            "time": 75.49552408105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 69,
            "name": "A4",
            "ticks": 182294,
            "time": 75.92124914550777,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 66,
            "name": "F#4",
            "ticks": 182807,
            "time": 76.13004164843747,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 184320,
            "time": 76.74583708105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 184320,
            "time": 76.74583708105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 184320,
            "time": 76.74583708105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 185366,
            "time": 77.17156214550778,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 185879,
            "time": 77.38035464843746,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 186389,
            "time": 77.58792614257808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 186881,
            "time": 77.78817158398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 187392,
            "time": 77.99615008105465,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 187392,
            "time": 77.99615008105465,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 187392,
            "time": 77.99615008105465,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 188951,
            "time": 78.63066764843747,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999145,
            "durationTicks": 512,
            "midi": 69,
            "name": "A4",
            "ticks": 190464,
            "time": 79.24646308105466,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 55,
            "name": "G3",
            "ticks": 190464,
            "time": 79.24646308105466,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 59,
            "name": "B3",
            "ticks": 190464,
            "time": 79.24646308105466,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 67,
            "name": "G4",
            "ticks": 191007,
            "time": 79.46746567187496,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 191510,
            "time": 79.67218814550777,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1575101337890601,
            "durationTicks": 387,
            "midi": 67,
            "name": "G4",
            "ticks": 192023,
            "time": 79.88098064843746,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 57,
            "name": "A3",
            "ticks": 192023,
            "time": 79.88098064843746,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 61,
            "name": "C#4",
            "ticks": 192023,
            "time": 79.88098064843746,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 66,
            "name": "F#4",
            "ticks": 193025,
            "time": 80.28879758398433,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 193536,
            "time": 80.49677608105465,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 193536,
            "time": 80.49677608105465,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.42946256152343665,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 196608,
            "time": 81.7600020224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.254050497070324,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 196608,
            "time": 81.7600020224609,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.254050497070324,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 196608,
            "time": 81.7600020224609,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 197654,
            "time": 82.18987158691402,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 198167,
            "time": 82.39866408984372,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 198677,
            "time": 82.60623558398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 199169,
            "time": 82.80648102539058,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 199680,
            "time": 83.0144595224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 199680,
            "time": 83.0144595224609,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 199680,
            "time": 83.0144595224609,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 201239,
            "time": 83.64897708984371,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269531668,
            "durationTicks": 431,
            "midi": 69,
            "name": "A4",
            "ticks": 202752,
            "time": 84.2647725224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 55,
            "name": "G3",
            "ticks": 202752,
            "time": 84.2647725224609,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 59,
            "name": "B3",
            "ticks": 202752,
            "time": 84.2647725224609,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 203798,
            "time": 84.69049758691402,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 69,
            "name": "A4",
            "ticks": 204311,
            "time": 84.89929008984372,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 204821,
            "time": 85.10686158398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 205313,
            "time": 85.3071070253906,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234271,
            "durationTicks": 1045,
            "midi": 67,
            "name": "G4",
            "ticks": 205824,
            "time": 85.51508552246091,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 205824,
            "time": 85.51508552246091,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703001,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 205824,
            "time": 85.51508552246091,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 69,
            "name": "A4",
            "ticks": 206870,
            "time": 85.94081058691403,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 66,
            "name": "F#4",
            "ticks": 207383,
            "time": 86.14960308984371,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 62,
            "name": "D4",
            "ticks": 208896,
            "time": 86.7653985224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 208896,
            "time": 86.7653985224609,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 208896,
            "time": 86.7653985224609,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 74,
            "name": "D5",
            "ticks": 209942,
            "time": 87.19112358691403,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 73,
            "name": "C#5",
            "ticks": 210455,
            "time": 87.39991608984371,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 71,
            "name": "B4",
            "ticks": 210965,
            "time": 87.60748758398434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 69,
            "name": "A4",
            "ticks": 211457,
            "time": 87.80773302539059,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 71,
            "name": "B4",
            "ticks": 211968,
            "time": 88.0157115224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 211968,
            "time": 88.0157115224609,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 61,
            "name": "C#4",
            "ticks": 211968,
            "time": 88.0157115224609,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 67,
            "name": "G4",
            "ticks": 213527,
            "time": 88.65022908984372,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 69,
            "name": "A4",
            "ticks": 215040,
            "time": 89.2660245224609,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 55,
            "name": "G3",
            "ticks": 215040,
            "time": 89.2660245224609,
            "velocity": 0.48031496062992124
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 59,
            "name": "B3",
            "ticks": 215040,
            "time": 89.2660245224609,
            "velocity": 0.5905511811023622
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 67,
            "name": "G4",
            "ticks": 215583,
            "time": 89.48702711328121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 64,
            "name": "E4",
            "ticks": 216086,
            "time": 89.69174958691403,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 66,
            "name": "F#4",
            "ticks": 216599,
            "time": 89.90054208984371,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 57,
            "name": "A3",
            "ticks": 216599,
            "time": 89.90054208984371,
            "velocity": 0.4409448818897638
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 61,
            "name": "C#4",
            "ticks": 216599,
            "time": 89.90054208984371,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 67,
            "name": "G4",
            "ticks": 217109,
            "time": 90.10811358398433,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 64,
            "name": "E4",
            "ticks": 217601,
            "time": 90.30835902539059,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 62,
            "name": "D4",
            "ticks": 218112,
            "time": 90.5163375224609,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.262802749023436,
            "durationTicks": 3071,
            "midi": 57,
            "name": "A3",
            "ticks": 218112,
            "time": 90.5163375224609,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18239591699219204,
            "durationTicks": 431,
            "midi": 74,
            "name": "D5",
            "ticks": 221184,
            "time": 91.77956346386715,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.21667449999999633,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 221184,
            "time": 91.77956346386715,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19974680468750705,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 221727,
            "time": 92.00935692773433,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.21667449999999633,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 222230,
            "time": 92.22222269628902,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20397872851562227,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 222230,
            "time": 92.22222269628902,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.2027091513671877,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 222743,
            "time": 92.43932038867183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.2027091513671877,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 222743,
            "time": 92.43932038867183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1950916884765519,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 223253,
            "time": 92.65514850390622,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1950916884765519,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 223253,
            "time": 92.65514850390622,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20313234374999922,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 223745,
            "time": 92.86335915624996,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20313234374999922,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 223745,
            "time": 92.86335915624996,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.054168625000002635,
            "durationTicks": 128,
            "midi": 75,
            "name": "D#5",
            "ticks": 224128,
            "time": 93.02544183886715,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6589775644531102,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 224256,
            "time": 93.07961046386716,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.21667449999999633,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 224256,
            "time": 93.07961046386716,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19974680468749284,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 224799,
            "time": 93.30940392773434,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20397872851562227,
            "durationTicks": 482,
            "midi": 55,
            "name": "G3",
            "ticks": 225302,
            "time": 93.52226969628903,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6222790322265581,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 225815,
            "time": 93.73899503124996,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19558752441406568,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 225815,
            "time": 93.73899503124996,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18966739648436715,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 226325,
            "time": 93.9472875302734,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19905613964843383,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 226817,
            "time": 94.14974905664059,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 227328,
            "time": 94.36168969238277,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 52,
            "name": "E3",
            "ticks": 227328,
            "time": 94.36168969238277,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 227871,
            "time": 94.58269228320309,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 55,
            "name": "G3",
            "ticks": 227871,
            "time": 94.58269228320309,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 228374,
            "time": 94.78741475683589,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 228374,
            "time": 94.78741475683589,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4103413115234389,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 228887,
            "time": 94.99620725976558,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19558752441406568,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 228887,
            "time": 94.99620725976558,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18966739648436715,
            "durationTicks": 461,
            "midi": 59,
            "name": "B3",
            "ticks": 229397,
            "time": 95.20449975878903,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19905613964843383,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 229889,
            "time": 95.40696128515621,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19905613964843383,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 229889,
            "time": 95.40696128515621,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 230400,
            "time": 95.6189019208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 61,
            "name": "C#4",
            "ticks": 230400,
            "time": 95.6189019208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 230943,
            "time": 95.83990451171871,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 61,
            "name": "C#4",
            "ticks": 231446,
            "time": 96.04462698535151,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 231959,
            "time": 96.25341948828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 55,
            "name": "G3",
            "ticks": 231959,
            "time": 96.25341948828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 232469,
            "time": 96.46099098242183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 61,
            "name": "C#4",
            "ticks": 232961,
            "time": 96.66123642382809,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637500000497,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 233344,
            "time": 96.8171185458984,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.17541826269530247,
            "durationTicks": 431,
            "midi": 74,
            "name": "D5",
            "ticks": 233472,
            "time": 96.8692149208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838549999999145,
            "durationTicks": 512,
            "midi": 50,
            "name": "D3",
            "ticks": 233472,
            "time": 96.8692149208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 54,
            "name": "F#3",
            "ticks": 234015,
            "time": 97.0902175117187,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 234518,
            "time": 97.29493998535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 57,
            "name": "A3",
            "ticks": 234518,
            "time": 97.29493998535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332032388,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 235031,
            "time": 97.5037324882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332032388,
            "durationTicks": 479,
            "midi": 62,
            "name": "D4",
            "ticks": 235031,
            "time": 97.5037324882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058592486,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 235541,
            "time": 97.71130398242184,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058592486,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 235541,
            "time": 97.71130398242184,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 236033,
            "time": 97.91154942382808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 54,
            "name": "F#3",
            "ticks": 236033,
            "time": 97.91154942382808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 76,
            "name": "E5",
            "ticks": 236544,
            "time": 98.11952792089839,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 55,
            "name": "G3",
            "ticks": 236544,
            "time": 98.11952792089839,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 57,
            "name": "A3",
            "ticks": 237087,
            "time": 98.34053051171871,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 73,
            "name": "C#5",
            "ticks": 237590,
            "time": 98.54525298535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 59,
            "name": "B3",
            "ticks": 237590,
            "time": 98.54525298535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 238103,
            "time": 98.7540454882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 61,
            "name": "C#4",
            "ticks": 238103,
            "time": 98.7540454882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 57,
            "name": "A3",
            "ticks": 238613,
            "time": 98.96161698242183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 55,
            "name": "G3",
            "ticks": 239105,
            "time": 99.16186242382808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838549999999145,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 239616,
            "time": 99.3698409208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 2.5002189970703057,
            "durationTicks": 6143,
            "midi": 41,
            "name": "F2",
            "ticks": 239616,
            "time": 99.3698409208984,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 240159,
            "time": 99.5908435117187,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 240662,
            "time": 99.79556598535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4074099326171847,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 241175,
            "time": 100.00435848828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 73,
            "name": "C#5",
            "ticks": 242177,
            "time": 100.41217542382807,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 74,
            "name": "D5",
            "ticks": 242688,
            "time": 100.62015392089839,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637500000497,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 245632,
            "time": 101.81837054589839,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 74,
            "name": "D5",
            "ticks": 245760,
            "time": 101.8704669208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 42,
            "name": "F#2",
            "ticks": 245760,
            "time": 101.8704669208984,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 246806,
            "time": 102.29619198535151,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 247319,
            "time": 102.50498448828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 247829,
            "time": 102.71255598242183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 248321,
            "time": 102.91280142382809,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 248832,
            "time": 103.1207799208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 250391,
            "time": 103.7552974882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.20838550000000566,
            "durationTicks": 512,
            "midi": 79,
            "name": "G5",
            "ticks": 251904,
            "time": 104.37109292089839,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 2.50021899707032,
            "durationTicks": 6143,
            "midi": 41,
            "name": "F2",
            "ticks": 251904,
            "time": 104.37109292089839,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 0.19210538281249967,
            "durationTicks": 472,
            "midi": 78,
            "name": "F#5",
            "ticks": 252447,
            "time": 104.59209551171871,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19617541210936906,
            "durationTicks": 482,
            "midi": 79,
            "name": "G5",
            "ticks": 252950,
            "time": 104.79681798535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4074099326171847,
            "durationTicks": 1001,
            "midi": 78,
            "name": "F#5",
            "ticks": 253463,
            "time": 105.0056104882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05779441601562496,
            "durationTicks": 142,
            "midi": 74,
            "name": "D5",
            "ticks": 254465,
            "time": 105.41342742382808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637500000497,
            "durationTicks": 128,
            "midi": 74,
            "name": "D5",
            "ticks": 254848,
            "time": 105.56930954589839,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 76,
            "name": "E5",
            "ticks": 254976,
            "time": 105.6214059208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.19617541210938327,
            "durationTicks": 482,
            "midi": 73,
            "name": "C#5",
            "ticks": 256022,
            "time": 106.04713098535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 256535,
            "time": 106.25592348828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.05209637499999076,
            "durationTicks": 128,
            "midi": 73,
            "name": "C#5",
            "ticks": 257920,
            "time": 106.8196225458984,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.4253180615234413,
            "durationTicks": 1045,
            "midi": 74,
            "name": "D5",
            "ticks": 258048,
            "time": 106.87171892089839,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 1.2499059970703144,
            "durationTicks": 3071,
            "midi": 42,
            "name": "F#2",
            "ticks": 258048,
            "time": 106.87171892089839,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 0.20838549999999145,
            "durationTicks": 512,
            "midi": 74,
            "name": "D5",
            "ticks": 259094,
            "time": 107.29744398535152,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19495440332030967,
            "durationTicks": 479,
            "midi": 74,
            "name": "D5",
            "ticks": 259607,
            "time": 107.5062364882812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.18762835058593907,
            "durationTicks": 461,
            "midi": 73,
            "name": "C#5",
            "ticks": 260117,
            "time": 107.71380798242183,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.19536140625000087,
            "durationTicks": 480,
            "midi": 74,
            "name": "D5",
            "ticks": 260609,
            "time": 107.91405342382808,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.634110564453124,
            "durationTicks": 1558,
            "midi": 76,
            "name": "E5",
            "ticks": 261120,
            "time": 108.1220319208984,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.6153884296874992,
            "durationTicks": 1512,
            "midi": 69,
            "name": "A4",
            "ticks": 262679,
            "time": 108.75654948828121,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.08608132617187891,
            "durationTicks": 141,
            "midi": 73,
            "name": "C#5",
            "ticks": 264192,
            "time": 109.3723449208984,
            "velocity": 0.7322834645669292
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 46,
            "name": "A#2",
            "ticks": 264196,
            "time": 109.3747869443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 53,
            "name": "F3",
            "ticks": 264196,
            "time": 109.3747869443359,
            "velocity": 0.7401574803149606
          },
          {
            "duration": 0.08608132617187891,
            "durationTicks": 141,
            "midi": 75,
            "name": "D#5",
            "ticks": 264318,
            "time": 109.44926865917965,
            "velocity": 0.6929133858267716
          },
          {
            "duration": 2.346784523437492,
            "durationTicks": 3844,
            "midi": 73,
            "name": "C#5",
            "ticks": 264444,
            "time": 109.5261923974609,
            "velocity": 0.6535433070866141
          },
          {
            "duration": 1.2600840937499953,
            "durationTicks": 2064,
            "midi": 72,
            "name": "C5",
            "ticks": 268292,
            "time": 111.8754189443359,
            "velocity": 0.7322834645669292
          },
          {
            "duration": 2.4975794707031156,
            "durationTicks": 4091,
            "midi": 45,
            "name": "A2",
            "ticks": 268292,
            "time": 111.8754189443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 2.4975794707031156,
            "durationTicks": 4091,
            "midi": 52,
            "name": "E3",
            "ticks": 268292,
            "time": 111.8754189443359,
            "velocity": 0.7401574803149606
          },
          {
            "duration": 0.6190529414062524,
            "durationTicks": 1014,
            "midi": 68,
            "name": "G#4",
            "ticks": 270357,
            "time": 113.13611354394527,
            "velocity": 0.7165354330708661
          },
          {
            "duration": 0.08669183203126352,
            "durationTicks": 142,
            "midi": 71,
            "name": "B4",
            "ticks": 271360,
            "time": 113.74845092089839,
            "velocity": 0.7007874015748031
          },
          {
            "duration": 0.0866918320312493,
            "durationTicks": 142,
            "midi": 73,
            "name": "C#5",
            "ticks": 271487,
            "time": 113.82598516503903,
            "velocity": 0.6929133858267716
          },
          {
            "duration": 0.47008951171875424,
            "durationTicks": 770,
            "midi": 71,
            "name": "B4",
            "ticks": 271614,
            "time": 113.90351940917965,
            "velocity": 0.6535433070866141
          },
          {
            "duration": 4.998211470703126,
            "durationTicks": 8187,
            "midi": 70,
            "name": "A#4",
            "ticks": 272388,
            "time": 114.3760509443359,
            "velocity": 0.6929133858267716
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 49,
            "name": "C#3",
            "ticks": 272388,
            "time": 114.3760509443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 52,
            "name": "E3",
            "ticks": 272388,
            "time": 114.3760509443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 4.998211470703126,
            "durationTicks": 8187,
            "midi": 58,
            "name": "A#3",
            "ticks": 272388,
            "time": 114.3760509443359,
            "velocity": 0.7401574803149606
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 48,
            "name": "C3",
            "ticks": 276484,
            "time": 116.8766829443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 2.49757947070313,
            "durationTicks": 4091,
            "midi": 52,
            "name": "E3",
            "ticks": 276484,
            "time": 116.8766829443359,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 0.08608132617187891,
            "durationTicks": 141,
            "midi": 66,
            "name": "F#4",
            "ticks": 280576,
            "time": 119.3748729208984,
            "velocity": 0.7322834645669292
          },
          {
            "duration": 1.2600840937500095,
            "durationTicks": 2064,
            "midi": 45,
            "name": "A2",
            "ticks": 280580,
            "time": 119.3773149443359,
            "velocity": 0.6692913385826772
          },
          {
            "duration": 1.2600840937500095,
            "durationTicks": 2064,
            "midi": 48,
            "name": "C3",
            "ticks": 280580,
            "time": 119.3773149443359,
            "velocity": 0.7795275590551181
          },
          {
            "duration": 0.08608132617187891,
            "durationTicks": 141,
            "midi": 68,
            "name": "G#4",
            "ticks": 280702,
            "time": 119.45179665917965,
            "velocity": 0.6929133858267716
          },
          {
            "duration": 1.096468523437494,
            "durationTicks": 1796,
            "midi": 66,
            "name": "F#4",
            "ticks": 280828,
            "time": 119.5287203974609,
            "velocity": 0.6535433070866141
          },
          {
            "duration": 0.6190529414062524,
            "durationTicks": 1014,
            "midi": 65,
            "name": "F4",
            "ticks": 282645,
            "time": 120.63800954394527,
            "velocity": 0.7165354330708661
          },
          {
            "duration": 0.6190529414062524,
            "durationTicks": 1014,
            "midi": 44,
            "name": "G#2",
            "ticks": 282645,
            "time": 120.63800954394527,
            "velocity": 0.6535433070866141
          },
          {
            "duration": 0.6190529414062524,
            "durationTicks": 1014,
            "midi": 47,
            "name": "B2",
            "ticks": 282645,
            "time": 120.63800954394527,
            "velocity": 0.7637795275590551
          },
          {
            "duration": 0.08547082031250852,
            "durationTicks": 140,
            "midi": 68,
            "name": "G#4",
            "ticks": 283648,
            "time": 121.2503469208984,
            "velocity": 0.7007874015748031
          },
          {
            "duration": 0.6172214238281271,
            "durationTicks": 1011,
            "midi": 47,
            "name": "B2",
            "ticks": 283660,
            "time": 121.2576729912109,
            "velocity": 0.6377952755905512
          },
          {
            "duration": 0.6172214238281271,
            "durationTicks": 1011,
            "midi": 50,
            "name": "D3",
            "ticks": 283660,
            "time": 121.2576729912109,
            "velocity": 0.7480314960629921
          },
          {
            "duration": 0.08547082031249431,
            "durationTicks": 140,
            "midi": 70,
            "name": "A#4",
            "ticks": 283773,
            "time": 121.32666015332028,
            "velocity": 0.6929133858267716
          },
          {
            "duration": 0.47253153515625,
            "durationTicks": 774,
            "midi": 68,
            "name": "G#4",
            "ticks": 283898,
            "time": 121.40297338574214,
            "velocity": 0.6535433070866141
          },
          {
            "duration": 1.2600840937499953,
            "durationTicks": 2064,
            "midi": 69,
            "name": "A4",
            "ticks": 284676,
            "time": 121.8779469443359,
            "velocity": 0.7322834645669292
          },
          {
            "duration": 1.2600840937499953,
            "durationTicks": 2064,
            "midi": 41,
            "name": "F2",
            "ticks": 284676,
            "time": 121.8779469443359,
            "velocity": 0.6692913385826772
          },
          {
            "duration": 1.2600840937499953,
            "durationTicks": 2064,
            "midi": 51,
            "name": "D#3",
            "ticks": 284676,
            "time": 121.8779469443359,
            "velocity": 0.7795275590551181
          },
          {
            "duration": 0.6517564472656403,
            "durationTicks": 1014,
            "midi": 68,
            "name": "G#4",
            "ticks": 286741,
            "time": 123.13864154394527,
            "velocity": 0.7165354330708661
          },
          {
            "duration": 0.6517564472656403,
            "durationTicks": 1014,
            "midi": 40,
            "name": "E2",
            "ticks": 286741,
            "time": 123.13864154394527,
            "velocity": 0.6456692913385826
          },
          {
            "duration": 0.6517564472656403,
            "durationTicks": 1014,
            "midi": 50,
            "name": "D3",
            "ticks": 286741,
            "time": 123.13864154394527,
            "velocity": 0.7637795275590551
          },
          {
            "duration": 0.7476435205078076,
            "durationTicks": 1011,
            "midi": 64,
            "name": "E4",
            "ticks": 287756,
            "time": 123.79108339257809,
            "velocity": 0.6377952755905512
          },
          {
            "duration": 0.7476435205078076,
            "durationTicks": 1011,
            "midi": 72,
            "name": "C5",
            "ticks": 287756,
            "time": 123.79108339257809,
            "velocity": 0.7480314960629921
          },
          {
            "duration": 0.7476435205078076,
            "durationTicks": 1011,
            "midi": 42,
            "name": "F#2",
            "ticks": 287756,
            "time": 123.79108339257809,
            "velocity": 0.6377952755905512
          },
          {
            "duration": 0.7476435205078076,
            "durationTicks": 1011,
            "midi": 54,
            "name": "F#3",
            "ticks": 287756,
            "time": 123.79108339257809,
            "velocity": 0.7480314960629921
          },
          {
            "duration": 2.88437860546874,
            "durationTicks": 3692,
            "midi": 67,
            "name": "G4",
            "ticks": 288772,
            "time": 124.54263316796872,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 2.88437860546874,
            "durationTicks": 3692,
            "midi": 73,
            "name": "C#5",
            "ticks": 288772,
            "time": 124.54263316796872,
            "velocity": 0.7401574803149606
          },
          {
            "duration": 3.1960977451171857,
            "durationTicks": 4091,
            "midi": 38,
            "name": "D2",
            "ticks": 288772,
            "time": 124.54263316796872,
            "velocity": 0.6220472440944882
          },
          {
            "duration": 3.1960977451171857,
            "durationTicks": 4091,
            "midi": 44,
            "name": "G#2",
            "ticks": 288772,
            "time": 124.54263316796872,
            "velocity": 0.6299212598425197
          },
          {
            "duration": 3.1960977451171857,
            "durationTicks": 4091,
            "midi": 50,
            "name": "D3",
            "ticks": 288772,
            "time": 124.54263316796872,
            "velocity": 0.7401574803149606
          }
        ],
        "endOfTrackTicks": 292863
      }
    ]
  };