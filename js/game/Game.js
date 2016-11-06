class Game {
    constructor() {
        this.world = new World();
    }
    start() {
        let cars = [];
        // for (let x = -50; x < 50; x += 100)
        //     for (let y = -50; y < 50; y += 100)
        //         cars.push(new PlayerCar(this, x, 3, y));

        cars.push(new CopCar(MAIN.scene, 0, 8, 0));
        this.car = cars[0];
        this.car._actor.init(cars, MAIN.keyHandler); //dit moet uncommented worden in de playercar en hier weg

        MAIN.scene.toggleCamera();
        this.car.setPosition();
        this.car.setRotation();
        this.car.wheelDirection = 0;
    }
}
