(function (outs) {


    var WEAPON_SPEED = 30;


    var Laser = function (weapon) {
        this.direction = null;

        this.sprite = new THREE.Sprite(weapon.spriteMaterial);
        this.sprite.scale.set(100, 100, 1);

        this.isActive = false;
        this.directionStep = null;
    };

    Laser.prototype = {
        init:function (scene) {

        },
        update:function (gameState) {
            if (!this.isActive) {
                return;
            }

            if (this.directionStep) {
                this.sprite.position.add(this.directionStep);
            }
        },
        /* Assumes sphere */
        doCollision:function (obj) {
            if (!this.isActive) {
                return;
            }

            return (obj.containsPoint(this.sprite.position));
        },
        activate:function (vec3EmitLocation, vec3Direction, scene) {
            if (this.isActive) {
                return;
            }

            this.direction = vec3Direction;
            this.sprite.position.set(vec3EmitLocation.x, vec3EmitLocation.y, vec3EmitLocation.z);
            this.directionStep = vec3Direction.clone().multiplyScalar(WEAPON_SPEED);
            this.isActive = true;
            scene.add(this.sprite);

        },
        deactivate:function (scene) {
            if (!this.isActive) {
                return;
            }

            this.isActive = false;
            scene.remove(this.sprite);
        }
    };

    outs.Laser = Laser;
})(window);


var Weapon = function (game, soundManager) {
    this.emitLocation = null;
    this.direction = null;
    this.game = game;
    this.LASER_COUNT = 25;
    this.laserCooldown = 0;
    this.laserPool = [];
    this.deactiveLasers = {};
    this.activeLasers = {};
    this.laserSound = soundManager.add({ key:"laser", src:"assets/laser.mp3", volume:.5});

    var texture = new THREE.ImageUtils.loadTexture("assets/laser.png");
    this.spriteMaterial = new THREE.SpriteMaterial({ map:texture, useScreenCoordinates:false, alignment:THREE.SpriteAlignment.center });
};

Weapon.prototype = {
    _activateLaser:function (laser, scene) {
        this.activeLasers[laser._laserId] = laser;
        this.deactiveLasers[laser._laserId] = null;
        laser.activate(this.emitLocation, this.direction, scene);
    },
    _deactivateLaser:function (laser, scene) {
        this.deactiveLasers[laser._laserId] = laser;
        this.activeLasers[laser._laserId] = null;
        laser.deactivate(scene);
    },
    _getLaserToActivate:function () {
        for (var property in this.deactiveLasers) {
            if (this.deactiveLasers[property]) {
                return this.deactiveLasers[property];
            }
        }

        // should not hit this!
        return null;
    },
    init:function (scene) {
        var laser;
        for (var j = 0; j < this.LASER_COUNT; j++) {
            laser = new Laser(this);
            laser._laserId = j;
            this._deactivateLaser(laser, scene);
            this.laserPool.push(laser);
        }
    },
    update:function (gameState, scene) {

        if (gameState.keys.SPACE && this.laserCooldown <= 0) {
            this._activateLaser(this._getLaserToActivate(), scene);
            this.laserCooldown = this.game.settings.laserRateOfFire;
            this.laserSound.play();
            return;
        }

        var laser,
            property;

        for (property in this.activeLasers) {
            laser = this.activeLasers[property];

            if (!laser) {
                continue;
            }

            laser.update(gameState);

            // check to see if laser is out of bounds!
            if (laser.sprite.position.y > this.game.settings.gameBox.max.y) {
                this._deactivateLaser(laser, scene);
            }
        }

        this.laserCooldown -= gameState.elapsedTime;
    },
    doCollisions:function (objs, scene) {
        var laser,
            property,
            i,
            obj;

        for (property in this.activeLasers) {
            laser = this.activeLasers[property];
            if (!laser) {
                continue;
            }

            for (i = 0; i < objs.length; i++) {
                obj = objs[i];
                if (laser.doCollision(obj)) {
                    if (obj instanceof Asteroid) {
                        // Laser hit an asteroid, destroy it.
                        this._deactivateLaser(laser, scene);
                        this.game.asteroidHit(obj, laser);
                    }
                }
            }
        }
    },
    setEmitLocation:function (vec3) {
        this.emitLocation = vec3;
    },
    setWeaponDirection:function (vec3) {
        vec3.normalize();
        this.direction = vec3;
    }

};