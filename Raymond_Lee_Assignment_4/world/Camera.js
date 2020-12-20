class Camera{
    constructor(fov, aspect, near, far){
        this.eye = new Vector3([0,0,-4]);
        this.at = new Vector3([0,0,5]);
        this.up = new Vector3([0,1,0]);
        this.alpha = 20;


        this.viewMatrix = new Matrix4();
        this.updateView();

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(fov, aspect, near, far);
    
    }


    moveForward(){
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(0.25);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
      
    }

    moveBackwards(){
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(0.25);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
      
    }

    moveLeft(){
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(0.25);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);

    }

    moveRight(){
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(0.25);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }


    //MUST FIX
    panLeft(){
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0],this.up.elements[1],this.up.elements[2]);
        console.log(this.rotationMatrix);
        var f_prime = rotationMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }

    panRight(){
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0],this.up.elements[1],this.up.elements[2]);
        console.log(this.rotationMatrix);
        var f_prime = rotationMatrix.multiplyVector3(f);
        this.at = f_prime.add(this.eye);
    }

    changeHeight(height){
        var newPos = new Vector3();
        var newAt = new Vector3();
        newPos.set(this.eye);
        newPos.elements[1] = height;
        newAt.set(this.at);
        newAt.elements[1] = height;
        this.eye = newPos;
        this.at = newAt;
        this.updateView();
    }

    updateView(){
        this.viewMatrix.setLookAt(this.eye.elements[0],this.eye.elements[1],this.eye.elements[2],
                            this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                this.up.elements[0],this.up.elements[1],this.up.elements[2]);
        

    }
}