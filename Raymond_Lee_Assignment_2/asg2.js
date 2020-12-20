// Modified from ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`


// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;



//  UI Elements
//------------------------------------
//  set default color to cyan
let g_selectedColor = [0.0, 1.0, 1.0, 1.0];

let g_penguinColor = [0.0,0.0,0.0,1.0];

//set default global angle to 0;
let g_animation = true;

let g_globalAngle = 45;
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;

let g_lowerLeftArmAngle = 0;
let g_lowerRightArmAngle = 0;

let g_leftTipAngle = 0;
let g_rightTipAngle = 0;

let g_tailAngle = 0;
let g_feetAngle = 0;
let g_beakAngle = 0;
let g_bob = 0;

let g_eyeScale = 0;

function setupWebGL(){
   // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

   // Get the rendering context for WebGL
   // gl = getWebGLContext(canvas);
   gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
   if (!gl) {
     console.log('Failed to get the rendering context for WebGL');
     return;
   }

   gl.enable(gl.DEPTH_TEST);
 
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix){
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    //Get storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
      console.log('Failed to get the storage locatin of u_GlobalRotateMatrix');
      return;
    }
  
    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}



function elementUI (){
  
  //buttons for canvas
  document.getElementById('changeBackground').onclick = function(){ // changes canvas color to specified colors from sliders
                                                          gl.clearColor(g_selectedColor[0],g_selectedColor[1],g_selectedColor[2],g_selectedColor[3]); 
                                                          console.log(g_selectedColor);
                                                          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                                                          renderScene();
                                                        } 

   
  //sliders for canvas
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;} );
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;} );
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;} );

  //buttons for animation
  document.getElementById('animationOn').onclick = function(){ g_animation=true;}
  document.getElementById('animationOff').onclick = function(){ g_animation=false;}

  //sliders for penguin color
  document.getElementById('redBodySlide').addEventListener('mouseup', function() { g_penguinColor[0] = this.value/100;} );
  document.getElementById('greenBodySlide').addEventListener('mouseup', function() { g_penguinColor[1] = this.value/100;} );
  document.getElementById('blueBodySlide').addEventListener('mouseup', function() { g_penguinColor[2] = this.value/100;} );

  //slider for size
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();} );
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderScene();} );
  document.getElementById('leftArmSlide').addEventListener('mousemove', function() { g_leftArmAngle = this.value; renderScene();} );
  document.getElementById('rightArmSlide').addEventListener('mousemove', function() { g_rightArmAngle = this.value; renderScene();} );
  document.getElementById('lowerLeftArmSlide').addEventListener('mousemove', function() { g_lowerLeftArmAngle = this.value; renderScene();} );
  document.getElementById('lowerRightArmSlide').addEventListener('mousemove', function() { g_lowerRightArmAngle = this.value; renderScene();} );
  document.getElementById('leftTipSlide').addEventListener('mousemove', function() { g_leftTipAngle = this.value; renderScene();} );
  document.getElementById('rightTipSlide').addEventListener('mousemove', function() { g_rightTipAngle = this.value; renderScene();} );
  document.getElementById('feetSlide').addEventListener('mousemove', function() { g_feetAngle = this.value; renderScene();} );
  document.getElementById('beakSlide').addEventListener('mousemove', function() { g_beakAngle = this.value; renderScene();} );
  document.getElementById('eyeSlide').addEventListener('mousemove', function() { g_eyeScale = 0.02 + 0.08(this.value/1000); renderScene();} );
}

function main() {
 
  setupWebGL(); // setting up GL variables
  connectVariablesToGLSL(); // connecting GLSL shaders to variables
  elementUI(); // setting up HTML elements

  // default background is cyan
  gl.clearColor(0.0, 1.0, 1.0, 1.0);

  // render the scene
 // renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){

  //print time
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);

  updateAnimationAngles();
  //draw scene
  renderScene();

  //update frame
  requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if(g_animation){
    g_leftArmAngle = 40 - 40*Math.abs(Math.sin(g_seconds*4));
    g_rightArmAngle = 40-40*Math.abs(Math.sin(g_seconds*4));
    g_tailAngle = 30*Math.abs(Math.sin(g_seconds*4));
    g_beakAngle = 30*Math.abs(Math.sin(g_seconds*4));
    g_feetAngle = 30*Math.sin(g_seconds*4);
    g_bob = 0.1 * Math.sin(g_seconds*4);
    g_eyeScale = 0.02 + 0.08*Math.abs(Math.sin(g_seconds*2));
  }
}



function renderScene(){

  var startTime = performance.now();
  //pass slider value to rotate canvas
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //drawing body of penguin
  var head = new Cube();
  head.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  head.matrix.translate(0, 0.4 + g_bob, 0);
  head.matrix.scale(0.45,0.45,0.45);
  head.render();

 


  var leftEye = new Cube();
  leftEye.color = [1,1,1,1];
  leftEye.matrix.translate(-0.1, 0.5 + g_bob, -.2);
  leftEye.matrix.scale(0.05, g_eyeScale, 0.1);
  leftEye.render();

  var leftPupil = new Cube();
  leftPupil.color = [0,0,0,1];
  leftPupil.matrix.translate(-0.1, 0.5 + g_bob, -.21);
  leftPupil.matrix.scale(0.03, 0.03, 0.12);
  leftPupil.render();

  var rightEye = new Cube();
  rightEye.color = [1,1,1,1];
  rightEye.matrix.translate(0.1, 0.5 + g_bob, -.2);
  rightEye.matrix.scale(0.05, g_eyeScale, 0.1);
  rightEye.render();

  var rightPupil = new Cube();
  rightPupil.color = [0,0,0,1];
  rightPupil.matrix.translate(0.1, 0.5 + g_bob, -.21);
  rightPupil.matrix.scale(0.03, 0.03, 0.12);
  rightPupil.render();

  var upperBeak = new Cube();
  upperBeak.color = [1, 0.7, 0.05, 1];
  upperBeak.matrix.translate(0, 0.38 + g_bob, -0.2);
  upperBeak.matrix.scale(0.15, 0.03, 0.3);
  upperBeak.render();

  var lowerBeak = new Cube();
  lowerBeak.color = [1, 0.7, 0.05, 1];
  lowerBeak.matrix.translate(0, 0.37 + g_bob, -0.2);
  lowerBeak.matrix.rotate(-(g_beakAngle),1,0,0);
  lowerBeak.matrix.scale(0.1, 0.02, 0.25);
  lowerBeak.render();


  var body = new Cube(); // black body
  body.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];;
  body.matrix.translate(0, g_bob, 0);
  body.matrix.scale(0.5, 0.6, 0.5);
  body.render();

  var bodyFluff = new Cube();
  bodyFluff.color = [1,1,1,1];
  bodyFluff.matrix.translate(0, g_bob, -.23);
  bodyFluff.matrix.scale(0.4, 0.5, 0.1);
  bodyFluff.render();

  var leftFoot = new Cube();
  leftFoot.color = [1, 0.7, 0.05, 1];
  leftFoot.matrix.translate(-.2, -.3 + g_bob, -.25);
  leftFoot.matrix.rotate(g_feetAngle,1,0,0);
  leftFoot.matrix.scale(0.25, 0.1, 0.35);
  leftFoot.render();

  var rightFoot = new Cube();
  rightFoot.color = [1, 0.7, 0.05, 1];
  rightFoot.matrix.translate(.2, -.3 + g_bob, -.25);
  rightFoot.matrix.rotate(-g_feetAngle,1,0,0);
  rightFoot.matrix.scale(0.25, 0.1, 0.35);
  rightFoot.render();

  var tail =  new Cube();
  tail.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];;
  tail.matrix.translate(0,-.18 + g_bob,0.25);
  tail.matrix.rotate(30 - g_tailAngle, 1, 0, 0);
  tail.matrix.scale(0.2,0.1,0.3);
  tail.render();


  // wings
  var leftUpperWing = new Cube();
  leftUpperWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftUpperWing.matrix.translate(-.3, .1 + g_bob, 0);
 
    leftUpperWing.matrix.rotate(40 - g_leftArmAngle, 0, 0, 1);
  
  var leftLowerWingCoordinates = new Matrix4(leftUpperWing.matrix);
  leftUpperWing.matrix.scale(0.3, 0.13, 0.4);
  leftUpperWing.render();

  var rightUpperWing = new Cube();
  rightUpperWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightUpperWing.matrix.translate(.3, .1 + g_bob, 0);
  rightUpperWing.matrix.rotate(-(40 - g_rightArmAngle), 0, 0, 1);
  var rightLowerWingCoordinates = new Matrix4(rightUpperWing.matrix);
  rightUpperWing.matrix.scale(0.3, 0.13, 0.4);
  rightUpperWing.render();

  var leftLowerWing = new Cube();
  leftLowerWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftLowerWing.matrix = leftLowerWingCoordinates;
  leftLowerWing.matrix.translate(-.2,0,0);
  leftLowerWing.matrix.rotate(-g_lowerLeftArmAngle, 0, 0, 1);
  var leftWingTipCoordinates = new Matrix4(leftLowerWing.matrix);
  leftLowerWing.matrix.scale(0.15, 0.11, 0.35);
  leftLowerWing.render();

  var rightLowerWing = new Cube();
  rightLowerWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightLowerWing.matrix = rightLowerWingCoordinates;
  rightLowerWing.matrix.translate(.2, 0, 0);
  rightLowerWing.matrix.rotate(g_lowerRightArmAngle, 0, 0, 1);
  var rightWingTipCoordinates = new Matrix4(rightLowerWing.matrix);
  rightLowerWing.matrix.scale(0.15, 0.11, 0.35);
  rightLowerWing.render();

  var leftWingTip = new Cube();
  leftWingTip.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftWingTip.matrix = leftWingTipCoordinates;
  leftWingTip.matrix.translate(-.08, 0, 0);
  leftWingTip.matrix.rotate(-g_leftTipAngle,0,0,1);
  leftWingTip.matrix.scale(0.05,0.08, 0.3);
  leftWingTip.render();

  var rightWingTip = new Cube();
  rightWingTip.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightWingTip.matrix = rightWingTipCoordinates;
  rightWingTip.matrix.translate(.08,0,0);
  rightWingTip.matrix.rotate(g_rightTipAngle, 0,0,1);
  rightWingTip.matrix.scale(0.05, 0.08, 0.3);
  rightWingTip.render();

  
}
