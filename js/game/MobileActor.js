/**
 * Created by jornv on 10/30/2016.
 */
class MobileActor extends Actor {


    init(car) {
        // Make sure DeviceOrientationState is initialized
        this.deviceOrientantionState = DeviceOrientationState.instance;
    }

    driveCar(car) {
        //noinspection JSSuspiciousNameCombination
        MAIN.scene.camera.rotation.z = this.deviceOrientantionState.angleY + Math.PI / 2;
    }
}
