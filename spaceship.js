// In case we want to inherit from object 3d


var Spaceship = function (game, type, color, vector3StartingPos, soundManager) {
    this.SPEED_Y = 550;
    this.SPEED_X = 550;
    this.ROTATION_AMOUNT = Math.PI / 8;
    this.DEFAULT_SHIP_ROTATION = Math.PI / 2;

    this.obj = {};
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.position = vector3StartingPos || new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(this.DEFAULT_SHIP_ROTATION, 0, 0);
    this.shipSphere = null;
    this.spaceShipBounds = null;
    this.game = game;
    this.weap = new Weapon(this.game, soundManager);
};

Spaceship.prototype = {
    _calcMovementStep:function (elapsedMs, speed) {
        return Math.ceil(elapsedMs / 1000 * speed);
    },
    _checkBounds:function () {

        var i = 0;

        var shipRadius = this.game.settings.shipRadius;

        for (i = 0; i < this.spaceShipBounds.length; i++) {
            if (!this.game.settings.gameBox.containsPoint(this.spaceShipBounds[i])) {
                if (i === 0) {
                    this.position.x = this.game.settings.gameBox.min.x + shipRadius;
                }
                else if (i === 1) {
                    this.position.y = this.game.settings.gameBox.max.y - shipRadius;
                }
                else if (i === 2) {
                    this.position.x = this.game.settings.gameBox.max.x - shipRadius;
                }
                else if (i === 3) {
                    this.position.y = this.game.settings.gameBox.min.y + shipRadius;
                }
            }
        }
    },
    _updateCollisionPoints:function () {
        for (var i = 0; i < this.spaceShipBounds.length; i++) {
            this.spaceShipBounds[i].x = this.position.x + this.spaceShipBoundsOffset[i].x;
            this.spaceShipBounds[i].y = this.position.y + this.spaceShipBoundsOffset[i].y;
        }
    },
    init:function (scene) {
        var shipRadius = this.game.settings.shipRadius;



        this.geometry = new THREE.SphereGeometry(shipRadius);
        this.material = new THREE.MeshBasicMaterial({ color:0x00ff00});
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);

        this.shipSphere = new THREE.Sphere(this.position, shipRadius);

        // points go left, top, right, bottom
        this.spaceShipBounds = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 0)
        ];

        this.spaceShipBoundsOffset = [
            new THREE.Vector2(-shipRadius, 0),
            new THREE.Vector2(0, shipRadius),
            new THREE.Vector2(shipRadius, 0),
            new THREE.Vector2(0, -shipRadius)
        ];

        this._updateCollisionPoints();

        this.weap.init(scene);

        this.weap.setWeaponDirection(new THREE.Vector3(0, 1, 0));

        // Load the spaceship obj along with the texture.
        // TODO: Notify when the spaceship loads.
        var loader = new THREE.OBJMTLLoader(),
            self = this;

        loader.addEventListener('load', function (object) {
            scene.add(object.content);
            self.mesh = object.content;
            self.mesh.rotation.set(self.rotation.x, self.rotation.y, self.rotation.z);
            self.mesh.scale.set(1.5, 1.5, 1.5);
        }, false);
        loader.load('obj/shipA_OBJ.obj', 'obj/shipA_OBJ.mtl');
    },
    update:function (gameState, scene) {
        if (gameState.keys.UP) {
            this.position.setY(this.position.y += this._calcMovementStep(gameState.elapsedTime, this.SPEED_Y));
        }
        if (gameState.keys.DOWN) {
            this.position.setY(this.position.y -= this._calcMovementStep(gameState.elapsedTime, this.SPEED_Y));
        }
        if (gameState.keys.LEFT) {
            this.position.setX(this.position.x -= this._calcMovementStep(gameState.elapsedTime, this.SPEED_X));
            this.rotation.setZ(this.ROTATION_AMOUNT);
        }

        if (gameState.keys.RIGHT) {
            this.position.setX(this.position.x += this._calcMovementStep(gameState.elapsedTime, this.SPEED_X));
            this.rotation.setZ(-this.ROTATION_AMOUNT);
        }

        if (!gameState.keys.RIGHT && !gameState.keys.LEFT) {
            this.rotation.setZ(0);
        }

        this._updateCollisionPoints();
        this._checkBounds();

        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        }
        this.shipSphere.center.copy(this.position);

        this.weap.setEmitLocation(this.position.clone());
        this.weap.update(gameState, scene);
    },

    doCollisions:function (objs, scene) {
        this.weap.doCollisions(objs, scene);

        for (var i = 0; i < objs.length; i++) {
            if (objs[i].intersectsSphere(this.shipSphere)) {
                this.game.asteroidHit(objs[i], this);
            }
        }
    }

};
