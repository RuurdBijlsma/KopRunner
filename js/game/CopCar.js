class CopCar extends Car {
    constructor(scene, x, y, z) {
		super(scene, x, y, z, 'blue');
        this._actor = KeyboardActor.instance;
    }
    driveTo(x, z) {
    	
    }
}
