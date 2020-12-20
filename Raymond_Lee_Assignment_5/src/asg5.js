import * as THREE from '../lib/three.module.js';
import {OrbitControls} from '../lib/OrbitControls.js';
import {OBJLoader2} from '../lib/OBJLoader2.js';
import {MTLLoader} from '../lib/MTLLoader.js';
import {MtlObjBridge} from '../lib/MtlObjBridge.js';

function main(){
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
      });
    const loader = new THREE.TextureLoader();
    
   
    const fov = 100;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-45,17,40);
    camera.rotation.set(-0.3721416425533317, -0.455085695859608, -0.20287958012887253);
  
    function updateCamera(){
        camera.updateProjectionMatrix();
    }

    const controls = new OrbitControls(camera, canvas); 
    controls.target.set(0,0,0);
    
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = 4*Math.PI/10;
    controls.maxDistance = 60;
    controls.minDistance = 10;
    controls.update();
  
    const scene = new THREE.Scene();


    {
       const texture = loader.load('../textures/winterwonderland.jpg', () => {
            const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
            rt.fromEquirectangularTexture(renderer, texture);
            scene.background = rt;
        });
    }


    // FOG
    {
        const color = 0xFFFFFF;
        const density = 0.03;
        scene.fog = new THREE.FogExp2(color, density);
    }
  
    //ground plane
    {   
        const planeSize = 160;
        const texture = loader.load('../textures/ice.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }


  
    //LIGHT SOURCES:
    //ambient light
    {
        const color = 0xFFFFFF;
        const intensity = 0.3;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
    }


    //directional light
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-10, 40, 40);
        light.target.position.set(0, 30, 10);
        scene.add(light);
        scene.add(light.target);
    }

    //point light
    {
        const color = 0xFFFFFF;
        const intensity = 0.2;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(-5, 10, 30);
        scene.add(light);
    }

    const labelBaseScale = 0.01;
    
    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 2;
        const ctx = document.createElement('canvas').getContext('2d');
        const font =  `${size}px bold sans-serif`;
        ctx.font = font;
        // measure how long the name will be
        const textWidth = ctx.measureText(name).width;
    
        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = size + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    
        // need to set font again after resizing canvas
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
    
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);
    
        // scale to fit but don't stretch
        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);
        ctx.fillStyle = 'white';
        ctx.fillText(name, 0, 0);
    
        return ctx.canvas;
      }

    var boxWidth = 1;
    var boxHeight = 1;
    var boxDepth = 1;
    var geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);


    const shadowTexture = loader.load('../textures/roundshadow.png');
    const shadowSize = 1;
    const shadowGeo = new THREE.PlaneBufferGeometry(shadowSize, shadowSize);
    //Snow Scene
    {
    const mtlLoader =  new MTLLoader();
    mtlLoader.load('../resources/Blizzard_1252.mtl', (mtlParseResult) => {
        const objLoader = new OBJLoader2();
        const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
        objLoader.addMaterials(materials);
        objLoader.load('../resources/Blizzard_1252.obj', (root) => {
          scene.add(root);
          const box = new THREE.Box3().setFromObject(root);
          const boxSize = box.getSize(new THREE.Vector3()).length();
          const boxCenter = box.getCenter(new THREE.Vector3());
          // set the camera to frame the box
            frameArea(boxSize * 1.5, boxSize, boxCenter, camera);
        
            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize/3;
            
  
            controls.update();
         
        });
    });     

 
    mtlLoader.load('../resources/penguinMaterials.mtl', (mtlParseResult) => {
            const objLoader = new OBJLoader2();
            const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
            objLoader.addMaterials(materials);
            objLoader.load('../resources/penguinModel.obj', (root) =>{
                root.scale.set(5,5,5);
                root.position.set(10,10,10);
                
                scene.add(root);
                
                const box = new THREE.Box3().setFromObject(root);
                const boxSize = box.getSize(new THREE.Vector3()).length();
                const boxCenter = box.getCenter(new THREE.Vector3());
                // set the camera to frame the box
                frameArea(boxSize * 10, boxSize, boxCenter, camera);
            
                // update the Trackball controls to handle the new size
                controls.maxDistance = boxSize/3;
              
            
            });
        });

        mtlLoader.load('../resources/snowmanMaterials.mtl', (mtlParseResult) => {
            const objLoader = new OBJLoader2();
            const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
            objLoader.addMaterials(materials);
            objLoader.load('../resources/snowmanModel.obj', (root) =>{
               
                const canvas = makeLabelCanvas(200, 32, 'Frosty');
                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                });

                const label = new THREE.Sprite(labelMaterial);
                label.position.set(-20,15,10);
                label.scale.x = canvas.width  * labelBaseScale;
                label.scale.y = canvas.height * labelBaseScale;
                
                root.scale.set(5,5,5);
                root.position.set(-20,11,10);
                root.rotation.set(0,2,0);
              
                scene.add(root);
                scene.add(label);
                
                const box = new THREE.Box3().setFromObject(root);
                const boxSize = box.getSize(new THREE.Vector3()).length();
                const boxCenter = box.getCenter(new THREE.Vector3());
                // set the camera to frame the box
                frameArea(boxSize * 10, boxSize, boxCenter, camera);
            
                // update the Trackball controls to handle the new size
                controls.maxDistance = boxSize/3;
             
            
            });
        });

        mtlLoader.load('../resources/ChristmasTree_425.mtl', (mtlParseResult) => {
            const objLoader = new OBJLoader2();
            const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
            objLoader.addMaterials(materials);
            objLoader.load('../resources/ChristmasTree_425.obj', (root) =>{
                root.position.set(20,13,10);
                root.scale.set(10,10,10);
            
                
                scene.add(root);
                
                const box = new THREE.Box3().setFromObject(root);
                const boxSize = box.getSize(new THREE.Vector3()).length();
                const boxCenter = box.getCenter(new THREE.Vector3());
                // set the camera to frame the box
                frameArea(boxSize * 10, boxSize, boxCenter, camera);
            
                // update the Trackball controls to handle the new size
                controls.maxDistance = boxSize/3;

            
            });
        });

    }
   
    
      

  
    //snowball attributes
   
    const snowballShadowBases = [];
   
    const snowballradius = 0.25;
    const snowballRadialSegments = 12;
    const snowballGeometry = new THREE.SphereBufferGeometry(snowballradius, snowballRadialSegments, snowballRadialSegments);
    const snowballMaterial = new THREE.MeshBasicMaterial({
        map: loader.load('../textures/snow.jpg')
    })   ;
    

    //ADDED shadows to snowballs

    function makeSnowball(x, z){
        const root = new THREE.Object3D();

        const shadowMat =  new THREE.MeshBasicMaterial({
            map:shadowTexture,
            transparent: true,
            depthWrite: false,
        });

        

        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.y = -0.1;
        shadowMesh.position.z = -0.25;
        shadowMesh.rotation.x = Math.PI*-.5;
        const shadowSize = snowballradius * 4;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        root.add(shadowMesh);

        scene.add(root);
        const snowball = new THREE.Mesh(snowballGeometry, snowballMaterial);
        root.add(snowball);

        root.position.set(x, 5.25, z);
        scene.add(root);

        snowballShadowBases.push({root, snowball, shadowMesh, y: snowball.position.y});
        
        return root;
    }

    //randomize snowball placement each time
    for (let z = -20; z <= 20; z += 10) {
        for (let x = -35; x <= 45; x += 20) {
          makeSnowball(x*Math.random()|0, 30*Math.random() + 20|0);
        }
      }
    
    //making the animated snowflakes

    function makeInstance(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial({color});
       
        const cube = new THREE.Mesh(geometry, material);
        
        scene.add(cube);
       
       cube.position.set(x,y,z);
       
        return cube;
    }
    
    const cubes = [
        makeInstance(geometry, 0x00FFFF,  -15, 20, 0),
        makeInstance(geometry, 0x00FFFF, 0, 25, -5),
        makeInstance(geometry, 0x00FFFF,  10, 20, 5),
        makeInstance(geometry, 0x00FFFF,  -20, 25, 5),
        makeInstance(geometry, 0x00FFFF, 25, 25, -5),
        makeInstance(geometry, 0x00FFFF,  15, 20, 5),
        makeInstance(geometry, 0x00FFFF,  -15, 30, 0),
        makeInstance(geometry, 0x00FFFF, 10, 35, -5),
        makeInstance(geometry, 0x00FFFF,  8, 20, -5)
    ];

    
    
    loader.load('../textures/ice.jpg', (texture) => {
        const icemesh = new THREE.MeshBasicMaterial({
          map: texture,
        });

      
        boxWidth = 2;
        boxHeight = 2.5;
        boxDepth = 2.5;
        geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        for(let z = 5; z <= 20; z += 5){
            var leftcube = new THREE.Mesh(geometry, icemesh);
            var rightcube = new THREE.Mesh(geometry, icemesh);
            rightcube.position.set(4,8,z);
            leftcube.position.set(-11,8,z);
            scene.add(leftcube);
            scene.add(rightcube);
        }
      

        
        
      });
    

     function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
       
        // compute a unit vector that points in the direction the camera is now
        // from the center of the box
        const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();
       
        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
       
        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
       
        camera.updateProjectionMatrix();
       
        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = canvas.clientWidth  * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }

    

    function render(time) {
        time *= 0.001;  // convert time to seconds
        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            updateCamera();
        }

      


        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time*speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        })
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
       
    }
    

 
  
    requestAnimationFrame(render);

    
}



main();