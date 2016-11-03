class PhysicsCar extends Physijs.BoxMesh {
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let bodyGeometry = new THREE.BoxGeometry(2.5, 0.8, 4),
            roofGeometry = new THREE.BoxGeometry(2.4, 0.8, 2.7),
            bodyMaterial = new THREE.MeshStandardMaterial({ color: color }),
            wheelMaterial = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 'rgb(40, 40, 40)' }), 1, 0.2),
            roofMesh = new Physijs.BoxMesh(roofGeometry, wheelMaterial),
            wheelRadius = .4,
            wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.3, 40);

        let envMap = scene.skyBox.envMap;
        wheelMaterial.envMap = envMap;
        wheelMaterial.envMapIntensity = 2;
        bodyMaterial.envMap = envMap;
        bodyMaterial.envMapIntensity = 2;
        super(bodyGeometry, bodyMaterial);
        this.position.set(x, y, z);
        this.mass = 200;

        roofMesh.position.set(x, y - 2.4, z - 0.5);
        this.add(roofMesh);

        this.wheels = {
            frontLeft: {
                position: new THREE.Vector3(x + 1.2, y - 1.5, z + 1.4)
            },
            frontRight: {
                position: new THREE.Vector3(x - 1.2, y - 1.5, z + 1.4)
            },
            backLeft: {
                position: new THREE.Vector3(x + 1.2, y - 1.5, z - 1.4)
            },
            backRight: {
                position: new THREE.Vector3(x - 1.2, y - 1.5, z - 1.4)
            }
        }

        scene.add(this);
        this.maxSteerRotation = Math.PI / 4;

        for (let position in this.wheels) {
            let pos = this.wheels[position].position,
                wheelMesh = this.wheels[position].mesh = new Physijs.CylinderMesh(wheelGeometry, wheelMaterial);

            wheelMesh.position.set(pos.x, pos.y, pos.z);
            wheelMesh.rotateZ(Math.PI / 2);
            wheelMesh.mass = 500;
            scene.add(wheelMesh);
            let constraint = this.wheels[position].constraint = new Physijs.DOFConstraint(wheelMesh, this, pos.clone());

            scene.addConstraint(constraint);

            switch (position) {
                case 'frontLeft':
                case 'frontRight':
                    constraint.setAngularLowerLimit(new THREE.Vector3(0, -this.maxSteerRotation, 0));
                    constraint.setAngularUpperLimit(new THREE.Vector3(0, this.maxSteerRotation, 0));
                    break;
                case 'backLeft':
                case 'backRight':
                    constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
                    constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));
                    break;
            }

            wheelMesh.__dirtyPosition = true;
            wheelMesh.__dirtyRotation = true;
        }

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
        this.wheels.backRight.constraint.configureAngularMotor(
            0, // which angular motor to configure - 0,1,2 match x,y,z
            1, // lower limit of the motor
            0, // upper limit of the motor
            this.maxSpeed, // target velocity
            2000 // maximum force the motor can apply
        );
        this.wheels.backLeft.constraint.configureAngularMotor(0, 1, 0, this.maxSpeed, 2000);
        this.wheels.backRight.constraint.enableAngularMotor(0); // which angular motor to configure - 0,1,2 match x,y,z
        this.wheels.backLeft.constraint.enableAngularMotor(0);
    }
    decelerate() {}

    steerLeft() {
        this.wheels.frontLeft.constraint.configureAngularMotor(1, -this.maxSteerRotation, this.maxSteerRotation, 1, 200);
        this.wheels.frontRight.constraint.configureAngularMotor(1, -this.maxSteerRotation, this.maxSteerRotation, 1, 200);
        this.wheels.frontLeft.constraint.enableAngularMotor(1);
        this.wheels.frontRight.constraint.enableAngularMotor(1);
    }
    steerRight() {
        this.wheels.frontLeft.constraint.configureAngularMotor(1, -this.maxSteerRotation, this.maxSteerRotation, -1, 200);
        this.wheels.frontRight.constraint.configureAngularMotor(1, -this.maxSteerRotation, this.maxSteerRotation, -1, 200);
        this.wheels.frontLeft.constraint.enableAngularMotor(1);
        this.wheels.frontRight.constraint.enableAngularMotor(1);
    }

    turnWheel(rad) {}

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
