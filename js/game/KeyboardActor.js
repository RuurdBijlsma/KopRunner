class KeyboardActor extends Actor {
    init(car, keyHandler = MAIN.keyHandler) {
        //Car controls
        keyHandler.setSingleKey("w", "Accelerate car", [
            () => car.startAccelerating(),
            () => car.stopMotor()
        ]);
        keyHandler.setSingleKey("s", "Decelerate car", [
            () => car.startDecelerating(),
            () => car.stopMotor()
        ]);
        keyHandler.setSingleKey("ArrowUp", "Accelerate car", [
            () => car.startAccelerating(),
            () => car.stopMotor()
        ]);
        keyHandler.setSingleKey("ArrowDown", "Decelerate car", [
            () => car.startDecelerating(),
            () => car.stopMotor()
        ]);
        keyHandler.setContinuousKey("Shift", "Activate boost", [
            () => car.boost()
        ]);
        keyHandler.setContinuousKey(" ", "Jump car", [
            () => car.jump()
        ]);
        keyHandler.setContinuousKey("ArrowLeft", "Turn left", [
            () => car.turn(1),
            () => car.setWheels(0)
        ]);
        keyHandler.setContinuousKey("ArrowRight", "Turn right", [
            () => car.turn(-1),
            () => car.setWheels(0)
        ]);
        keyHandler.setContinuousKey("a", "Turn left", [
            () => car.turn(1),
            () => car.setWheels(0)
        ]);
        keyHandler.setContinuousKey("d", "Turn right", [
            () => car.turn(-1),
            () => car.setWheels(0)
        ]);


        keyHandler.setSingleKey("/", "Show keymap", [
            () => this.showKeyMap()
        ]);
        keyHandler.setSingleKey("t", "Switch camera", [
            () => MAIN.scene.toggleCamera()
        ]);
        keyHandler.setSingleKey("Delete", "Reset car", [
            () => {
                car.setPosition();
                car.setRotation();
                car.wheelDirection = 0;
            }
        ]);
        keyHandler.setSingleKey("Backspace", "Fix car rotation", [
            () => {
                car.setPosition(car.mesh.position.x, car.mesh.position.y + 1, car.mesh.position.z);
                car.setRotation();
                car.wheelDirection = 0;
            }
        ]);
        keyHandler.setSingleKey("r", "Add random cop", [
            () => MAIN.game.addRandomCopper()
        ]);
        keyHandler.setSingleKey("l", "Light up the world", [
            () => MAIN.scene.lights.ambient.intensity = 1,
            () => MAIN.scene.lights.ambient.intensity = 0,
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
