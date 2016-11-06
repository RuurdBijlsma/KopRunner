class Car extends Physijs.BoxMesh {
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let bodyGeometry = new THREE.BoxGeometry(2.5, 0.8, 4),
            roofGeometry = new THREE.BoxGeometry(2.4, 0.8, 2.7),
            bodyMaterial = new THREE.MeshStandardMaterial({ color: color }),
            wheelMaterial = new THREE.MeshStandardMaterial({ color: 'rgb(40, 40, 40)' }),
            roofMesh = new Physijs.BoxMesh(roofGeometry, wheelMaterial),
            wheelRadius = .4,
            wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.3, 20);

        let envMap = scene.skyBox.envMap;
        wheelMaterial.envMap = envMap;
        wheelMaterial.envMapIntensity = 2;
        bodyMaterial.envMap = envMap;
        bodyMaterial.envMapIntensity = 2;
        super(bodyGeometry, bodyMaterial);
        this.position.set(x, y, z);

        roofMesh.position.set(x, y - 2.4, z - 0.5);
        this.add(roofMesh);

        let wheels = {
            frontLeft: {
                mesh: new Physijs.CylinderMesh(wheelGeometry, wheelMaterial),
                position: new THREE.Vector3(x + 1.2, y - 3.4, z - 1.4)
            },
            frontRight: {
                mesh: new Physijs.CylinderMesh(wheelGeometry, wheelMaterial),
                position: new THREE.Vector3(x - 1.2, y - 3.4, z - 1.4)
            },
            backLeft: {
                mesh: new Physijs.CylinderMesh(wheelGeometry, wheelMaterial),
                position: new THREE.Vector3(x + 1.2, y - 3.4, z + 1.4)
            },
            backRight: {
                mesh: new Physijs.CylinderMesh(wheelGeometry, wheelMaterial),
                position: new THREE.Vector3(x - 1.2, y - 3.4, z + 1.4)
            }
        }

        for (let position in wheels) {
            let pos = wheels[position].position,
                mesh = wheels[position].mesh;
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotateZ(Math.PI / 2);
            this.add(mesh);
        }

        scene.add(this);
        scene.add(this);

        this.gameLoop = scene.main.loop;
        this.gameLoop.add(() => this.update());


        this.accelerationPerSecond = 10;
        this.decelerationPerSecond = 20;
        this.accelerationRate = this.accelerationPerSecond / this.gameLoop.tps;
        this.decelerationRate = this.decelerationPerSecond / this.gameLoop.tps;
        this.maxSpeed = 30;
        this.steerSpeed = 0.01;

        this.boostPower = 30;

        this.groundDirection = new THREE.Vector3(0, -1, 0);
    }

    get isOnGround() {
        let carHeight = 0.9;
        return new THREE.Raycaster(this.position, this.groundDirection, 0, carHeight).intersectObjects([MAIN.scene.floor]).length > 0;
    }

    set speed(speed) {
        if (speed >= this.maxSpeed)
            speed = this.maxSpeed;

        this.isOnGround && this.setLinearVelocity(this.getWorldDirection().multiplyScalar(speed));
    }
    get speed() {
        let sum = v => v.x + v.y + v.z,
            speedInCarDirection = this.getWorldDirection().multiply(this.getLinearVelocity());
        return sum(speedInCarDirection);
    }

    get actor() {
        return this._actor;
    }

    set actor(value) {
        if (this._actor != undefined) this._actor.disable();
        this._actor = value;
        this._actor.init(this);
    }

    update() {
        if (this.actor == undefined) return;
        this.actor.driveCar(this);
    }

    accelerate() {
        if (this.isOnGround)
            if (this.speed > 0) {
                this.speed += this.accelerationRate;
            } else {
                this.speed += this.decelerationRate;
            }
    }
    decelerate() {
        if (this.isOnGround)
            if (this.speed > 0) {
                this.speed -= this.decelerationRate;
            } else {
                this.speed -= this.accelerationRate;
            }
    }

    turnWheel(rad) { //SkeerSteer™
        if (this.isOnGround) {
            let currentAnglularVelocity = this.getAngularVelocity(),
                rotationChange = -(rad * this.steerSpeed);
            if (this.speed > 0) {
                rotationChange *= this.speed > 1 ? 1 : this.speed; //als je stilstaat kan je niet steeren
            } else {
                rotationChange *= this.speed < -1 ? -1 : this.speed;
                rotationChange *= -1; // als je achteruit gaat moet steering omgekeerd
            }
            this.setAngularVelocity(new THREE.Vector3(0, currentAnglularVelocity.y + rotationChange, 0));
        }
    }

    boost() {
        if (!this.boostTimeout) {
            this.maxSpeed += this.boostPower;
            this.speed += this.boostPower;

            this.boostTimeout = setTimeout(function() {
                this.maxSpeed -= this.boostPower;
                this.speed -= this.boostPower;
                delete this.boostTimeout;
            }, 5000);
            setTimeout(() => delete this.boostTimeout, 10 * 1000); // 10 second boost delay
        }
    }

    jump() {
        if (this.isOnGround) {
            let currentVelocity = this.getLinearVelocity();
            this.setLinearVelocity(new THREE.Vector3(currentVelocity.x, currentVelocity.y + 3, currentVelocity.z));
            this.setAngularVelocity(new THREE.Vector3(4, 0, 0));
        }
    }
}
