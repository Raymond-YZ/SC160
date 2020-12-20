// DrawRectangle.js


function main() {
// Retrieve <canvas> element <- (1)
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}

// Get the rendering context for 2DCG <- (2)
	var ctx = canvas.getContext('2d');
// Step 2: hard coded vector
	let v1 = new Vector3([2.25,2.25,0]);
// Draw a black background
	ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
	ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
	drawVector(v1, "red");

	const drawBtn = document.querySelector('input[id="drawButton"]');
	drawBtn.addEventListener('click', handleDrawEvent);

	const drawBtn2 = document.querySelector('input[id="drawButton2"]');
	drawBtn2.addEventListener('click', handleDrawOperationEvent);
} 

function drawVector(v, color){
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(200,200);
	ctx.lineTo(200+20*v.elements[0], 200-20*v.elements[1]);
	ctx.strokeStyle = color;
	ctx.stroke();
}

function handleDrawEvent(){
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
	ctx.fillRect(0, 0, 400, 400); // refilling black rectangle to clear canvas

	var v1x = document.querySelector('input[name = "xCoor"]');
	var v1y = document.querySelector('input[name = "yCoor"]');
	let v1 = new Vector3([v1x.value, v1y.value, 0]);

	var v2x = document.querySelector('input[name = "xCoor2"]');
	var v2y = document.querySelector('input[name = "yCoor2"]');
	let v2 = new Vector3([v2x.value, v2y.value, 0]);


	drawVector(v1, "red");
	drawVector(v2, "blue");
}

function handleDrawOperationEvent(){
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
	ctx.fillRect(0, 0, 400, 400); // refilling black rectangle to clear canvas

	var v1x = document.querySelector('input[name = "xCoor"]');
	var v1y = document.querySelector('input[name = "yCoor"]');
	let v1 = new Vector3([v1x.value, v1y.value, 0]);

	var v2x = document.querySelector('input[name = "xCoor2"]');
	var v2y = document.querySelector('input[name = "yCoor2"]');
	let v2 = new Vector3([v2x.value, v2y.value, 0]);


	drawVector(v1, "red");
	drawVector(v2, "blue");

	var option = document.getElementById("operation").value;
	var scalar = document.querySelector('input[name = "scalar"]').value;
	if(option == 'Add'){
		let v3 = v1.add(v2);
		drawVector(v3, "green");
	}
	else if(option == 'Subtract'){
		let v3 = v1.sub(v2);
		drawVector(v3, "green");
	}
	else if(option == 'Multiply'){
		let v3 = v1.mul(scalar);
		let v4 = v2.mul(scalar);
		drawVector(v3, "green");
		drawVector(v4, "green");
	}
	else if(option == 'Divide'){
		let v3 = v1.div(scalar);
		let v4 = v2.div(scalar);
		drawVector(v3, "green");
		drawVector(v4, "green");
	}
	else if(option == 'Magnitude'){
		console.log('Magnitude v1: ' + v1.magnitude());
		console.log('Magnitude v2: ' + v2.magnitude());
	}
	else if(option == 'Normalize'){
		let v3 = v1.normalize();
		let v4 = v2.normalize();
		drawVector(v3, "green");
		drawVector(v4, "green");
	}
	else if(option == 'Angle between'){
		console.log('Angle: ' + angleBetween(v1, v2) + ' degrees');
	}
	else if(option == 'Area'){
		console.log('Area of the triangle: ' + areaTriangle(v1, v2));
	}
}

//Step 7: angleBetween
function angleBetween(v1, v2){
	var rad = Vector3.dot(v1, v2)/v1.magnitude()/v2.magnitude();

	return Math.acos(rad)* 180 / Math.PI;
}

//Step 8: areaTriangle
function areaTriangle(v1, v2){
	var areaParallelogram = Vector3.cross(v1,v2).magnitude();
	return 0.5 * areaParallelogram;
}