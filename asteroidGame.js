var AsteroidGame = function () {

    this.gameLoop = new gameLoop(this);

    this.spaceship = null;

    this.settings = {
        shipRadius:50,
        asteroidSpawnRate:250,
        gameBox:null,
        laserRateOfFire:360
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.soundManager = new SoundManager();
    this.asteroidManager = new AsteroidManager(this);
    this.asteroidSpawnCount = this.settings.asteroidSpawnRate;
    this.spaceship = new Spaceship(this, 0, 0, new THREE.Vector3(0, 0, 0), this.soundManager);
    this.started = false;
    this.isPaused = false;

    this.gameState = {
        score:0
    };

    console.log("new game initialized");
};

AsteroidGame.prototype = {

    init:function () {

        this.scene = new THREE.Scene();

        this.cameraDistanceToPlane = 2000;

        this.camera = new THREE.PerspectiveCamera(45, 1, .1, 20000); // These will be reset in "handleResize"
        this.camera.position.z = this.cameraDistanceToPlane;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(new THREE.Color(0x222222));

        // to get a plane to match bounds of window/canvas:
        this.spaceship.init(this.scene);

        var pointLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        pointLight.position.set(0, 0, 1).normalize();
        this.scene.add(pointLight);

        this.domElement = this.parentDomElement;

        this.handleResize();

        this.domElement.appendChild(this.renderer.domElement);
    },

    update:function (gameState) {

        this.spaceship.update(gameState, this.scene);

        this.spaceship.doCollisions(this.asteroidManager.getAsteroids(), this.scene);
        this.asteroidManager.update(gameState, this.scene);

        this.asteroidSpawnCount -= gameState.elapsedTime;

        if (this.asteroidSpawnCount < 0) {
            this.asteroidManager.createAsteroid(this.scene);
            this.asteroidSpawnCount = this.settings.asteroidSpawnRate;
        }

        this.renderer.render(this.scene, this.camera);
    },
    asteroidHit:function (asteroid, other) {
        if (other instanceof Laser) {
            this.gameState.score += 100 * (asteroid.type + 1);
            this.dispatchEvent({ type:'scoreUpdated', score:this.gameState.score });
        }

        if (asteroid.type !== AsteroidTypes.SMALL && other instanceof Laser) {
            this.asteroidManager.split(asteroid, this.scene);
        }
        else {
            this.asteroidManager.destroy(asteroid, this.scene);
        }
    },
    pause:function () {
        this.gameLoop.pause();
    },
    resume:function () {
        this.gameLoop.resume();
    },
    start:function () {
        if (this.started) {
            return;
        }

        this.gameLoop.init();
        this.started = true;
    },
    setParentDomElement:function (parentDomElement) {
        this.parentDomElement = parentDomElement;
    },
    togglePauseState:function () {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.gameLoop.pause();
        }
        else {
            this.gameLoop.resume();
        }

        return this.isPaused;
    },
    handleResize:function () {

        var newHeight = $(this.domElement).innerHeight(),
            newWidth = $(this.domElement).innerWidth();

        var halfScreenWidth = newWidth / 2;
        var halfScreenHeight = newHeight / 2;

        // calculate the field of view based on the window size, we are going to aim the camera there.
        var fov = (Math.atan((newHeight / 2) / this.cameraDistanceToPlane) * (180 / Math.PI)) * 2;

        this.camera.fov = fov;
        this.camera.aspect = newWidth / newHeight;
        this.camera.updateProjectionMatrix();

        var box2 = new THREE.Box2(new THREE.Vector2(-halfScreenWidth, -halfScreenHeight), new THREE.Vector2(halfScreenWidth, halfScreenHeight));

        this.settings.gameBox = box2;

        this.renderer.setSize(newWidth, newHeight);
    },
    dispose:function () {
        this.gameLoop.stop();
        this.domElement.removeChild(this.renderer.domElement);
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.domElement = null;
    }
}

THREE.EventDispatcher.prototype.apply(AsteroidGame.prototype);
