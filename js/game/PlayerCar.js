class PlayerCar extends Car {
    constructor(scene, x, y, z) {
        super(scene, x, y, z, 'red');

        let light = new THREE.PointLight(0xffffff, 1, 100);
        this.mesh.add(light);
        light.position.set(0, 4, 0);

        let target = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial());
        this.mesh.add(target);
        target.position.set(0, 0, 2000000);

        let spotlights = [
            new SpotLight(this.mesh, -1, 1, 0, target, true, 0xffffff),
            new SpotLight(this.mesh, 1, 1, 0, target, true, 0xffffff),
        ];

        this._actor = KeyboardActor.instance;
        this._actor.init(this, scene.main.keyHandler);
        // this.actor = MobileActor.instance;

        this.copChecker = setInterval(() => this.enableNearestLights(), 100);
    }

    enableNearestLights() {
        let cops = MAIN.game.copCars;
        cops.sort((a, b) => a.mesh.position.distanceTo(this.mesh.position) - b.mesh.position.distanceTo(this.mesh.position));
        cops.slice(0,4).map(copper=>copper.enableLights());
        cops.slice(4).map(copper=>copper.disableLights());
    }
}
