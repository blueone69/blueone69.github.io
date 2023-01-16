let angle1 = 0;
let angle2 = 90;
let angle3 = 120;
let angle4 = 120;
let WW = windowWidth/2;
let WH = windowHeight/2;


function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(0,0,0);
let T = 100;
var sW = 5;
  // Center point
  fill(0);
  strokeWeight(sW);
  ellipse(width/2, height/2, 100, 100);

  // Half circle 1
  noFill();
  strokeWeight(sW);
  strokeCap(ROUND);
  stroke(255, 255, 255);
  push();
  translate(200, 200);
  rotate(radians(angle1 % 360));
  arc(0, 0, width/2-50+T, height/2-50+T, 0, radians(186), OPEN);
  pop();

  // Half circle 2
  noFill();
  strokeWeight(sW);
  strokeCap(ROUND);
  stroke(255, 255, 255);
  push();
  translate(200, 200);
  rotate(radians(-angle2 % 360 +390));
  arc(0, 0, width/2-0+T, height/2-0+T, 0, radians(180), OPEN);
  pop();

  // Half circle 3
  noFill();
  strokeWeight(sW);
  strokeCap(ROUND);
  stroke(255, 255, 255);
  push();
  translate(200, 200);
  rotate(radians(angle3 % 360));
  arc(0, 0, width/2+50+T, height/2+50+T, 0, radians(160),OPEN);
  pop();
  
    // Half circle point
  //fill(255, 255, 255);
  //strokeWeight(1);
  //stroke(255, 255, 255);
  //push();
  //translate(200, 200);
  //rotate(radians(angle4 % 360));
  //ellipse (25, 0, 5, 5, radians(120),OPEN);
  //pop();

  angle1 += 10;
  angle2 += 10;
  angle3 += 10;
  angle4 += 3;
}
