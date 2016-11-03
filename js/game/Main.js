class Main {
    constructor(renderElement) {
        new TextureMap;
        this.loop = new GameLoop(120);
        this.keyHandler = new KeyHandler(this.loop);
        this.scene = new Scene(renderElement, this);
    }

    initialize() {
        this.game = new Game();
    }

    animateObject(object, newPos, time = 1000, target = null, easing = TWEEN.Easing.Quartic.InOut) {
        return new TWEEN.Tween(object.position)
            .to(newPos, time)
            .onUpdate(function() {
                object.position.set(this.x, this.y, this.z);
                if (target)
                    object.lookAt(target);
            })
            .easing(easing)
            .start();
    }
}
