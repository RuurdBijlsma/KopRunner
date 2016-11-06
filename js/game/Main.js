class Main {
    constructor(renderElement) {
        new TextureMap().onLoad = () => this.initialize();
        this.loop = new GameLoop(120);
        this.keyHandler = new KeyHandler(this.loop);
        this.scene = new Scene(renderElement, this);
    }

    initialize() {
        this.game = new Game();
        this.game.start();
    }

    animateObject(object, newPos, time = 1000, target = null, easing = TWEEN.Easing.Quartic.InOut) {
        let updater = self.setInterval(TWEEN.update);
        return new TWEEN.Tween(object.position)
            .to(newPos, time)
            .onUpdate(function() {
                object.position.set(this.x, this.y, this.z);
                if (target)
                    object.lookAt(target);
            })
            .onComplete(function() {
                clearInterval(updater);
            })
            .easing(easing)
            .start();
    }
}
