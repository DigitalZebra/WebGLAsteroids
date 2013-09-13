var AsteroidTypes = {
    SMALL:0,
    MEDIUM:1,
    LARGE:2
};

(function (out) {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var randomAsteroidVector = function () {
        var vec = new THREE.Vector3(getRandomInt(-5, 5), getRandomInt(-3, -10), 0);
        vec.normalize();

        return vec;
    };

    var Asteroid = function (vec3Position, type, directionStep, manager) {
        this.isActive = false;
        this.type = type;
        this.directionStep = directionStep;

        var newVec3 = vec3Position.clone();

        this.mesh = new THREE.Mesh(manager.asteroidGeometries[this.type], manager.asteroidMaterial);
        this.mesh.position.set(newVec3.x, newVec3.y, newVec3.z);

        THREE.Sphere.call(this, newVec3, manager.asteroidRadii[this.type]);
    };

    Asteroid.prototype = Object.create(THREE.Sphere.prototype);

    Asteroid.prototype.destroy = function (scene) {
        scene.remove(this.mesh);
        this.mesh = null;
        this.directionStep = null;
    };

    Asteroid.prototype.update = function (gameState) {
        this.mesh.position.add(this.directionStep);
        this.center.set(this.mesh.position.x, this.mesh.position.y, 0);
    };

    Asteroid.prototype.init = function (scene) {
        scene.add(this.mesh);
    };

    var AsteroidManager = function (game) {
        this.asteroids = [];
        this.game = game;

        this.asteroidMaterial = new THREE.MeshBasicMaterial({
            color:0x8B4513
        });
        this.asteroidGeometries = [
            new THREE.SphereGeometry(30, 30, 30),
            new THREE.SphereGeometry(40, 30, 30),
            new THREE.SphereGeometry(65, 30, 30)
        ];
        this.asteroidRadii = [30, 40, 65];
    };

    AsteroidManager.prototype = {
        init:function (scene) {
            // wat
        },
        update:function (gameState, scene) {

            // update the asteroids before doing the bounds checking
            for (var k = 0; k < this.asteroids.length; k++) {
                this.asteroids[k].update(gameState);
            }

            // asteroids always fire downwards, so we do a bounds check with the bottom
            // of the game screen to see if they should be cleaned up.
            var asteroidsToDestroy = [];
            for (var i = 0; i < this.asteroids.length; i++) {
                if (this.asteroids[i].mesh.position.y < (this.game.settings.gameBox.min.y - 100)) {
                    asteroidsToDestroy.push(this.asteroids[i]);
                }
            }

            for (var j = 0; j < asteroidsToDestroy.length; j++) {
                this.destroy(asteroidsToDestroy[j], scene);
            }
        },
        destroy:function (asteroid, scene) {
            var index = this.asteroids.indexOf(asteroid);

            if (index == -1) {
                return; // should not happen, but if it does just bail.
            }

            this.asteroids.splice(index, 1);
            asteroid.destroy(scene); // destroy the original asteroid
        },
        getAsteroids:function () {
            return this.asteroids;
        },
        split:function (asteroid, scene) {

            var spawnNum = getRandomInt(2, 4),
                newAsteroid = null;

            for (var i = 0; i < spawnNum; i++) {
                newAsteroid = new Asteroid(asteroid.mesh.position, AsteroidTypes.SMALL, randomAsteroidVector().multiplyScalar(getRandomInt(1, 5)), this);
                newAsteroid.init(scene);
                this.asteroids.push(newAsteroid);
            }

            this.destroy(asteroid, scene);

        },
        createAsteroid:function (scene) {
            var asteroid = new Asteroid(new THREE.Vector3(getRandomInt(this.game.settings.gameBox.min.x, this.game.settings.gameBox.max.x), this.game.settings.gameBox.max.y + 100, 0), AsteroidTypes.MEDIUM, randomAsteroidVector().multiplyScalar(getRandomInt(2, 5)), this);
            asteroid.init(scene);

            this.asteroids.push(asteroid);
        }
    };

    out.Asteroid = Asteroid;
    out.AsteroidManager = AsteroidManager;
})(window);

