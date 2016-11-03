class EnvMap {
    constructor(directory) {
        let urls = [directory + 'posx.jpg', directory + 'negx.jpg', directory + 'posy.jpg', directory + 'negy.jpg', directory + 'posz.jpg', directory + 'negz.jpg'],
            cubeTextureLoader = new THREE.CubeTextureLoader();

        this.map = cubeTextureLoader.load(urls);
    }
}
