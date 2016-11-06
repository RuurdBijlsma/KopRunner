const showDebugMeshes = false;

class WorldTile {
    constructor(_x, _z, _texture_name, _rotationAmount = 0) {
        // let geom = new THREE.BoxGeometry(tileSize, tileHeight, tileSize);
        // let mat = new THREE.MeshPhongMaterial({ map: _texture });
        this.texture_name = _texture_name;
        this.texture = TextureMap.instance.map[this.texture_name].texture;

        this.channelsImage = this.texture_name + ".channels";
        this.mesh = this.generateMeshFromHeightMap();
        this.mesh.position.set(_x * tileSize + tileSize / 2 - halfMapSize, 0, _z * tileSize + tileSize /2 - halfMapSize);

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
        this._connections = connectionsDictionary[this.texture_name];

        for(let i = 0; i < _rotationAmount; ++i) {
            this.connections.push(this.connections.shift());
        }

        this.generateAStarNodes();
        this.generateBuildings();
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
        this.neighbours[2] = tile;
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

    generateMeshFromHeightMap() {
        let fetcher = new PixelFetcher(this.channelsImage);

        let verticesPerAxis = aiNodePerBlock * 4;
        let geometry = new THREE.PlaneGeometry(tileSize, tileSize, verticesPerAxis, verticesPerAxis);

        for (let vertex of geometry.vertices) {
            let posX = ((vertex.x + tileSize / 2) * ((fetcher.context.canvas.width + 1)  / (tileSize + 1)));
            let posY = ((vertex.y + tileSize / 2) * ((fetcher.context.canvas.height + 1) / (tileSize + 1)));
            vertex.z = fetcher.getPixelR(posX, posY) / 128;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let ground = new Physijs.HeightfieldMesh(geometry, new THREE.MeshPhongMaterial({map: this.texture}), 0, this.channelsImage.width, this.channelsImage.height);
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

    generateBuildings()
    {
        let fetcher = new PixelFetcher(this.heightmap);

        let geom = new CubeGeometry(1,1,1);
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));
        geom.faces.splice(3,1);

        //uv map fixen
        geom.faceVertexUvs[0][2][0].set( 0, 0 );
        geom.faceVertexUvs[0][2][1].set( 0, 0 );
        geom.faceVertexUvs[0][2][2].set( 0, 0 );
        geom.faceVertexUvs[0][2][3].set( 0, 0 );

        let mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: "white" }));

        let BuildingCount = Math.floor((Math.random() * (5 - 1)) + 1);

        let arr = [];

        for(let i = 0; i < BuildingCount; ++i)
        {

            let rot = Math.random() * Math.PI*2;
            let size = Math.floor((Math.random() * (5-1)) + 1);
            let ySize = Math.floor((Math.random() * (5-1)) + 1);

            let x = Math.floor((Math.random() * (5-1)) + 1);
            let y = Math.floor((Math.random() * (5-1)) + 1);

            arr.push(mesh.clone());
            arr[arr.length - 1].rotation.y = rot;
            arr[arr.length - 1].scale.x = size;
            arr[arr.length - 1].scale.z = geom.scale.x;
            arr[arr.length - 1].scale.y = ySize;

            arr[arr.length - 1].position.x = this.worldX + x;
            arr[arr.length - 1].position.z = this.worldZ + y;

            MAIN.scene.add(arr[arr.length - 1]);
        }
    }

}