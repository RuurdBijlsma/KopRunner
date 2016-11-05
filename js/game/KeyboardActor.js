class KeyboardActor extends Actor {
    init(cars, keyHandler = MAIN.keyHandler) {
        //Car controls
        keyHandler.setSingleKey("w", "Accelerate car", [
            () => cars.map(car => car.startAccelerating()),
            () => cars.map(car => car.stopMotor())
        ]);
        keyHandler.setSingleKey("s", "Decelerate car", [
            () => cars.map(car => car.startDecelerating()),
            () => cars.map(car => car.stopMotor())
        ]);
        keyHandler.setSingleKey("ArrowUp", "Accelerate car", [
            () => cars.map(car => car.startAccelerating()),
            () => cars.map(car => car.stopMotor())
        ]);
        keyHandler.setSingleKey("ArrowDown", "Decelerate car", [
            () => cars.map(car => car.startDecelerating()),
            () => cars.map(car => car.stopMotor())
        ]);
        keyHandler.setContinuousKey("Shift", "Activate boost", () => cars.map(car => car.boost()));
        keyHandler.setContinuousKey(" ", "Jump car", () => cars.map(car => car.jump()));
        keyHandler.setContinuousKey("ArrowLeft", "Turn left", () => cars.map(car => car.turn(1)));
        keyHandler.setContinuousKey("ArrowRight", "Turn right", () => cars.map(car => car.turn(-1)));
        keyHandler.setContinuousKey("a", "Turn left", () => cars.map(car => car.turn(1)));
        keyHandler.setContinuousKey("d", "Turn right", () => cars.map(car => car.turn(-1)));

        //temp misschien hopelijk
        keyHandler.setSingleKey("t", "Switch camera", [
            () => MAIN.scene.toggleCamera()
        ]);
    }

    disable(car) {
        MAIN.keyHandler.deleteSingleKey("w");
        MAIN.keyHandler.deleteSingleKey("s");
        MAIN.keyHandler.deleteSingleKey("a");
        MAIN.keyHandler.deleteSingleKey("d");
        MAIN.keyHandler.deleteSingleKey("ArrowUp");
        MAIN.keyHandler.deleteSingleKey("ArrowDown");
        MAIN.keyHandler.deleteSingleKey("ArrowLeft");
        MAIN.keyHandler.deleteSingleKey("ArrowRight");
        MAIN.keyHandler.deleteContinuousKey("Shift");
        MAIN.keyHandler.deleteContinuousKey(" ");
    }


    driveCar(car) {
        // Don't need to take action every frame when using the keyboard
    }

}
