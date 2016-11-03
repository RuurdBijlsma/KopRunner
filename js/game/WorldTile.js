class WorldTile{
	constructor(_x,_z, _texture, _texture_url)
	{
		// let geom = new THREE.BoxGeometry(tileSize, tileHeight, tileSize);
		// let mat = new THREE.MeshPhongMaterial({ map: _texture });
		this.texture = _texture;
		this.texture_url = _texture_url;

        this.heightmap = this.texture_url.split(".")[0] + ".heightmap.png";
        this.mesh = this.generateMeshFromHeightMap();
        this.mesh.position.set(_x * tileSize,0,_z * tileSize);

		MAIN.scene.add(this.mesh);

		Object.defineProperty(this,"x", { value: _x, writable: false});
		Object.defineProperty(this,"z", { value: _z, writable: false});

		this._neighbours = [];
		this.generateAStarNodes();
	}

	get x(){
		return this.x.clone();
	}
	get z(){
		return this.z.clone();
	}

	//set and getters for tiles. null == no tile

	set north(tile)	{ this.neighbours[0] = tile; }
	set south(tile)	{ this.neighbours[1] = tile; }
	set west(tile)	{ this.neighbours[2] = tile; }
	set east(tile)	{ this.neighbours[3] = tile; }

	get north()	{ return this.neighbours[0]; }
	get south()	{ return this.neighbours[1]; }
	get west()	{ return this.neighbours[2]; }
	get east()	{ return this.neighbours[3]; }

	get neighbours()	{ return this._neighbours; }

	generateMeshFromHeightMap() {
		let fetcher = new PixelFetcher(this.heightmap);

        let geometry = new THREE.PlaneGeometry(tileSize, tileSize, this.heightmap.width, this.heightmap.height);

        for(let vertex of geometry.vertices) {
            console.log(vertex);
            vertex.z = fetcher.getPixelR(vertex.x, vertex.y) / 255;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let ground = new Physijs.HeightfieldMesh(geometry, new THREE.MeshPhongMaterial({ map: this.texture }), 0, this.heightmap.width, this.heightmap.height);
        ground.rotation.x = Math.PI / -2;
        ground.receiveShadow = true;

        return ground;
    }

	generateAStarNodes()
	{
		this.detailedAINodes = [];
		for(let x = 0; x < AINodeDensityFactor; ++x)
		{
			let row = [];
			for(let y = 0; y < AINodeDensityFactor; ++y)
			{
				row.push(new AStarNode());
			}
			this.detailedAINodes.push(row);
		}

		let fetcher = new PixelFetcher(this.texture_url);

		let pixelsX = this.texture.width / AINodeDensityFactor, pixelsZ = this.texture.height / AINodeDensityFactor;

		for(let x = 0; x < this.texture.width; x += pixelsX)
		{
			for(let y = 0; y < this.texture.height; y += pixelsZ)
			{
				let a = fetcher.getPixelA(x,y);

				let xi = x / pixelsX, yi = y / pixelsZ;
				this.detailedAINodes[xi][yi].densityFactor = a;
			}
		}

		let a = fetcher.getPixelA(this.texture.width / 2, this.texture.height / 2);
		this.singleAINode = new AStarNode();
		this.singleAINode.densityFactor = a;
	}

	getSingleAINode()
	{

	}

	getDetailedAINodes()
	{

	}



}