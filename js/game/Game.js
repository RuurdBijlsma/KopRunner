class Game {
    constructor() {
        this.world = new World();
    }
    start() {
        this.car = new PlayerCar(MAIN.scene, 0, 8, 0); //dit moet uncommented worden in de playercar en hier weg

        MAIN.scene.toggleCamera();
        this.car.setPosition();
        this.car.setRotation();
        this.car.wheelDirection = 0;

        this.copCars = [];
        for (let i = 0; i < 10; i++) {
            let x = (halfMapSize - Math.random() * halfMapSize * 2) / 1.5,
                z = (halfMapSize - Math.random() * halfMapSize * 2) / 1.5,
                copper = new CopCar(MAIN.scene, x, 8, z);
            this.copCars.push(copper);
        }
        this.fixCopPositions();
        document.getElementById("loadingDisplay").style.display = "none";
    }
    fixCopPositions() {
        for (let car of this.copCars) {
            car.setPosition(car.mesh.position.x, 1, car.mesh.position.z);
            car.setRotation();
        }
    }
}
