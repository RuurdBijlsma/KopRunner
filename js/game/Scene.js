class Scene extends Physijs.Scene {
    constructor(renderElement, main) {
        Physijs.scripts.worker = './js/physijs/physijs_worker.js';
        Physijs.scripts.ammo = './ammo.js';
        super();
        let scene = this;
        this.main = main;
        this.setGravity(new THREE.Vector3(0, -30, 0));

        this.renderElement = renderElement;
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

        this.controls = new THREE.OrbitControls(this.camera, renderElement);
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(new THREE.Vector3);

        let floorZ = 366,
            floorX = 150,
            geometry = new THREE.CubeGeometry(1, 2, 1),
            material = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x00ff00 }), 0.8, 2),
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
        this.add(this.floor);
        this.floor.mass = 0;

        this.lights = {
            ambient: new AmbientLight(this),
            directional: new DirectionalLight(this, 20, 11, 5)
        }

        this.skyBox = new SkyBox(this, 'img/skybox/clouds/');

        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        main.loop.add(() => this.simulate());

        let cars = [];
        for (let x = -50; x < 50; x += 100)
            for (let y = -50; y < 50; y += 100)
                cars.push(new PlayerCar(this, x, 3, y));

        this.car = cars[0];

        // main.loop.add(() => this.updateCamera());

        this.car._actor.init(cars, this.main.keyHandler);

        this.render();
    }
    updateCamera() {
        let cameraHeight = 5,
            cameraDistance = 10,
            direction = this.car.getWorldDirection().clone().multiplyScalar(cameraDistance),
            position = this.car.position.clone();

        this.camera.position.set(position.x - direction.x, position.y - direction.y + cameraHeight, position.z - direction.z);
        this.camera.lookAt(position.clone().add(direction));
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
