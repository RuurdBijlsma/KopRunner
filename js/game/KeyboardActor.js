class KeyboardActor extends Actor {
    init(car, keyHandler = MAIN.keyHandler) {
        keyHandler.setContinuousKey("w", "Accelerate car", () => car.accelerate());
        keyHandler.setContinuousKey("s", "Decelerate car", () => car.decelerate());
        keyHandler.setContinuousKey("a", "Turn left", () => car.turnWheel(-1.13));
        keyHandler.setContinuousKey("d", "Turn right", () => car.turnWheel(1.13));
        keyHandler.setContinuousKey("ArrowUp", "Accelerate car", () => car.accelerate());
        keyHandler.setContinuousKey("ArrowDown", "Decelerate car", () => car.decelerate());
        keyHandler.setContinuousKey("ArrowLeft", "Turn left", () => car.turnWheel(-1.13));
        keyHandler.setContinuousKey("ArrowRight", "Turn right", () => car.turnWheel(1.13));
        keyHandler.setContinuousKey("Shift", "Activate boost", () => car.boost());
        keyHandler.setContinuousKey(" ", "Jump car", () => car.jump());
    }

    disable(car) {
        MAIN.keyHandler.deleteContinuousKey("w");
        MAIN.keyHandler.deleteContinuousKey("s");
        MAIN.keyHandler.deleteContinuousKey("a");
        MAIN.keyHandler.deleteContinuousKey("d");
        MAIN.keyHandler.deleteContinuousKey("ArrowUp");
        MAIN.keyHandler.deleteContinuousKey("ArrowDown");
        MAIN.keyHandler.deleteContinuousKey("ArrowLeft");
        MAIN.keyHandler.deleteContinuousKey("ArrowRight");
        MAIN.keyHandler.deleteContinuousKey("Shift");
        MAIN.keyHandler.deleteContinuousKey(" ");
    }


    driveCar(car) {
        // Don't need to take action every frame when using the keyboard
    }

}
