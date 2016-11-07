class Scene extends Physijs.Scene {
    constructor(renderElement, main) {
        // Physijs.scripts.worker = './js/physijs/physijs_worker.js';
        // Physijs.scripts.ammo = './ammo.js';
        super();
        let scene = this;
        this.main = main;
        this.setGravity(new THREE.Vector3(0, -20, 0));

        this.renderElement = renderElement;
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.offsetWidth / this.renderElement.offsetHeight, 0.1, 10000);

        this.renderer = new THREE.WebGLRenderer({
            maxLights: 6,
            alpha: false,
            antialias: true
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.renderElement.appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.onWindowResize());





        this.lights = {
             // ambient: new AmbientLight(this),
             // directional: new DirectionalLight(this, 20, 11, 5)
        };

        this.skyBox = new SkyBox(this, 'img/skybox/space/');

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        this.toggleCamera();

        this.render();
        this.simulate();
        main.loop.add(() => this.simulate());
    }

    updateCamera() {
        this.camera.position.set(0, 5, this.cDown ? 10 : -10);

        let newCameraY = this.camera.getWorldPosition().y,
            floorHeight = tileYlevel + 5;
        if (newCameraY < floorHeight)
            this.camera.position.set(0, 5 + floorHeight - newCameraY, this.cDown ? 10 : -10);

        this.camera.lookAt(new THREE.Vector3(0, 0, this.cDown ? -10 : 10));
    }

    toggleCamera() {
        if (window.MAIN && MAIN.keyHandler) {
            MAIN.keyHandler.deleteSingleKey('c');
            if (!this.cameraStatus) {
                this.cameraStatus = 1;
                if (this.gameView)
                    this.main.loop.remove(this.gameView);
                this.gameView = this.main.loop.add(() => this.updateCamera());
                MAIN.game.car.mesh.add(this.camera);

                MAIN.keyHandler.setSingleKey('c', 'Reverse camera view', [() => this.cDown = true, () => this.cDown = false]);
            } else if (this.cameraStatus === 1) {
                this.cameraStatus = true;
                MAIN.game.car.mesh.remove(this.camera)
                this.gameView = this.main.loop.remove(this.gameView);
                this.controls = new THREE.OrbitControls(this.camera, this.renderElement);
                this.camera.lookAt(new THREE.Vector3);
            } else {
                this.cameraStatus = false;
                if (this.gameView)
                    this.main.loop.remove(this.gameView);
                this.gameView = this.main.loop.add(() => this.gtaCamera());
            }
        }
    }

    gtaCamera() {
        if (MAIN.game.car) {
            let height = 50;
            let carPos = MAIN.game.car.mesh.position;
            this.camera.position.copy(carPos.clone().add(new THREE.Vector3(0, height, 0)));
            this.camera.lookAt(carPos.clone());
        }
    }

    render() {
        this.stats.begin();
        this.renderer.render(this, this.camera);
        this.stats.end();
        requestAnimationFrame(() => this.render());
    }

    onWindowResize() {
        this.camera.aspect = this.renderElement.offsetWidth / this.renderElement.offsetHeight;
        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.camera.updateProjectionMatrix();
    }
}
