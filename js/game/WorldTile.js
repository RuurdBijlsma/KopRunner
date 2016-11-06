const showDebugMeshes = false;

class WorldTile {
    constructor(_x, _z, _texture_name) {
        // let geom = new THREE.BoxGeometry(tileSize, tileHeight, tileSize);
        // let mat = new THREE.MeshPhongMaterial({ map: _texture });
        this.texture_name = _texture_name;
        this.texture = TextureMap.instance.map[this.texture_name].texture;

        this.heightmap = this.texture_name + ".heightmap";
        this.mesh = this.generateMeshFromHeightMap();
        this.mesh.position.set(_x * tileSize + tileSize / 2, 0, _z * tileSize + tileSize /2);

        MAIN.scene.add(this.mesh);

        Object.defineProperty(this, "x", {value: _x, writable: false});
        Object.defineProperty(this, "z", {value: _z, writable: false});
        Object.defineProperty(this, "worldX", {value: _x * tileSize, writable: false});
        Object.defineProperty(this, "worldZ", {value: _z * tileSize, writable: false});

        if(showDebugMeshes) {
            let g = new THREE.SphereGeometry(1, 10, 10);
            let mat2 = new THREE.MeshPhongMaterial({color: "blue"});
            let mesh2 = new THREE.Mesh(g, mat2);
            MAIN.scene.add(mesh2);
            mesh2.position.set(this.worldX, tileYlevel, this.worldZ);
        }

        this._neighbours = new Array(4);
        this.generateAStarNodes();
    }

    get x() {
        return this.x.clone();
    }

    get z() {
        return this.z.clone();
    }

    get worldX() {
        return this.worldX.clone();
    }

    get worldZ() {
        return this.worldZ.clone();
    }


    //set and getters for tiles. null == no tile

    set north(tile) {
        this.neighbours[0] = tile;
    }

    set south(tile) {
        this.neighbours[1] = tile;
    }

    set west(tile) {
        this.neighbours[2] = tile;
    }

    set east(tile) {
        this.neighbours[3] = tile;
    }

    get north() {
        return this.neighbours[0];
    }

    get south() {
        return this.neighbours[1];
    }

    get west() {
        return this.neighbours[2];
    }

    get east() {
        return this.neighbours[3];
    }

    get neighbours() {
        return this._neighbours;
    }

    generateMeshFromHeightMap() {
        console.log(this.heightmap);
        let fetcher = new PixelFetcher(this.heightmap);

        let verticesPerAxis = aiNodePerBlock * 4;
        let geometry = new THREE.PlaneGeometry(tileSize, tileSize, verticesPerAxis, verticesPerAxis);

        for (let vertex of geometry.vertices) {
            let posX = ((vertex.x + tileSize / 2) * ((fetcher.context.canvas.width + 1)  / (tileSize + 1)));
            let posY = ((vertex.y + tileSize / 2) * ((fetcher.context.canvas.height + 1) / (tileSize + 1)));
            vertex.z = fetcher.getPixelR(posX, posY) / 512;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let ground = new Physijs.HeightfieldMesh(geometry, new THREE.MeshPhongMaterial({map: this.texture}), 0, this.heightmap.width, this.heightmap.height);
        ground.rotation.x = Math.PI / -2;
        ground.receiveShadow = true;

        return ground;
    }

    generateAStarNodes() {
        this.detailedAINodes = [];
        for (let x = 0; x < aiNodePerBlock; ++x) {
            let row = [];
            for (let y = 0; y < aiNodePerBlock; ++y) {
                row.push(new AStarNode());
            }
            this.detailedAINodes.push(row);
        }


        let fetcher = new PixelFetcher(this.texture_name);
        let pixelsX = this.texture.image.width / aiNodePerBlock, pixelsZ = this.texture.image.height / aiNodePerBlock;
        for (let x = 0; x < aiNodePerBlock; ++x) {
            for (let y = 0; y < aiNodePerBlock; ++y) {
                this.detailedAINodes[x][y].densityFactor = fetcher.getPixelA(x * pixelsX, y * pixelsZ);
                this.detailedAINodes[x][y].localPosition = {x: x, y: y};
                this.detailedAINodes[x][y].worldPosition = {
                    x: this.worldX + (tileSize / aiNodePerBlock) * x,
                    y: this.worldZ + (tileSize / aiNodePerBlock) * y
                };
            }
        }
        let a = fetcher.getPixelA(this.texture.image.width / 2, this.texture.image.height / 2);
        this.singleAINode = new AStarNode();
        this.singleAINode.densityFactor = a;
        this.singleAINode.localPosition = {x: -1, y: -1};
        this.singleAINode.worldPosition = {x: this.worldX + tileSize / 2, y: this.worldZ + tileSize / 2};

        if(showDebugMeshes) {
            let g1 = new THREE.CylinderGeometry(1, 1, 5, 10, 10);
            let mat2 = new THREE.MeshPhongMaterial({color: "red"});
            let mesh2 = new THREE.Mesh(g1, mat2);
            MAIN.scene.add(mesh2);
            mesh2.position.set(this.singleAINode.worldPosition.x, tileYlevel, this.singleAINode.worldPosition.y);

            let g = new THREE.SphereGeometry(0.1, 10, 10);
            let mat = new THREE.MeshPhongMaterial({color: "green"});
            let mesh = new THREE.Mesh(g, mat);

            for (let x = 0; x < aiNodePerBlock; ++x) {
                for (let y = 0; y < aiNodePerBlock; ++y) {
                    let k = this.detailedAINodes[x][y];
                    k.mesh = mesh.clone();
                    k.mesh.position.set(k.worldPosition.x, tileYlevel, k.worldPosition.y);
                    MAIN.scene.add(k.mesh);
                }
            }
        }

    }
}