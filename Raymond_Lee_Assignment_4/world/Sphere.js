class Sphere{
    constructor(){
      this.type = 'sphere';
    //this.position = [-0.5, -0.5, -0.5];
      this.color = [1, 1, 1, 1];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.vertices32 = new Float32Array([]);
    }
    

    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_textureNum, this.textureNum);
       
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI/10;
        var dd = Math.PI/10;

        for(var theta = 0; theta<Math.PI; theta += d){
            for(var r = 0; r < 2*Math.PI; r += d){
                var p1 = [Math.sin(theta) * Math.cos(r), Math.sin(theta)*Math.sin(r), Math.cos(theta)];

                var p2 = [Math.sin(theta+dd) * Math.cos(r), Math.sin(theta+dd)*Math.sin(r), Math.cos(theta+dd)];
                var p3 = [Math.sin(theta) * Math.cos(r+dd), Math.sin(theta)*Math.sin(r+dd), Math.cos(theta)];
                var p4 = [Math.sin(theta+dd) * Math.cos(r+dd), Math.sin(theta+dd)*Math.sin(r+dd), Math.cos(theta+dd)];

                var uv1 = [theta/Math.PI, r/(2*Math.PI)];
                var uv2 = [(theta+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [theta/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(theta+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var uv = [];

                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p2); uv = uv.concat(uv2);
                v = v.concat(p4); uv = uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p4); uv = uv.concat(uv4);
                v = v.concat(p3); uv = uv.concat(uv3);
                gl.uniform4f(u_FragColor, 1,1,1,1);
                drawTriangle3DUVNormal(v,uv,v);

            }
        }
    }
}