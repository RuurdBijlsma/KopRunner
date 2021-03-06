class Car extends Physijs.Vehicle {
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let bodyGeometry = new THREE.BoxGeometry(2.5, 0.8, 4),
            roofGeometry = new THREE.BoxGeometry(2.4, 0.8, 2.7),
            bodyMaterial = new THREE.MeshStandardMaterial({ color: color }),
            roofMesh = new Physijs.BoxMesh(roofGeometry, new THREE.MeshStandardMaterial({ color: '#111111' })),
            bodyMesh = new Physijs.BoxMesh(bodyGeometry, bodyMaterial);
        bodyMesh.add(roofMesh);
        bodyMesh.mass = 50;
        roofMesh.position.set(0, 0.8, -0.5);
        bodyMesh.position.set(x, y, z);

        super(bodyMesh, new Physijs.VehicleTuning(
            10.88, //Suspension stiffness
            1.83, //Suspension compression
            0.28, //Suspension damping
            500, //Max suspension travel
            10.5, //Friction slip
            6000 //Max suspension force
        ));
        scene.add(this);
        this.roofMesh = roofMesh;

        let wheels = {
            frontLeft: new THREE.Vector3(1.2, -0.5, 1.4),
            frontRight: new THREE.Vector3(-1.2, -0.5, 1.4),
            backLeft: new THREE.Vector3(1.2, -0.5, -1.4),
            backRight: new THREE.Vector3(-1.2, -0.5, -1.4)
        };

        let wheelMaterial = new THREE.MeshStandardMaterial({
                color: 'rgb(40, 40, 40)'
            }),
            wheelRadius = 0.4,
            wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.3, 20);
        wheelGeometry.rotateZ(Math.PI / 2);

        for (let position in wheels) {
            let pos = wheels[position];
            this.addWheel(
                wheelGeometry,
                wheelMaterial,
                pos,
                new THREE.Vector3(0, -1, 0), // wheel direction
                new THREE.Vector3(-1, 0, 0), // wheel axle
                0.5, // suspension rest length
                wheelRadius, // wheel radius
                position.includes('front') // is front wheel
            );
        }

        this.groundDirection = new THREE.Vector3(0, -1, 0);
        this.maxSteerRotation = Math.PI / 10;

        this.gameLoop = scene.main.loop;
        this.gameLoop.add(() => this.update());

        this.boostPower = 50;
        this.health = 100;
        this.mesh.addEventListener('collision', (collisionObject, collisionVelocity, collisionRotation, normal) => this.collisionHandler(collisionObject, collisionVelocity, collisionRotation, normal));
        this.boostEmitter = new Explosion(this, {
            color: {
                value: [new THREE.Color('orange'), new THREE.Color('red')]
            },
            position: {
                value: this.mesh.position.clone().sub(new THREE.Vector3(0, 10, 0)),
                spread: new THREE.Vector3(0, 0, 0)
            }
        });
        this.splosionEmitter = new Explosion(this, {
            velocity: {
                value: new THREE.Vector3(0, 0.5, 0),
                spread: new THREE.Vector3(10, 10, 10)
            },
            acceleration: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3(0, 0, 0)
            },
            color: {
                value: [new THREE.Color('orange'), new THREE.Color('yellow')]
            },
            particleCount: 50000
        });
    }

    get health() {
        return this._health;
    }
    set health(h) {
        if (h <= 0) {
            console.log('dead');
            this.explode();
        }
        this._health = h;
    }

    collisionHandler(collisionObject, collisionVelocity, collisionRotation, normal) {
        if (collisionObject instanceof Car) {
            let damage = collisionVelocity.length();
            this.health -= damage / 5;
            console.log(this.constructor.name + ' health: ' + this.health);
        }
    }

    startAccelerating(accelerationForce = 75) {
        if (this.directionalSpeed.z < -0.1)
            this.brake();
        else
            this.applyEngineForce(accelerationForce);
    }

    startDecelerating(accelerationForce = -50) {
        if (this.directionalSpeed.z > 0.1)
            this.brake();
        else
            this.applyEngineForce(accelerationForce);
    }

    stopMotor() {
        this.applyEngineForce(0);
    }

    brake(power = 20) {
        this.setBrake(power, 2);
        this.setBrake(power, 3);
    }

    turn(direction = 1) {
        //1 = left
        //-1 = right
        this.stopTurningWheels();
        this.wheelDirection += direction / 50;
    }

    explode() {
        this.splosionEmitter.start();
        setTimeout(() => this.splosionEmitter.stop(), 200);
        setTimeout(() => this.handleExplosion(), 2000);
    }

    handleExplosion() {
        //player exploded
    }

    setWheels(direction) {
        let turnSpeed = 2;
        //turn wheels until they're pointing at direction
        direction = direction > this.maxSteerRotation ? this.maxSteerRotation : direction;
        if (this.wheelSetLoop)
            this.stopTurningWheels();
        this.wheelSetLoop = this.gameLoop.add(() => {
            this.wheelDirection += ((direction - this.wheelDirection) * turnSpeed) / 50;
            if (Math.abs(direction - this.wheelDirection) < 0.05) {
                this.wheelDirection = 0;
                this.stopTurningWheels();
            }
        });
    }

    stopTurningWheels() {
        this.wheelSetLoop = this.gameLoop.remove(this.wheelSetLoop);
    }

    get wheelDirection() {
        return this._wheelDirection || 0;
    }

    set wheelDirection(v) {
        v = v > this.maxSteerRotation ? this.maxSteerRotation : v;
        v = v < -this.maxSteerRotation ? -this.maxSteerRotation : v;
        this.setSteering(v, 0);
        this.setSteering(v, 1);
        //0: frontLeft
        //1: frontRight
        //2: backLeft
        //3: backRight

        this._wheelDirection = v;
    }

    get isUpsideDown() {
        let roofPos = this.roofMesh.getWorldPosition(),
            bodyPos = this.mesh.getWorldPosition();
        return roofPos.y < bodyPos.y;
    }

    get isCrashed() {
        if (!this.buildingMeshes) {
            this.buildingMeshes = [];
            let tiles = MAIN.game.world.map;
            for (let tileArray of tiles)
                for (let tile of tileArray)
                    this.buildingMeshes = this.buildingMeshes.concat(tile.buildingMeshes);
        }
        let crashDirection = 5;
        return new THREE.Raycaster(this.mesh.position, this.mesh.getWorldDirection(), 0, crashDirection).intersectObjects(this.buildingMeshes).length > 0;
    }

    get rayDown() {
        let carHeight = 3;
        if (!this.floorMeshes) {
            this.floorMeshes = [];
            let meshes = MAIN.game.world.map.map(a => a.map(t => t.mesh));
            for (let mesh of meshes)
                this.floorMeshes = this.floorMeshes.concat(mesh);
        }
        return new THREE.Raycaster(this.mesh.position, this.groundDirection, 0, carHeight).intersectObjects(this.floorMeshes).length > 0;
    }

    get isOnGround() {
        let carHeight = 3;
        if (!this.floorMeshes) {
            this.floorMeshes = [];
            let meshes = MAIN.game.world.map.map(a => a.map(t => t.mesh));
            for (let mesh of meshes)
                this.floorMeshes = this.floorMeshes.concat(mesh);
        }
        return new THREE.Raycaster(this.mesh.position, this.groundDirection, 0, carHeight).intersectObjects(this.floorMeshes).length > 0;
    }
    get directionalSpeed() {
        return this.mesh.getWorldDirection().multiply(this.mesh.getLinearVelocity());
    }

    update() {
        if (this.actor == undefined) return;
        this.actor.driveCar(this);
    }

    boost() {
        if (!this.boostTimeout) {
            this.boostEmitter.start();
            this.boostTimeout = true;
            let loop = MAIN.loop.add(() => {
                this.mesh.setLinearVelocity(this.mesh.getWorldDirection().multiplyScalar(this.boostPower));
            });
            setTimeout(() => {
                MAIN.loop.remove(loop);
                this.boostEmitter.stop();
            }, 1000);

            setTimeout(() => {
                delete this.boostTimeout
            }, 10 * 1000); // 10 second boost delay
        }
    }

    jump(height = 4) {
        if (this.isOnGround) {
            let currentVelocity = this.mesh.getLinearVelocity();
            this.mesh.setLinearVelocity(new THREE.Vector3(currentVelocity.x, currentVelocity.y + height, currentVelocity.z));
        }
    }

    get actor() {
        return this._actor;
    }

    set actor(value) {
        if (this._actor != undefined) this._actor.disable();
        this._actor = value;
        this._actor.init(this);
    }

    setRotation(x = 0, y = 0, z = 0) {
        this.mesh.rotation.set(x, y, z);
        this.mesh.setAngularVelocity(new THREE.Vector3);
        this.mesh.__dirtyRotation = true;
    }
    setPosition(x = 0, y = tileYlevel - 2, z = 0) {
        this.mesh.position.set(x, y, z);
        this.mesh.setLinearVelocity(new THREE.Vector3);
        this.mesh.__dirtyPosition = true;
    }
}
