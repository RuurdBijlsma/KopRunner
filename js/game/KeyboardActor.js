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
        keyHandler.setContinuousKey("Shift", "Activate boost", [
            () => cars.map(car => car.boost())
        ]);
        keyHandler.setContinuousKey(" ", "Jump car", [
            () => cars.map(car => car.jump())
        ]);
        keyHandler.setContinuousKey("ArrowLeft", "Turn left", [
            () => cars.map(car => car.turn(1)),
            () => cars.map(car => car.setWheels(0))
        ]);
        keyHandler.setContinuousKey("ArrowRight", "Turn right", [
            () => cars.map(car => car.turn(-1)),
            () => cars.map(car => car.setWheels(0))
        ]);
        keyHandler.setContinuousKey("a", "Turn left", [
            () => cars.map(car => car.turn(1)),
            () => cars.map(car => car.setWheels(0))
        ]);
        keyHandler.setContinuousKey("d", "Turn right", [
            () => cars.map(car => car.turn(-1)),
            () => cars.map(car => car.setWheels(0))
        ]);


        keyHandler.setSingleKey("/", "Show keymap", [
            () => this.showKeyMap()
        ]);
        keyHandler.setSingleKey("t", "Switch camera", [
            () => MAIN.scene.toggleCamera()
        ]);
        keyHandler.setSingleKey("Delete", "Reset car", [
            () => {
                cars.map(car => car.setPosition());
                cars.map(car => car.setRotation());
                cars.map(car => car.wheelDirection = 0);
            }
        ]);
        keyHandler.setSingleKey("Backspace", "Fix car rotation", [
            () => {
                cars.map(car => car.setPosition(car.mesh.position.x, car.mesh.position.y + 1, car.mesh.position.z));
                cars.map(car => car.setRotation());
                cars.map(car => car.wheelDirection = 0);
            }
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




    showKeyMap() {
        let keyMap = MAIN.keyHandler.keyMap,
            singleKeyElement = document.getElementById('single'),
            continuousKeyElement = document.getElementById('continuous'),
            singleHTML = '<ul>',
            continuousHTML = '<ul>';

        for (let key in keyMap.single)
            singleHTML += `<li>
                        <div class='key'>${key==' '?'Space':key}</div>
                        <div class='bindName'>${keyMap.single[key].name}
                    </li>`;
        singleHTML += '</ul>';

        for (let key in keyMap.continuous)
            continuousHTML += `<li>
                        <div class='key'>${key==' '?'Space':key}</div>
                        <div class='bindName'>${keyMap.continuous[key].name}
                    </li>`;
        continuousHTML += '</ul>';

        singleKeyElement.innerHTML = singleHTML;
        continuousKeyElement.innerHTML = continuousHTML;
        let helpElement = document.getElementById('help');
        if (this.keyDisplay === 'block')
            this.keyDisplay = 'none';
        else
            this.keyDisplay = 'block';
        helpElement.style.display = this.keyDisplay;
    }
}
