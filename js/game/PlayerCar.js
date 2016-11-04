class PlayerCar extends NewCar{
	constructor(scene, x, y, z, color) {
		super(scene, x, y, z, color);
        this._actor = KeyboardActor.instance;
        //dit moet niet gecomment zijn this._actor.init(this, scene.main.keyHandler);
        // this.actor = MobileActor.instance;
	}
}