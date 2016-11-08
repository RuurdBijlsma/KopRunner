class CopCar extends Car {
    constructor(scene, x, y, z) {
        super(scene, x, y, z, 'blue');


        this._actor = KeyboardActor.instance;

        this.flickerInterval = 500;

        this.followCar();
    }

    followCar(car = MAIN.game.car) {
        this.targetCar = car;
        if (this.followInterval)
            clearInterval(this.followInterval);
        this.followInterval = setInterval(() => {
            this.goTo(car);
        }, 1000);
    }

    goTo(car) {
        if (this.isUpsideDown || this.isCrashed) {
            console.log("i've fallen and i can't get up");
            this.explode();
        } else {
            let vectors = this.getVectorsToCar(car)
            this.driveRoute(vectors);
        }
    }

    handleExplosion() {
        let safePos = MAIN.game.randomSafePosition();
        this.setPosition(safePos.x, tileYlevel - 2, safePos.z);
        this.setRotation();
        this.followCar(this.targetCar);
    }

    enableLights() {
        if (!this.light) {
            this.light = new THREE.PointLight(0x000000, 1, 100);
            this.mesh.add(this.light);
            this.light.position.set(0, 4, 0);
        }
        if (!this.lightInterval) {
            this.light.intensity = 2;
            this.lightInterval = setInterval(() => {
                if (this.light.color.b) {
                    this.light.color = new THREE.Color(1, 0, 0);
                } else {
                    this.light.color = new THREE.Color(0, 0, 1);
                }
            }, this.flickerInterval);
        }
    }
    disableLights() {
        if (this.light) {
            this.mesh.remove(this.light);
            delete this.light;
        }
        if (this.lightInterval) {
            clearInterval(this.lightInterval);
            delete this.lightInterval;
        }
        this.light.intensity = 0;
    }

    driveRoute(route) {
        if (route.length > 1) {
            let promiseChain = `this.driveTo({x: ${route[0].x}, y: ${route[0].y}})`;
            route.splice(0, 1)
            for (let point of route)
                promiseChain += `.then(() => this.driveTo({x: ${point.x}, y: ${point.y}}))`;

            eval(promiseChain); //goeie code
        }
    }

    driveTo(point) { // check if point is in front of car
        if (this.aimChecker)
            MAIN.loop.remove(this.aimChecker);
        return new Promise(resolve => {
            this.startAccelerating();
            this.aimChecker = MAIN.loop.add(() => this.checkAim(point, resolve));
        });
    }

    pointDirectionOffset(point) {
        let linePoint1 = this.mesh.position.clone(),
            linePoint2 = this.mesh.position.clone().add(this.mesh.getWorldDirection()),
            distance = this.distanceToLine(linePoint1, linePoint2, point); //als het > 0 is is de punt links van de lijn
        return distance;
    }

    checkAim(point, resolve) {
        let distance = this.pointDirectionOffset(point),
            carPos = new THREE.Vector2(this.mesh.position.x, this.mesh.position.z),
            carPointDistance = carPos.distanceTo(point);
        if (carPointDistance < 10) {
            this.stopMotor();
            this.brake(10);
            this.aimChecker = MAIN.loop.remove(this.aimChecker);
            resolve();
        } else {
            this.turn(-distance / carPointDistance);
        }
    }

    distanceToLine(linePoint1, linePoint2, checkPoint) {
        let determinant = ((linePoint2.x - linePoint1.x) * (checkPoint.y - linePoint1.z) - (linePoint2.z - linePoint1.z) * (checkPoint.x - linePoint1.x));
        return determinant;
    }

    getVectorsToCar(playerCar) {
        let vecTarget = new THREE.Vector2(playerCar.mesh.position.x, playerCar.mesh.position.z).clone();
        let vecThis = new THREE.Vector2(this.mesh.position.x, this.mesh.position.z);

        let tileTarget = MAIN.game.world.getAINodeOnVector(vecTarget);
        let tileThis = MAIN.game.world.getAINodeOnVector(vecThis);

        let path = MAIN.game.world.findPath(tileThis, tileTarget);

        let arr = [];
        for (let elem of path) {
            arr.push(new THREE.Vector2(elem.worldPosition.x, elem.worldPosition.z));
        }
        arr.splice(0, 1);
        arr.push(vecTarget);
        return arr;
    }

    get otherCops() {
        if (!this._otherCops) {
            let allCops = MAIN.game.copCars;
            this._otherCops = allCops.filter(c => c != this).map(c => c.mesh);
        }
        return this._otherCops;
    }

    get isCrashed() {
        if (!this.buildingMeshes) {
            this.buildingMeshes = [];
            let tiles = MAIN.game.world.map;
            for (let tileArray of tiles)
                for (let tile of tileArray)
                    this.buildingMeshes = this.buildingMeshes.concat(tile.buildingMeshes);
        }
        this.buildingMeshes = this.buildingMeshes.concat(this.otherCops);
        let crashDirection = 5;
        return new THREE.Raycaster(this.mesh.position, this.mesh.getWorldDirection(), 0, crashDirection).intersectObjects(this.buildingMeshes).length > 0;
    }
}
