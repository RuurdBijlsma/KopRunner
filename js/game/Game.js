class Game {
    constructor() {
        this.world = new World();
    }
    start() {
        this.car = new PlayerCar(MAIN.scene, 0, 8, 0); //dit moet uncommented worden in de playercar en hier weg

        MAIN.scene.toggleCamera();
        let safePos = this.randomSafePosition();
        this.car.setPosition(safePos.x, tileYlevel - 2, safePos.z);
        this.car.setRotation();
        this.car.wheelDirection = 0;

        this.copCars = [];
        for (let i = 0; i < 1; i++) {
            let pos = this.randomSafePosition(),
                copper = new CopCar(MAIN.scene, pos.x, 8, pos.z);
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
    randomSafePosition() {
        let tiles, row, tile;
        do {
            tiles = this.world.map;
            row = tiles[Math.floor(Math.random() * tiles.length)];
            tile = row[Math.floor(Math.random() * row.length)];
        } while (tile.singleAINode.densityFactor !== 255);
        return tile.singleAINode.worldPosition;
    }
}
