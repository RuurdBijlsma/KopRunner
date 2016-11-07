class CopCar extends Car {
    constructor(scene, x, y, z) {
        super(scene, x, y, z, 'blue');

        this.light = new THREE.PointLight(0x000000, 1, 100);
        this.mesh.add(this.light);
        this.light.position.set(0, 4, 0);

        this._actor = KeyboardActor.instance;

        this.flickerInterval = 500;
        setTimeout(() => this.flickerLights(), 10000 + Math.random() * this.flickerInterval);
    }

    flickerLights() {
        setInterval(() => {
            if(this.light.color.b){
                this.light.color = new THREE.Color(1,0,0);
            }else{
                this.light.color = new THREE.Color(0,0,1);
            }
        }, this.flickerInterval);
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
        console.log('driving to ', point);
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
}
