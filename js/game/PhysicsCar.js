class PhysicsCar extends Physijs.BoxMesh {
    constructor(scene, x = 0, y = 0, z = 0, color = 'red') {
        let bodyGeometry = new THREE.BoxGeometry(2.5, 0.8, 4),
            roofGeometry = new THREE.BoxGeometry(2.4, 0.8, 2.7),
            bodyMaterial = new THREE.MeshStandardMaterial({ color: color }),
            wheelMaterial = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 'rgb(40, 40, 40)' }), 0.8, 1),
            roofMesh = new Physijs.BoxMesh(roofGeometry, wheelMaterial),
            wheelRadius = 0.4,
            wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.4, 4);

        //let envMap = scene.skyBox.envMap;
        // wheelMaterial.envMap = envMap;
        // wheelMaterial.envMapIntensity = 2;
        // bodyMaterial.envMap = envMap;
        // bodyMaterial.envMapIntensity = 2;
        super(bodyGeometry, bodyMaterial);
        this.position.set(x, y, z);
        this.mass = 5;

        roofMesh.position.set(0, 0.8, -0.5);
        roofMesh.__dirtyPosition = true;
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
            wheelMesh.mass = 2;
            scene.add(wheelMesh);
            let constraint = this.wheels[position].constraint = new Physijs.DOFConstraint(wheelMesh, this, pos.clone());

            scene.addConstraint(constraint);

            constraint.setAngularLowerLimit(new THREE.Vector3(0, 0, 0));
            constraint.setAngularUpperLimit(new THREE.Vector3(0, 0, 0));

            wheelMesh.__dirtyPosition = true;
            wheelMesh.__dirtyRotation = true;
        }

        this.groundDirection = new THREE.Vector3(0, -1, 0);
        this.maxSteerRotation = Math.PI / 4;

        this.gameLoop = scene.main.loop;
        this.gameLoop.add(() => this.update());


        this.accelerationPerSecond = 10;
        this.decelerationPerSecond = 20;
        this.accelerationRate = this.accelerationPerSecond / this.gameLoop.tps;
        this.decelerationRate = this.decelerationPerSecond / this.gameLoop.tps;
        this.maxSpeed = 20;
        this.steerSpeed = 0.01;
        this.boostPower = 50;
    }

    get isOnGround() {
        let carHeight = 1.5;
        return new THREE.Raycaster(this.position, this.groundDirection, 0, carHeight).intersectObjects([MAIN.scene.floor]).length > 0;
    }

    get speed() {
        return this.getLinearVelocity().multiply(new THREE.Vector3(1, 0, 1)).length();
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

    startMovingForward() {
        for (let position in this.wheels) {
            let constraint = this.wheels[position].constraint;

            //if (position.includes('back')) {
            constraint.configureAngularMotor(
                0, // which angular motor to configure - 0,1,2 match x,y,z
                1, // lower limit of the motor
                0, // upper limit of the motor
                this.maxSpeed, // target velocity
                50 // maximum force the motor can apply
            );
            constraint.enableAngularMotor(0);
            // }
        }
    }

    startMovingBackward() {
        for (let position in this.wheels) {
            let constraint = this.wheels[position].constraint;

            //if (position.includes('back')) {
            constraint.configureAngularMotor(
                0, // which angular motor to configure - 0,1,2 match x,y,z
                1, // lower limit of the motor
                0, // upper limit of the motor
                -this.maxSpeed, // target velocity
                50 // maximum force the motor can apply
            );
            constraint.enableAngularMotor(0);
            // }
        }
    }
    stopMoving() {
        console.log('stopmovingbackward');
        for (let position in this.wheels) {
            let constraint = this.wheels[position].constraint;
            constraint.disableAngularMotor(0);
        }
    }

    turnWheel(rad) {
        // if (this.isOnGround) {
        let currentAnglularVelocity = this.getAngularVelocity(),
            rotationChange = -(rad * this.steerSpeed);
        if (this.speed > 0) {
            rotationChange *= this.speed > 1 ? 1 : this.speed; //als je stilstaat kan je niet steeren
        } else {
            rotationChange *= this.speed < -1 ? -1 : this.speed;
            rotationChange *= -1; // als je achteruit gaat moet steering omgekeerd
        }
        rotationChange *= 200;
        console.log(rotationChange);
        this.setAngularVelocity(new THREE.Vector3(0, rotationChange, 0));
        // }
    }

    boost() {
        if (!this.boostTimeout) {
            this.boostTimeout = true;

            this.setLinearVelocity(this.getWorldDirection().multiplyScalar(this.boostPower));

            setTimeout(() => delete this.boostTimeout, 10 * 1000); // 10 second boost delay
        }
    }

    jump() {
        if (this.isOnGround) {
            let currentVelocity = this.getLinearVelocity();
            this.setLinearVelocity(new THREE.Vector3(currentVelocity.x, currentVelocity.y + 10, currentVelocity.z));
            this.setAngularVelocity(new THREE.Vector3(4, 0, 0));
        }
    }
}
