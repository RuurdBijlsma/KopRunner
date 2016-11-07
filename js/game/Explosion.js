class Explosion {
    constructor(scene, position) {
        this.meshes = scene.children.filter(c => c._physijs && c.mass !== 0);
    }
}
