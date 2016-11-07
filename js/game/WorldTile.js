
class WorldTile {
    constructor(_x, _z, _texture_name) {
        // let geom = new THREE.BoxGeometry(tileSize, tileHeight, tileSize);
        // let mat = new THREE.MeshPhongMaterial({ map: _texture });
        this.texture_name = _texture_name;
        WorldTile.tileCount = WorldTile.tileCount || 0;
        console.log(++WorldTile.tileCount + ' / ' + mapSize ** 2);
        this.texture = TextureMap.instance.map[this.texture_name].texture;

        this.channelsImage = this.texture_name + ".channels";
        this.mesh = this.generateMeshFromHeightMap();
        this.mesh.position.set(_x * tileSize + tileSize / 2 - halfMapSize, 0, _z * tileSize + tileSize / 2 - halfMapSize);

        Object.defineProperty(this, "x", { value: _x, writable: false });
        Object.defineProperty(this, "z", { value: _z, writable: false });
        Object.defineProperty(this, "worldX", { value: _x * tileSize, writable: false });
        Object.defineProperty(this, "worldZ", { value: _z * tileSize, writable: false });

        if (showDebugMeshes) {
            let g = new THREE.SphereGeometry(1, 10, 10);
            let mat2 = new THREE.MeshPhongMaterial({ color: "blue" });
            let mesh2 = new THREE.Mesh(g, mat2);
            MAIN.scene.add(mesh2);
            mesh2.position.set(this.worldX - halfMapSize, tileYlevel, this.worldZ - halfMapSize);
        }

        this._neighbours = new Array(4);
        //this.generateAStarNodes();

        this.generateSimpleAStar();

        this._connections = connectionsDictionary[this.texture_name];

        this.generateBuildings();

        MAIN.scene.add(this.mesh);
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

    set northConnectable(connectable) {
        this.connections[0] = connectable;
    }

    set eastConnectable(connectable) {
        this.connections[1] = connectable;
    }

    set southConnectable(connectable) {
        this.connections[2] = connectable;
    }

    set westConnectable(connectable) {
        this.connections[3] = connectable;
    }

    get northConnectable() {
        return this.connections[0];
    }

    get eastConnectable() {
        return this.connections[1];
    }

    get southConnectable() {
        return this.connections[2];
    }

    get westConnectable() {
        return this.connections[3];
    }

    //set and getters for tiles. null == no tile
    set northTile(tile) {
        this.neighbours[0] = tile;
    }

    set eastTile(tile) {
        this.neighbours[1] = tile;
    }

    set southTile(tile) {
        this.neighbours[2] = tile;
    }

    set westTile(tile) {
        this.neighbours[3] = tile;
    }

    get northTile() {
        return this.neighbours[0];
    }

    get eastTile() {
        return this.neighbours[1];
    }

    get southTile() {
        return this.neighbours[2];
    }

    get westTile() {
        return this.neighbours[3];
    }

    get connections() {
        return this._connections;
    }

    get neighbours() {
        return this._neighbours;
    }

    static rotateMatrix(matrix) {
        let length = matrix.length;
        let ret = new Array(length);
        ret.fill(new Array(length));

        for (let i = 0; i < length; ++i) {
            for (let j = 0; j < length; ++j) {
                ret[i][j] = matrix[length - j - 1][i];
            }
        }
        return ret;
    }

    generateMeshFromHeightMap() {
        let fetcher = new PixelFetcher(this.channelsImage);

        let verticesPerAxis = aiNodePerBlock * 4;
        let geometry = new THREE.PlaneGeometry(tileSize, tileSize, verticesPerAxis, verticesPerAxis);

        for (let vertex of geometry.vertices) {
            let posX = ((vertex.x + (tileSize + 1) / 2) * ((fetcher.context.canvas.width) / (tileSize + 1)));
            let posY = ((vertex.y + (tileSize + 1) / 2) * ((fetcher.context.canvas.height) / (tileSize + 1)));
            vertex.z = fetcher.getPixelR(posX, posY) / 128;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
            map: this.texture,
            bumpMap: this.texture,
            bumpScale: 0.025,
            shininess: 5
        }), 0.8, 0.2);

        let ground = new Physijs.HeightfieldMesh(geometry, material, 0, this.channelsImage.width, this.channelsImage.height);
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
        let pixelsX = fetcher.context.canvas.width / aiNodePerBlock,
            pixelsZ = fetcher.context.canvas.height / aiNodePerBlock;
        for (let x = 0; x < aiNodePerBlock; ++x) {
            for (let y = 0; y < aiNodePerBlock; ++y) {
                this.detailedAINodes[x][y].densityFactor = fetcher.getPixelA(x * pixelsX, y * pixelsZ);
                this.detailedAINodes[x][y].localPosition = { x: x, y: y };
                this.detailedAINodes[x][y].worldPosition = {
                    x: this.worldX + (tileSize / aiNodePerBlock) * x - halfMapSize,
                    y: this.worldZ + (tileSize / aiNodePerBlock) * y - halfMapSize
                };
            }
        }
        let a = fetcher.getPixelA(fetcher.context.canvas.width / 2, fetcher.context.canvas.height / 2);
        this.singleAINode = new AStarNode();
        this.singleAINode.densityFactor = a;
        this.singleAINode.localPosition = { x: -1, y: -1 };
        this.singleAINode.worldPosition = { x: this.worldX + tileSize / 2 - halfMapSize, y: this.worldZ + tileSize / 2 - halfMapSize };

        if (showDebugMeshes) {
            let g1 = new THREE.CylinderGeometry(1, 1, 5, 10, 10);
            let mat2 = new THREE.MeshPhongMaterial({ color: "red" });
            let mesh2 = new THREE.Mesh(g1, mat2);
            MAIN.scene.add(mesh2);
            mesh2.position.set(this.singleAINode.worldPosition.x, tileYlevel, this.singleAINode.worldPosition.y);

            let g = new THREE.SphereGeometry(0.1, 10, 10);
            let mat = new THREE.MeshPhongMaterial({ color: "green" });
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

    generateSimpleAStar()
    {
        let pf = new PixelFetcher(this.channelsImage);
        let a = pf.getPixelG(pf.context.canvas.width / 2, pf.context.canvas.width / 2);
        this.singleAINode = new AStarNode();
        this.singleAINode.densityFactor = a;
        this.singleAINode.localPosition = { x: -1, y: -1 };
        this.singleAINode.worldPosition = { x: this.worldX + tileSize / 2 - halfMapSize, y: this.worldZ + tileSize / 2 - halfMapSize };
    }

    generateBuildings() {
        let fetcher = new PixelFetcher(this.channelsImage);

        let geom = new THREE.CubeGeometry(1, 1, 1);

        let mesh = new Physijs.BoxMesh(geom, new THREE.MeshStandardMaterial(), 0);

        let BuildingCount = Math.floor(((Math.random() * (500 - 1)) + 1) / 5);

        let arr = [];

        for (let i = 0; i < BuildingCount; ++i) {


            let rot = Math.random() * Math.PI * 2;
            let size = Math.floor((Math.random() * (tileSize / 3 - tileSize / 16)) + tileSize / 16);
            let ySize = Math.floor((Math.random() * (64 - 10)) + 10);

            let x = Math.floor((Math.random() * (tileSize / 2 - 1)) + 1);
            let y = Math.floor((Math.random() * (tileSize / 2 - 1)) + 1);

            if (Math.random() < 0.5)
                x = -x;
            if (Math.random() < 0.5)
                y = -y;

            //kan het of kan het niet?

            let midx = this.worldX - halfMapSize + tileSize / 2;
            let midy = this.worldZ - halfMapSize + tileSize / 2;

            let tx = fetcher.context.canvas.width / tileSize * (x + tileSize / 2);
            let ty = fetcher.context.canvas.height / tileSize * (y + tileSize / 2);

            if (fetcher.getPixelB(tx, ty) == 0)
                continue;

            arr.push(mesh.clone());

            let v = Math.random() * (1.0 - 0.5) + 0.5;
            let clone = arr[arr.length - 1];
            clone.material.color.setRGB(0, 0, v);

            clone.rotation.y = rot;
            clone.scale.x = size;
            clone.scale.z = arr[arr.length - 1].scale.x;
            clone.scale.y = ySize;

            clone.position.x = midx + x;
            clone.position.z = midy + y;

            clone.mass = 0;

            MAIN.scene.add(clone);
        }
    }

}
