class Cube{
    constructor(){
      this.type = 'cube';
    //this.position = [-0.5, -0.5, -0.5];
      this.color = [1, 1, 1, 1];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    }
    

    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
       
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube
        drawTriangle3D( [-0.5,-0.5,-0.5,  0.5,0.5,-0.5,  0.5,-0.5,-0.5] );
        drawTriangle3D( [-0.5,-0.5,-0.5,  -0.5,0.5,-0.5,  0.5,0.5,-0.5] );

        gl.uniform4f(u_FragColor, 0.9*rgba[0], 0.9*rgba[1], 0.9*rgba[2], 0.9*rgba[3]);
        //top of cube
        drawTriangle3D( [-0.5,0.5,-0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5] );
        drawTriangle3D( [-0.5,0.5,-0.5,  -0.5,0.5,0.5,  0.5,0.5,0.5] );

        gl.uniform4f(u_FragColor, 0.7*rgba[0], 0.7*rgba[1], 0.7*rgba[2], 0.7*rgba[3]);
        //back of cube
        drawTriangle3D( [-0.5,-0.5,0.5,  0.5,0.5,0.5,  0.5,-0.5,0.5] );
        drawTriangle3D( [-0.5,-0.5,0.5,  -0.5,0.5,0.5,  0.5,0.5,0.5] );


        gl.uniform4f(u_FragColor, 0.9*rgba[0], 0.9*rgba[1], 0.9*rgba[2], 0.9*rgba[3]);
        //bottom of cube
        drawTriangle3D( [-0.5,-0.5,-0.5,  0.5,-0.5,0.5,  0.5,-0.5,-0.5] );
        drawTriangle3D( [-0.5,-0.5,-0.5,  -0.5,-0.5,0.5,  0.5,-0.5,0.5] );

        gl.uniform4f(u_FragColor, 0.8*rgba[0], 0.8*rgba[1], 0.8*rgba[2], 0.8*rgba[3]);
        //left side of cube
        drawTriangle3D( [-0.5,-0.5,0.5,  -0.5,0.5,-0.5,  -0.5,-0.5,-0.5] );
        drawTriangle3D( [-0.5,-0.5,0.5,  -0.5,0.5,0.5,  -0.5,0.5,-0.5] );

        gl.uniform4f(u_FragColor, 0.8*rgba[0], 0.8*rgba[1], 0.8*rgba[2], 0.8*rgba[3]);
        //right side of cube
        drawTriangle3D( [0.5,-0.5,-0.5,  0.5,0.5,0.5,  0.5,-0.5,0.5] );
        drawTriangle3D( [0.5,-0.5,-0.5,  0.5,0.5,-0.5,  0.5,0.5,0.5] );


       

       
    }
}