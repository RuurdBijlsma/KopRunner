class Explosion {
    constructor(car, config) {
        this.config = config;
        this.car = car;
        this.tex = new THREE.TextureLoader().load('img/textures/smoke.png');

        this.particleGroup = new SPE.Group({
            texture: {
                value: this.tex
            }
        });
        this.clock = new THREE.Clock();
        this.loop = MAIN.loop.add(() => this.update());

        this.initParticles();
        this.emitter.disable();
    }
    start() {
        this.emitter.enable();
        return this;
    }
    stop() {
        this.emitter.disable();
        return this;
    }
    update() {
        let cd = this.clock.getDelta();
        this.particleGroup.tick(cd);
    }
    initParticles() {
        let initConfig = {
            maxAge: {
                value: 2
            },
            position: {
                value: new THREE.Vector3(0, 1.5, 0),
                spread: new THREE.Vector3(0, 0, 0)
            },

            acceleration: {
                value: new THREE.Vector3(0, 0, -10),
                spread: new THREE.Vector3(10, 0, 10)
            },

            velocity: {
                value: new THREE.Vector3(0, 0, -25),
                spread: new THREE.Vector3(10, 7.5, 10)
            },

            color: {
                value: [new THREE.Color('white'), new THREE.Color('red')]
            },

            size: {
                value: 1
            },

            particleCount: 2000
        };
        if (this.config)
            for (let prop in this.config)
                initConfig[prop] = this.config[prop];

        console.log('explosion position: ', initConfig.position);
        this.emitter = new SPE.Emitter(initConfig);

        this.particleGroup.addEmitter(this.emitter);
        this.car.mesh.add(this.particleGroup.mesh);
    }

    dispose() {
        this.stop();
        setTimeout(() => {
            MAIN.loop.remove(this.loop);
            this.car.mesh.remove(this.particleGroup.mesh);
        }, 5000);
    }
}
