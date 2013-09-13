// This is graveyard code... stuff that I don't want to lose but probably won't
// be used at all.

// How to initialize an ortho camera with window dimensions.
// camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, 1, 1000);
// camera.position.z = 500;

// Draw a cube with a lambert material:
// geometry = new THREE.CubeGeometry( 200, 200, 200 );
// material = new THREE.MeshLambertMaterial( { color: 0x333333 } );
// mesh = new THREE.Mesh( geometry, material );


// Particles
//this.geometry = new THREE.Geometry();

/*this.particleMaterial = new THREE.ParticleBasicMaterial({
 color:0x0000FF,
 size:200,
 map:THREE.ImageUtils.loadTexture(
 "laser.png"
 ),
 blending:THREE.AdditiveBlending,
 transparent:true
 });*/

/*for (var i = 0; i < this.LASER_COUNT; i++) {
 this.geometry.vertices.push(new THREE.Vector3(9000, 0, 0));
 }

 this.particleSystem = new THREE.ParticleSystem(this.geometry, this.particleMaterial);

 scene.add(this.particleSystem);*/