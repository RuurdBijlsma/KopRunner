class Game {
    constructor() {
        this.world = new World();

        let cars = [];
        // for (let x = -50; x < 50; x += 100)
        //     for (let y = -50; y < 50; y += 100)
        //         cars.push(new PlayerCar(this, x, 3, y));
        cars.push(new PlayerCar(this, 0, 8, 0));
        this.car = cars[0];
        this.car._actor.init(cars, this.main.keyHandler); //dit moet uncommented worden in de playercar en hier weg
    }
}
