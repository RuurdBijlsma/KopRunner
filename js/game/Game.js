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
            this.addRandomCopper();
        }
        this.fixCopPositions();
        document.getElementById("loadingDisplay").style.display = "none";
    }
    addRandomCopper() {
        if (this.copCars.length < 11) {
            let pos = this.randomSafePosition(),
                randPos = new THREE.Vector3(2.5 - pos.x + Math.random() * 5, 8, 5 - pos.y + Math.random() * 10);
            console.log(randPos, pos.y);
            let copper = new CopCar(MAIN.scene, randPos.x, randPos.y, randPos.z);
            this.copCars.push(copper);
        }
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
