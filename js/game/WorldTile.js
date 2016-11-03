class WorldTile{
	constructor(_x,_z, _texture, _texture_url)
	{
		let geom = new THREE.BoxGeometry(tileSize, tileHeight, tileSize);

		let mat = new THREE.MeshPhongMaterial({ map: _texture });
		this.mesh = new THREE.Mesh(geom, mat);
		this.mesh.position.set(_x * tileSize + tileSize / 2, tileYlevel ,_z * tileSize + tileSize / 2);
		this.texture_url = _texture_url;
        this.texture = _texture;
		MAIN.scene.add(this.mesh);

		Object.defineProperty(this,"x", { value: _x, writable: false});
		Object.defineProperty(this,"z", { value: _z, writable: false});
        Object.defineProperty(this, "worldX", { value: _x * tileSize, writable: false });
        Object.defineProperty(this, "worldZ", { value: _z * tileSize, writable: false });

        let g = new THREE.SphereGeometry(1,10,10);
        let mat2 = new THREE.MeshPhongMaterial({ color: "blue" });
        let mesh2 = new THREE.Mesh(g, mat2);
        MAIN.scene.add(mesh2);
        mesh2.position.set(this.worldX, tileYlevel, this.worldZ);

		this._neighbours = [];
        this.generateAStarNodes();
	}

	get x(){
		return this.x.clone();
	}
	get z(){
		return this.z.clone();
	}

	get worldX(){
        return this.worldX.clone();
    }
    get worldZ()
    {
        return this.worldZ.clone();
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

	generateAStarNodes()
	{
		this.detailedAINodes = [];
		for(let x = 0; x < aiNodePerBlock; ++x)
		{
			let row = [];
			for(let y = 0; y < aiNodePerBlock; ++y)
			{
				row.push(new AStarNode());
			}
			this.detailedAINodes.push(row);
		}


		let fetcher = new PixelFetcher(this.texture_url);
		let pixelsX = this.texture.image.width / aiNodePerBlock, pixelsZ = this.texture.image.height / aiNodePerBlock;
		for(let x = 0; x < aiNodePerBlock; ++x)
		{
			for(let y = 0; y < aiNodePerBlock; ++y)
			{
				this.detailedAINodes[x][y].densityFactor = fetcher.getPixelA(x * pixelsX,y * pixelsZ);
                this.detailedAINodes[x][y].localPosition = {x: x, y: y};
                this.detailedAINodes[x][y].worldPosition = {x: this.worldX + (tileSize / aiNodePerBlock) * x, y: this.worldZ + (tileSize / aiNodePerBlock) * y };
			}
		}

		let a = fetcher.getPixelA(this.texture.image.width / 2, this.texture.image.height / 2);
        this.singleAINode = new AStarNode();
        this.singleAINode.densityFactor = a;
        this.singleAINode.localPosition = {x: -1, y:-1};
        this.singleAINode.worldPosition = { x: this.worldX + tileSize / 2,y: this.worldZ + tileSize / 2};

        let g1 = new THREE.CylinderGeometry(1,1,5,10,10);
        let mat2 = new THREE.MeshPhongMaterial({ color: "red"});
        let mesh2 = new THREE.Mesh(g1,mat2);
        MAIN.scene.add(mesh2);
        mesh2.position.set(this.singleAINode.worldPosition.x, tileYlevel, this.singleAINode.worldPosition.y );

        let g = new THREE.SphereGeometry(0.1,10,10);
        let mat = new THREE.MeshPhongMaterial({ color: "green" });
        let mesh = new THREE.Mesh(g, mat);

        for(let x = 0; x < aiNodePerBlock; ++x)
        {
            for(let y = 0; y < aiNodePerBlock; ++y)
            {
                let k = this.detailedAINodes[x][y];
                k.mesh = mesh.clone();
                k.mesh.position.set(k.worldPosition.x,tileYlevel,k.worldPosition.y);
                MAIN.scene.add(k.mesh);
            }
        }

	}

	getSingleAINode()
	{

	}

	getDetailedAINodes()
	{

	}



}