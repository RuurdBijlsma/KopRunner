class Scene extends Physijs.Scene {
    constructor(renderElement, main) {
        // Physijs.scripts.worker = './js/physijs/physijs_worker.js';
        // Physijs.scripts.ammo = './ammo.js';
        super();
        let scene = this;
        this.main = main;
        this.setGravity(new THREE.Vector3(0, -20, 0));

        this.renderElement = renderElement;
        console.log(renderElement);
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.offsetWidth / this.renderElement.offsetHeight, 0.1, 10000);

        this.renderer = new THREE.WebGLRenderer({
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

        let floorZ = 366,
            floorX = 150,
            geometry = new THREE.CubeGeometry(1, 2, 1),
            material = new THREE.MeshStandardMaterial({ color: 'green' }),
            floorGeometry = new THREE.CubeGeometry(floorX, 1, floorZ),
            textureLoader = new THREE.TextureLoader(),
            floorMap = textureLoader.load('img/textures/4way.png'),
            floorHeight = textureLoader.load('img/textures/4way.heightmap.png'),
            floorMaterial = new THREE.MeshPhongMaterial({
                shininess: 20,
                bumpMap: floorMap,
                map: floorMap,
                bumpScale: 0.45,
            });
        this.floor = new Physijs.BoxMesh(floorGeometry, floorMaterial);
        floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;

        floorMap.repeat.set(floorX / 50, floorZ / 50);
        this.floor.receiveShadow = true;
        this.floor.mass = 0;
        this.add(this.floor);

        this.lights = {
            ambient: new AmbientLight(this),
            directional: new DirectionalLight(this, 20, 11, 5)
        }

        this.skyBox = new SkyBox(this, 'img/skybox/clouds/');

        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        let cars = [];
        // for (let x = -50; x < 50; x += 100)
        //     for (let y = -50; y < 50; y += 100)
        //         cars.push(new PlayerCar(this, x, 3, y));
        cars.push(new PlayerCar(this, 0, 3, 0));
        this.car = cars[0];
        this.car._actor.init(cars, this.main.keyHandler); //dit moet uncommented worden in de playercar en hier weg

        this.toggleCamera();

        this.render();
        this.simulate();
        main.loop.add(() => this.simulate());
    }

    updateCamera() {
        this.camera.position.set(0, 5, -10);
        
        let newCameraY = this.camera.getWorldPosition().y,
            floorHeight = 5;
        if (newCameraY < floorHeight)
            this.camera.position.set(0, 5 + floorHeight - newCameraY, -10);

        this.camera.lookAt(new THREE.Vector3(0, 0, 10));
    }

    toggleCamera() {
        if (this.gameView) {
            this.car.mesh.remove(this.camera)
            this.gameView = this.main.loop.remove(this.gameView);
            this.controls = new THREE.OrbitControls(this.camera, this.renderElement);
            this.camera.lookAt(new THREE.Vector3);
        } else {
            this.gameView = this.main.loop.add(() => this.updateCamera());
            this.car.mesh.add(this.camera);
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
