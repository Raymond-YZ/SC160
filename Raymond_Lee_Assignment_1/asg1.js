// Modified from ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE =2;

//  UI Elements
//------------------------------------
//  set default color to white
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
// set default size to 20
let g_selectedSize = 5;
//set default type to POINT
let g_selectedType = POINT;
//set default number of segements to 10'
let g_selectedSegments = 10;

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
 
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
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
  
    // Get the storage size of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}



function elementUI (){
  
  //buttons for canvas
  document.getElementById('clear').onclick = function(){ g_shapeList = []; renderShapes(); }
  document.getElementById('changeBackground').onclick = function(){ // changes canvas color to specified colors from sliders
                                                          gl.clearColor(g_selectedColor[0],g_selectedColor[1],g_selectedColor[2],g_selectedColor[3]); 
                                                          console.log(g_selectedColor);
                                                          gl.clear(gl.COLOR_BUFFER_BIT);
                                                          renderShapes();
                                                        } 
  //buttons for shapes
  document.getElementById('point').onclick = function(){ g_selectedType = POINT; }
  document.getElementById('triangle').onclick = function(){ g_selectedType = TRIANGLE; }
  document.getElementById('circle').onclick = function(){ g_selectedType = CIRCLE; }
  //sliders for colors
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;} );
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;} );
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;} );

  //slider for size
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;} );
  document.getElementById('segmentSlide').addEventListener('mouseup', function(){ g_selectedSegments = this.value;});
}

function main() {
 
  setupWebGL(); // setting up GL variables
  connectVariablesToGLSL(); // connecting GLSL shaders to variables
  elementUI(); // setting up HTML elements

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if(ev.buttons == 1){ click (ev) }};
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapeList = [];

/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; // The array to store the size of the shape
*/

function click(ev) {
 
  [x,y] = convertCoordinatesToGL(ev);

  //Creating and storing new point
  let point;
  if(g_selectedType == POINT){
    point = new Point();
  }
  else if(g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

/* MODIFIED FROM COLOREDPOINTS

  // Store the coordinates to g_points array
  g_points.push([x, y]);
 
  // store the color to g_colors array
  g_colors.push(g_selectedColor.slice());

  // store size to g_sizes array
  g_sizes.push(g_selectedSize);
*/

 /* if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  } */

  renderShapes();
}

function convertCoordinatesToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderShapes(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
}
