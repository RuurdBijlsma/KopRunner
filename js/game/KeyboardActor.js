class KeyboardActor extends Actor {
    init(cars, keyHandler = MAIN.keyHandler) {

        keyHandler.setSingleKey("w", "Accelerate car", [
            () => cars.map(car => car.startMovingForward()),
            () => cars.map(car => car.stopMoving())
        ]);
        keyHandler.setSingleKey("s", "Decelerate car", [
            () => cars.map(car => car.startMovingBackward()),
            () => cars.map(car => car.stopMoving())
        ]);
        keyHandler.setSingleKey("a", "Turn left", [
            () => cars.map(car => car.turnWheel(-1.13)),
            () => cars.map(car => car.turnWheel(0))
        ]);
        keyHandler.setSingleKey("d", "Turn right", [
            () => cars.map(car => car.turnWheel(1.13)),
            () => cars.map(car => car.turnWheel(0))
        ]);
        keyHandler.setSingleKey("ArrowUp", "Accelerate car", [
            () => cars.map(car => car.startMovingForward()),
            () => cars.map(car => car.stopMoving())
        ]);
        keyHandler.setSingleKey("ArrowDown", "Decelerate car", [
            () => cars.map(car => car.startMovingBackward()),
            () => cars.map(car => car.stopMoving())
        ]);
        keyHandler.setSingleKey("ArrowLeft", "Turn left", [
            () => cars.map(car => car.turnWheel(-1.13)),
            () => cars.map(car => car.turnWheel(0))
        ]);
        keyHandler.setSingleKey("ArrowRight", "Turn right", [
            () => cars.map(car => car.turnWheel(1.13)),
            () => cars.map(car => car.turnWheel(0))
        ]);
        keyHandler.setContinuousKey("Shift", "Activate boost",
            () => cars.map(car => car.boost())
        );
        keyHandler.setContinuousKey(" ", "Jump car",
            () => cars.map(car => car.jump())
        );
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
