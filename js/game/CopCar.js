class CopCar extends Car {
    constructor(scene, x, y, z) {
        super(scene, x, y, z, 'blue');
        this._actor = KeyboardActor.instance;
    }

    driveRoute(route) {
        if (route.length > 1) {
            for (let i = 0; i < route.length - 1; i++) {
                this.driveTo(route[i].then(driveTo(route[i+1])));
            }
        }
    }

    driveTo(point) { // check if point is in front of car
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
        if (carPointDistance < 5) {
            this.stopMotor();
            this.brake(10);
            this.aimChecker = MAIN.loop.remove(this.aimChecker);
            console.log('current pos: ', carPos);
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
