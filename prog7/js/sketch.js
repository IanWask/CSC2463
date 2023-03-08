let initTone = true;
let pitch = 900;
let img;

// Set up Tone
let osc = new Tone.AMOscillator(pitch, 'sine', 'sine').start()
let gain = new Tone.Gain().toDestination();
let pan = new Tone.Panner().connect(gain);
let ampEnv = new Tone.AmplitudeEnvelope({
  attack: 0,
  decay: 0.652,
  sustain: 0,
  release: 0.651
}).connect(pan);
osc.connect(ampEnv);


let noiseEnv = new Tone.AmplitudeEnvelope({
  attack: 0.05,
  decay: 5,
  sustain: 0.05,
  release: 0.3
}).connect(gain);

let noiseFilter = new Tone.Filter(375, "lowpass").connect(noiseEnv);
ampEnv.connect(noiseFilter);




 




function setup() {
  createCanvas(400, 400);
  //image(img,0,0,width,height);
  img = loadImage('assets/mariocoin.png');
}


function draw() {
  background(220);
  
  text('press spacebar to initialize audio and mouse to play',60,100);
  if(mouseIsPressed === true){
    image(img,0,0,width,height);
  }
}

function keyPressed(){
  if(key === ' ' && initTone === true){
    Tone.start();
    console.log("pressed");
    initTone = false;
  }
}

function mousePressed() {
  console.log('pressed');
  
  ampEnv.triggerAttackRelease(6);
  osc.frequency.setValueAtTime(pitch+200,"+0.1");
  ampEnv.triggerAttackRelease(0.5, "+0.25");
  osc.frequency.setValueAtTime(pitch+300,"+0.1");
  ampEnv.triggerAttackRelease(0.5, "+0.1");
  osc.frequency.setValueAtTime(pitch-500,"+0.5");
  

  if(mouseY > 200){
    //noiseEnv.triggerAttackRelease();
  }
}