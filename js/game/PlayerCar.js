class PlayerCar extends PhysicsCar{
	constructor(scene, x, y, z, color) {
		super(scene, x, y, z, color);
        this._actor = KeyboardActor.instance;
        this._actor.init(this, scene.main.keyHandler);
        // this.actor = MobileActor.instance;
	}
}