class KeyboardActor extends Actor {
    init(cars, keyHandler = MAIN.keyHandler) {

        // keyHandler.setSingleKey("w", "Accelerate car", [
        //     () => cars.map(car => car.startAccelerating()),
        //     () => cars.map(car => car.stopAccelerating())
        // ]);
        // keyHandler.setSingleKey("s", "Decelerate car", [
        //     () => cars.map(car => car.startDecelerating()),
        //     () => cars.map(car => car.stopAccelerating())
        // ]);
        // keyHandler.setSingleKey("a", "Turn left", [
        //     () => cars.map(car => car.startTurning(-1)),
        //     () => cars.map(car => car.stopTurningLeft())
        // ]);
        // keyHandler.setSingleKey("d", "Turn right", [
        //     () => cars.map(car => car.startTurning(1)),
        //     () => cars.map(car => car.stopTurningRight())
        // ]);
        // keyHandler.setSingleKey("ArrowUp", "Accelerate car", [
        //     () => cars.map(car => car.startAccelerating()),
        //     () => cars.map(car => car.stopAccelerating())
        // ]);
        // keyHandler.setSingleKey("ArrowDown", "Decelerate car", [
        //     () => cars.map(car => car.startDecelerating()),
        //     () => cars.map(car => car.stopAccelerating())
        // ]);
        // keyHandler.setSingleKey("ArrowLeft", "Turn left", [
        //     () => cars.map(car => car.startTurning(-1)),
        //     () => cars.map(car => car.stopTurningLeft())
        // ]);
        // keyHandler.setSingleKey("ArrowRight", "Turn right", [
        //     () => cars.map(car => car.startTurning(1)),
        //     () => cars.map(car => car.stopTurningRight())
        // ]);
        // keyHandler.setContinuousKey("Shift", "Activate boost",
        //     () => cars.map(car => car.boost())
        // );
        // keyHandler.setContinuousKey(" ", "Jump car",
        //     () => cars.map(car => car.jump())
        // );
        // let car = cars[0];
        // keyHandler.setContinuousKey("w", "Accelerate car", () => car.accelerate());
        // keyHandler.setContinuousKey("s", "Decelerate car", () => car.brake());
        // keyHandler.setContinuousKey("a", "Turn left", () => car.turn(1));
        // keyHandler.setContinuousKey("d", "Turn right", () => car.turn(-1));
        // keyHandler.setContinuousKey("ArrowUp", "Accelerate car", () => car.accelerate());
        // keyHandler.setContinuousKey("ArrowDown", "Decelerate car", () => car.decelerate());
        // keyHandler.setContinuousKey("ArrowLeft", "Turn left", () => car.turnWheel(-1.13));
        // keyHandler.setContinuousKey("ArrowRight", "Turn right", () => car.turnWheel(1.13));
        // keyHandler.setContinuousKey("Shift", "Activate boost", () => car.boost());
        // keyHandler.setContinuousKey(" ", "Jump car", () => car.jump());
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
