// Modified from ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_textureNum;

 void main() {
    if(u_textureNum == -2){ //use color
      gl_FragColor = u_FragColor;
    }

    else if(u_textureNum == -1){ // use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }

    else if(u_textureNum == 0){   //use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }

    else if(u_textureNum == 1){   //use texture1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }

    else{
      gl_FragColor = vec4(1,.2,.2,1);
    }

   
  }`


// Global variables
let canvas;
let gl;
let camera;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_Sampler0;
let u_Sampler1;
let u_textureNum;


//  UI Elements
//------------------------------------
//  set default color to cyan
let g_selectedColor = [0.0, 1.0, 1.0, 1.0];

let g_penguinColor = [0.0,0.0,0.0,1.0];

//set default global angle to 0;
let g_animation = true;
let g_height = 0;
let g_globalAngle = 0;
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;

let g_lowerLeftArmAngle = 0;
let g_lowerRightArmAngle = 0;

let g_leftTipAngle = 0;
let g_rightTipAngle = 0;

let g_tailAngle = 0;
let g_feetAngle = 0;
let g_beakAngle = 0;
let g_bob = -.2;

let g_eyeScale = 0.04;

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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
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
    //Get storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if(!u_ProjectionMatrix){
        console.log('Failed to get the storage locatin of u_ProjectionMatrix');
        return;
    }
    
    //Get storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
      console.log('Failed to get the storage locatin of u_ViewMatrix');
      return;
    }
     
    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

     // Get the storage location of u_Sampler1
     u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
     if (!u_Sampler1) {
       console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }
 
    
    // Get the storage location of u_textureNum
    u_textureNum = gl.getUniformLocation(gl.program, 'u_textureNum');
    if (!u_textureNum) {
      console.log('Failed to get the storage location of u_textureNum');
    return false;
  }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    camera = new Camera(60, canvas.width/canvas.height, 1, 100);
}



function elementUI (){
  
  
  //buttons for animation
  document.getElementById('animationOn').onclick = function(){ g_animation=true;}
  document.getElementById('animationOff').onclick = function(){ g_animation=false;}

  //sliders for penguin color
  document.getElementById('redBodySlide').addEventListener('mouseup', function() { g_penguinColor[0] = this.value/100;} );
  document.getElementById('greenBodySlide').addEventListener('mouseup', function() { g_penguinColor[1] = this.value/100;} );
  document.getElementById('blueBodySlide').addEventListener('mouseup', function() { g_penguinColor[2] = this.value/100;} );

  //slider for size
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();} );
  document.getElementById('heightSlide').addEventListener('mousemove', function() { g_height = this.value; renderScene();} );
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderScene();} );
  document.getElementById('leftArmSlide').addEventListener('mousemove', function() { g_leftArmAngle = this.value; renderScene();} );
  document.getElementById('rightArmSlide').addEventListener('mousemove', function() { g_rightArmAngle = this.value; renderScene();} );
  document.getElementById('lowerLeftArmSlide').addEventListener('mousemove', function() { g_lowerLeftArmAngle = this.value; renderScene();} );
  document.getElementById('lowerRightArmSlide').addEventListener('mousemove', function() { g_lowerRightArmAngle = this.value; renderScene();} );
  document.getElementById('leftTipSlide').addEventListener('mousemove', function() { g_leftTipAngle = this.value; renderScene();} );
  document.getElementById('rightTipSlide').addEventListener('mousemove', function() { g_rightTipAngle = this.value; renderScene();} );
  document.getElementById('feetSlide').addEventListener('mousemove', function() { g_feetAngle = this.value; renderScene();} );
  document.getElementById('beakSlide').addEventListener('mousemove', function() { g_beakAngle = this.value; renderScene();} );
  
}

// From book
function initTextures(gl, n) {
 

  var ice = new Image();  // Create ice
  if (!ice) {
    console.log('Failed to create ice');
    return false;
  }
    // add more textures here
  var snow = new Image();  // Create snow
  if (!snow) {
    console.log('Failed to create snow');
    return false;
  }

  if(n == 0){
    // Register the event handler to be called on loading an image
    ice.onload = function(){ sendImageToTEXTURE0(ice); };
    // Tell the browser to load an image
    ice.src = 'ice.jpg';
  }
  else if(n == 1){
    // Register the event handler to be called on loading an image
    snow.onload = function(){ sendImageToTEXTURE1(snow); };
    // Tell the browser to load an image
    snow.src = 'snow.jpg';
  }
  return true;
}

function sendImageToTEXTURE0(image) {

  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  
}


function sendImageToTEXTURE1(image) {

  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  
}

function main() {
 
  setupWebGL(); // setting up GL variables
  connectVariablesToGLSL(); // connecting GLSL shaders to variables
  elementUI(); // setting up HTML elements

  document.onkeydown = keydown;

  initTextures(gl,1);

  // default background is cyan
  gl.clearColor(0.0, 1.0, 1.0, 1.0);
  
  // render the scene
  renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){

  //print time
  g_seconds = performance.now()/1000.0 - g_startTime;
 // console.log(g_seconds);

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
    g_eyeScale = 0.02 + 0.08*Math.abs(Math.sin(g_seconds*2));
  }
}



function keydown(ev){
  if(ev.keyCode == 68){ //move camera right
    camera.moveRight();
    
  }
  else if(ev.keyCode == 65){ //move camera left
    camera.moveLeft();
    
  }
  else if(ev.keyCode == 87){ //move camera forward
    camera.moveForward();
   
  }
  else if(ev.keyCode == 83){ //move camera backward
    camera.moveBackwards();
    
  }
  else if(ev.keyCode == 81){ //rotate camera left
    camera.panLeft();
    
  }
  else if(ev.keyCode == 69){ //rotate camera right
    camera.panRight();
  }
  camera.updateView();
 
  renderScene();

}
//add more

//mapping of ice castle
// 0 = no block
// 1 = 1 unit
// 2 = 2 units
// 3 = 3 units
// 4 = 4 units


var g_castle = [
  [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [2, 1, 3, 1, 2, 1, 3, 0, 0, 1, 2],
  [1, 2, 0, 0, 2, 0, 1, 0, 1, 1, 1],
              //<-penguin sits here
  [2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2],
  [1, 1, 3, 0, 0, 0, 3, 0, 1, 1, 1],
  [2, 1, 0, 0, 0, 1, 1, 2, 1, 1, 2],
  [1, 1, 3, 0, 0, 0, 0, 1, 1, 1, 1],
  [2, 1, 2, 0, 0, 0, 0, 0, 0, 1, 2],
];

function drawMap(){

 
  var border = new Cube();
  border.textureNum = 1;
  border.matrix.scale(1,6,32);
  border.matrix.translate(16, 0.2, 0);
  border.render();

  var border1 = new Cube();
  border1.textureNum = 1;
  border1.matrix.scale(1,6,32);
  border1.matrix.translate(-16, 0.2, 0);
  border1.render();

  var border2 = new Cube();
  border2.textureNum = 1;
  border2.matrix.scale(32,6,1);
  border2.matrix.translate(0, 0.2, 16);
  border2.render();

  var border3 = new Cube();
  border3.textureNum = 1;
  border3.matrix.scale(32,6,1);
  border3.matrix.translate(0, 0.2, -16);
  border3.render();

  for(let x = 0; x < 9; x++){
    for (let y = 0; y < 11; y++){
      for(let z = 0; z < g_castle[x][y]; z++){
        var wall = new Cube();
        wall.color = [0, 0.46, 0.75,1];
        wall.textureNum = 0;
        wall.matrix.translate(-y + 4, -.5 + z, -x + 4);
        wall.render();
      }
    }
  }
}

function renderScene(){

  var startTime = performance.now();

 
  //pass projection matrix
   gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

 
  //pass view matrix
  camera.changeHeight(g_height);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

  //pass slider value to rotate canvas
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  

  var toilet = new Cube();
  toilet.color = [1,1,1,1]
  toilet.matrix.translate(0, -0.75, 0.15);
  toilet.matrix.scale(0.45,0.5,0.45);
  toilet.render();

  var poop = new Cube();
  poop.color = [0.82,.41, 0.12, 1];
  poop.matrix.translate(-0.5, -0.95, 0);
  poop.matrix.scale(0.25, 0.05, 0.25);
  poop.render();
  poop = new Cube();
  poop.color = [0.82,.41, 0.12, 1];
  poop.matrix.translate(-0.5, -0.9, 0);
  poop.matrix.scale(0.2, 0.05, 0.2);
  poop.render();
  poop = new Cube();
  poop.color = [0.82,.41, 0.12, 1];
  poop.matrix.translate(-0.5, -0.85, 0);
  poop.matrix.scale(0.15, 0.05, 0.15);
  poop.render();
  poop = new Cube();
  poop.color = [0.82,.41, 0.12, 1];
  poop.matrix.translate(-0.5, -0.8, 0);
  poop.matrix.scale(0.1, 0.05, 0.1);
  poop.render();
 
 
 
  //Drawing ground plane
 
  var ground = new Cube();
  ground.color = [0,1,1,1];
  ground.textureNum = 1;
  ground.matrix.translate(0, -1, 0);
  ground.matrix.scale(32,0,32);
  
  ground.render();

  initTextures(gl,0);
  drawMap();
  var skybox = new Cube();
  skybox.textureNum = -1;
  skybox.matrix.scale(50, 50, 50);
  skybox.matrix.translate(0,25,0);
  
 

  //drawing penguin
  var head = new Cube();
  head.textureNum = -2;
  head.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  head.matrix.translate(0, 0.4 + g_bob, 0);
  head.matrix.scale(0.45,0.45,0.45);
  head.render();


  var leftEye = new Cube();
  leftEye.color = [1,1,1,1];
  leftEye.textureNum = -2;
  leftEye.matrix.translate(-0.1, 0.5 + g_bob, -.2);
  leftEye.matrix.scale(0.05, g_eyeScale, 0.1);
  leftEye.render();

  var leftPupil = new Cube();
  leftPupil.color = [0,0,0,1];
  leftPupil.textureNum = -2;
  leftPupil.matrix.translate(-0.1, 0.5 + g_bob, -.21);
  leftPupil.matrix.scale(0.03, 0.03, 0.12);
  leftPupil.render();

  var rightEye = new Cube();
  rightEye.color = [1,1,1,1];
  rightEye.textureNum = -2;
  rightEye.matrix.translate(0.1, 0.5 + g_bob, -.2);
  rightEye.matrix.scale(0.05, g_eyeScale, 0.1);
  rightEye.render();

  var rightPupil = new Cube();
  rightPupil.color = [0,0,0,1];
  rightPupil.textureNum = -2;
  rightPupil.matrix.translate(0.1, 0.5 + g_bob, -.21);
  rightPupil.matrix.scale(0.03, 0.03, 0.12);
  rightPupil.render();

  var upperBeak = new Cube();
  upperBeak.color = [1, 0.7, 0.05, 1];
  upperBeak.textureNum = -2;
  upperBeak.matrix.translate(0, 0.38 + g_bob, -0.2);
  upperBeak.matrix.scale(0.15, 0.03, 0.3);
  upperBeak.render();

  var lowerBeak = new Cube();
  lowerBeak.color = [1, 0.7, 0.05, 1];
  lowerBeak.textureNum = -2;
  lowerBeak.matrix.translate(0, 0.37 + g_bob, -0.2);
  lowerBeak.matrix.rotate(-(g_beakAngle),1,0,0);
  lowerBeak.matrix.scale(0.1, 0.02, 0.25);
  lowerBeak.render();


  var body = new Cube(); // black body
  body.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  body.textureNum = -2;
  body.matrix.translate(0, g_bob, 0);
  body.matrix.scale(0.5, 0.6, 0.5);
  body.render();

  var bodyFluff = new Cube();
  bodyFluff.color = [1,1,1,1];
  bodyFluff.textureNum = -2;
  bodyFluff.matrix.translate(0, g_bob, -.23);
  bodyFluff.matrix.scale(0.4, 0.5, 0.1);
  bodyFluff.render();

  var leftFoot = new Cube();
  leftFoot.color = [1, 0.7, 0.05, 1];
  leftFoot.textureNum = -2;
  leftFoot.matrix.translate(-.2, -.3 + g_bob, -.25);
  leftFoot.matrix.rotate(g_feetAngle,1,0,0);
  leftFoot.matrix.scale(0.25, 0.1, 0.35);
  leftFoot.render();

  var rightFoot = new Cube();
  rightFoot.color = [1, 0.7, 0.05, 1];
  rightFoot.textureNum = -2;
  rightFoot.matrix.translate(.2, -.3 + g_bob, -.25);
  rightFoot.matrix.rotate(-g_feetAngle,1,0,0);
  rightFoot.matrix.scale(0.25, 0.1, 0.35);
  rightFoot.render();

  var tail =  new Cube();
  tail.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  tail.textureNum = -2;
  tail.matrix.translate(0,-.18 + g_bob,0.25);
  tail.matrix.rotate(30 - g_tailAngle, 1, 0, 0);
  tail.matrix.scale(0.2,0.1,0.3);
  tail.render();


  // wings
  var leftUpperWing = new Cube();
  leftUpperWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftUpperWing.textureNum = -2;
  leftUpperWing.matrix.translate(-.3, .1 + g_bob, 0);
  leftUpperWing.matrix.rotate(40 - g_leftArmAngle, 0, 0, 1);
  var leftLowerWingCoordinates = new Matrix4(leftUpperWing.matrix);
  leftUpperWing.matrix.scale(0.3, 0.13, 0.4);
  leftUpperWing.render();

  var rightUpperWing = new Cube();
  rightUpperWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightUpperWing.textureNum = -2;
  rightUpperWing.matrix.translate(.3, .1 + g_bob, 0);
  rightUpperWing.matrix.rotate(-(40 - g_rightArmAngle), 0, 0, 1);
  var rightLowerWingCoordinates = new Matrix4(rightUpperWing.matrix);
  rightUpperWing.matrix.scale(0.3, 0.13, 0.4);
  rightUpperWing.render();

  var leftLowerWing = new Cube();
  leftLowerWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftLowerWing.textureNum = -2;
  leftLowerWing.matrix = leftLowerWingCoordinates;
  leftLowerWing.matrix.translate(-.2,0,0);
  leftLowerWing.matrix.rotate(-g_lowerLeftArmAngle, 0, 0, 1);
  var leftWingTipCoordinates = new Matrix4(leftLowerWing.matrix);
  leftLowerWing.matrix.scale(0.15, 0.11, 0.35);
  leftLowerWing.render();

  var rightLowerWing = new Cube();
  rightLowerWing.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightLowerWing.textureNum = -2;
  rightLowerWing.matrix = rightLowerWingCoordinates;
  rightLowerWing.matrix.translate(.2, 0, 0);
  rightLowerWing.matrix.rotate(g_lowerRightArmAngle, 0, 0, 1);
  var rightWingTipCoordinates = new Matrix4(rightLowerWing.matrix);
  rightLowerWing.matrix.scale(0.15, 0.11, 0.35);
  rightLowerWing.render();

  var leftWingTip = new Cube();
  leftWingTip.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  leftWingTip.textureNum = -2;
  leftWingTip.matrix = leftWingTipCoordinates;
  leftWingTip.matrix.translate(-.08, 0, 0);
  leftWingTip.matrix.rotate(-g_leftTipAngle,0,0,1);
  leftWingTip.matrix.scale(0.05,0.08, 0.3);
  leftWingTip.render();

  var rightWingTip = new Cube();
  rightWingTip.color = [g_penguinColor[0],g_penguinColor[1],g_penguinColor[2],1];
  rightWingTip.textureNum = -2;
  rightWingTip.matrix = rightWingTipCoordinates;
  rightWingTip.matrix.translate(.08,0,0);
  rightWingTip.matrix.rotate(g_rightTipAngle, 0,0,1);
  rightWingTip.matrix.scale(0.05, 0.08, 0.3);
  rightWingTip.render();

  
}
