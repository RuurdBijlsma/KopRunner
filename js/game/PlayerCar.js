class PlayerCar extends Car{
	constructor(scene, x, y, z) {
		super(scene, x, y, z, 'red');

        let light = new THREE.PointLight( 0xffffff, 1, 100 );
        this.mesh.add(light);
        light.position.set(0, 4, 0);

        this._actor = KeyboardActor.instance;
        this._actor.init(this, scene.main.keyHandler);
        // this.actor = MobileActor.instance;
	}
}