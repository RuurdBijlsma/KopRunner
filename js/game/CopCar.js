class CopCar extends Car {
    constructor(scene, x, y, z) {
        super(scene, x, y, z, 'blue');
        this._actor = KeyboardActor.instance;
    }
    driveTo(point) { // check if point is in front of car
        let distance = this.pointDirectionOffset(point);
        this.startAccelerating();
        this.aimChecker = MAIN.loop.add(() => this.checkAim(point));
    }
    pointDirectionOffset(point) {
        let linePoint1 = this.mesh.position.clone(),
            linePoint2 = this.mesh.position.clone().add(this.mesh.getWorldDirection()),
            distance = this.distanceToLine(linePoint1, linePoint2, point); //als het > 0 is is de punt links van de lijn
        return distance;
    }
    checkAim(point) {
        let distance = this.pointDirectionOffset(point),
            carPos = new THREE.Vector2(this.mesh.position.x, this.mesh.position.z);
        if (carPos.distanceTo(point) < 5) {
            this.stopMotor();
            this.brake();
            this.aimChecker = MAIN.loop.remove(this.aimChecker);
            console.log('current pos: ', carPos);
        } else {
            this.turn(-distance);
        }
    }
    distanceToLine(linePoint1, linePoint2, checkPoint) {
        let determinant = ((linePoint2.x - linePoint1.x) * (checkPoint.y - linePoint1.z) - (linePoint2.z - linePoint1.z) * (checkPoint.x - linePoint1.x));
        return determinant;
    }
}
