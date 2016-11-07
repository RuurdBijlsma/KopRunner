class PlayerCar extends Car{
	constructor(scene, x, y, z) {
		super(scene, x, y, z, 'red');
        this._actor = KeyboardActor.instance;
        this._actor.init(this, scene.main.keyHandler);
        // this.actor = MobileActor.instance;
	}
}