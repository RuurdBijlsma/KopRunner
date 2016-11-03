/**
 * Created by jornv on 10/30/2016.
 */
class DeviceOrientationState extends Singleton {
    setup() {
        this.rotationDetected = false;
        this.angleX = -1;
        this.angleY = -1;
        this.angleZ = -1;

        window.addEventListener("deviceorientation", DeviceOrientationState.onDeviceRotation, false);
        console.log("create");
    }

    static onDeviceRotation(event) {
        // Scope is window, so we need to directly point to this class
        DeviceOrientationState.instance.rotationDetected = true;
        DeviceOrientationState.instance.angleX = event.alpha * Math.PI / 180;
        DeviceOrientationState.instance.angleY = event.beta  * Math.PI / 180;
        DeviceOrientationState.instance.angleZ = event.gamma * Math.PI / 180;
    }
}