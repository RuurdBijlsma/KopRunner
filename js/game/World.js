
const mapSize = 7; //MUST BE ODD NUMBER
const tileSize = 15;
const tileHeight = 0.1;
const aiNodePerBlock = 10;
const tileYlevel = 5;
const detailRadius = 1; //MUST BE SMALLER THAN mapSize!




class World{
	constructor()
	{
        this.map = [];
        this.createMap();
	}

    createMap()
    {
        for(let x = 0; x < mapSize; ++x)
        {
            let row = [];
            for(let y = 0; y < mapSize; ++y)
            {
                row.push(new WorldTile(x,y, '4way'));
            }
            this.map.push(row);
        }

        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {

                if(y != 0)
                    this.map[x][y].north = this.map[x][y - 1];
                else this.map[x][y].north = null;
                if(y != mapSize - 1)
                    this.map[x][y].south = this.map[x][y + 1];
                else this.map[x][y].south = null;
                if(x != 0)
                    this.map[x][y].west = this.map[x - 1][y];
                else this.map[x][y].west = null;
                if(x != mapSize - 1)
                    this.map[x][y].east = this.map[x + 1][y];
                else this.map[x][y].east = null;
            }
        }

        this.recalculatePaths();

            let t2 = this.findPath(this.map[0][0].detailedAINodes[0][0], this.map[mapSize - 1][mapSize - 1].detailedAINodes[aiNodePerBlock - 1][aiNodePerBlock - 1]);

            let geom = new THREE.CylinderGeometry(0.1,0.1,6,8,8);
            let mat2 = new THREE.MeshPhongMaterial({ color: "yellow"});
            let mesh = new THREE.Mesh(geom,mat2);

            for(let k of t2)
            {
                let m = mesh.clone();
                m.position.set(k.worldPosition.x, 0, k.worldPosition.y);
                MAIN.scene.add(m);
            }
    }

    static getDistance(nodeA, nodeB) {
        let dstX = Math.abs(nodeA.worldPosition.x - nodeB.worldPosition.x);
        let dstY = Math.abs(nodeA.worldPosition.y - nodeB.worldPosition.y);

        if (dstX > dstY)
            return 14*dstY + 10* (dstX-dstY);
        return 14*dstX + 10 * (dstY-dstX);
    }

    recalculatePaths()
    {
        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;
                sainode.neighbours = [];

                for(let x = 0; x < aiNodePerBlock; ++x)
                {
                    for(let y = 0; y < aiNodePerBlock; ++y)
                    {
                        tile.detailedAINodes[x][y].neighbours = [];
                    }
                }
            }
        }

        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;


                if(tile.west != null)
                    sainode.neighbours.push(tile.west.singleAINode);
                if(tile.east != null)
                    sainode.neighbours.push(tile.east.singleAINode);
                if(tile.south != null)
                    sainode.neighbours.push(tile.south.singleAINode);
                if(tile.north != null)
                    sainode.neighbours.push(tile.north.singleAINode);

                for(let xt = 0; xt < aiNodePerBlock; ++xt)
                {
                    for(let yt = 0; yt < aiNodePerBlock; ++yt)
                    {

                        if(xt - 1 >= 0)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt - 1][yt]);
                        if(xt + 1 <= aiNodePerBlock - 1)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt + 1][yt]);
                        if(yt - 1 >= 0)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt - 1]);
                        if(yt + 1 <= aiNodePerBlock - 1)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt + 1]);

                        if(xt == 0 && tile.west != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.west.detailedAINodes[aiNodePerBlock - 1][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.west.singleAINode);
                            tile.west.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                        }


                        if(xt == aiNodePerBlock - 1 && tile.east != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.east.detailedAINodes[0][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.east.singleAINode);
                            tile.east.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                        }

                        if(yt == 0 && tile.north != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.north.detailedAINodes[xt][aiNodePerBlock - 1]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.north.singleAINode);
                            tile.north.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                        }

                        if(yt == aiNodePerBlock - 1 && tile.south != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.south.detailedAINodes[xt][0]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.south.singleAINode);
                            tile.south.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                        }
                    }
                }
            }
        }
    }

    precalculatedPaths()
    {
        let detailSet = this.getDetailSet();

        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;
                sainode.neighbours = [];

                for(let x = 0; x < aiNodePerBlock; ++x)
                {
                    for(let y = 0; y < aiNodePerBlock; ++y)
                    {
                        tile.detailedAINodes[x][y].neighbours = [];
                    }
                }
            }
        }

        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;

                let midpoint = Math.floor(aiNodePerBlock / 2);

                if(!detailSet.has(tile))
                {
                    tile.detailedAINodes[midpoint][midpoint].neighbours.push(sainode);

                    if(tile.west != null)
                        sainode.neighbours.push(tile.west.singleAINode);
                    if(tile.east != null)
                        sainode.neighbours.push(tile.east.singleAINode);
                    if(tile.south != null)
                        sainode.neighbours.push(tile.south.singleAINode);
                    if(tile.north != null)
                        sainode.neighbours.push(tile.north.singleAINode);
                }

                for(let xt = 0; xt < aiNodePerBlock; ++xt)
                {
                    for(let yt = 0; yt < aiNodePerBlock; ++yt)
                    {

                        if(xt - 1 >= 0)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt - 1][yt]);
                        if(xt + 1 <= aiNodePerBlock - 1)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt + 1][yt]);
                        if(yt - 1 >= 0)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt - 1]);
                        if(yt + 1 <= aiNodePerBlock - 1)
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt + 1]);

                        if(xt == 0 && tile.west != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.west.detailedAINodes[aiNodePerBlock - 1][yt]);

                            if(detailSet.has(tile.west))
                            {
                                tile.detailedAINodes[xt][yt].neighbours.push(tile.west.singleAINode);
                                tile.west.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                            }
                        }


                        if(xt == aiNodePerBlock - 1 && tile.east != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.east.detailedAINodes[0][yt]);
                            if(detailSet.has(tile.east))
                            {
                                tile.detailedAINodes[xt][yt].neighbours.push(tile.east.singleAINode);
                                tile.east.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                            }
                        }

                        if(yt == 0 && tile.north != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.north.detailedAINodes[xt][aiNodePerBlock - 1]);
                            if(detailSet.has(tile.north))
                            {
                                tile.detailedAINodes[xt][yt].neighbours.push(tile.north.singleAINode);
                                tile.north.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                            }
                        }

                        if(yt == aiNodePerBlock - 1 && tile.south != null)
                        {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.south.detailedAINodes[xt][0]);
                            if(detailSet.has(tile.south))
                            {
                                tile.detailedAINodes[xt][yt].neighbours.push(tile.south.singleAINode);
                                tile.south.singleAINode.neighbours.push(tile.detailedAINodes[xt][yt]);
                            }
                        }
                    }
                }
            }
        }
    }


    getDetailSet()
    {
        let midpoint = Math.floor(mapSize / 2);
        let m = new Map();
        for(let x = -detailRadius; x <= detailRadius; ++x)
        {
            for(let y = -detailRadius; y <= detailRadius; ++y)
            {
                m.set(this.map[midpoint + x][midpoint + y], true);
            }
        }
        return m;
    }

    getDetailMapSet()
    {
        let m = new Map();

        let midpoint = Math.floor(mapSize / 2);

        for(let x = -detailRadius; x <= detailRadius; ++x)
        {
            for(let y = -detailRadius; y <= detailRadius; ++y)
            {
                let tile = this.map[midpoint + x][midpoint + y];
                m.set(tile.singleAINode, true);

                for(let xt = 0; xt < aiNodePerBlock; ++xt)
                {
                    for(let yt = 0; yt < aiNodePerBlock; ++yt)
                    {
                        m.set(tile.detailedAINodes[xt][yt], true);
                    }
                }

            }
        }
        return m;
    }

    getSimpleSet()
    {
        let arr = this.getDetailSet();
        let arr2 = [];
        for(let x = 0; x < mapSize; ++x)
        {
            for(let y = 0; y < mapSize; ++y)
            {
                if(!arr.has(this.map[x][y]))
                    arr2.push(this.map[x][y]);
            }
        }
        return arr2;
    }

    getSearchRepresentation()
    {
        let m = new Map();
        let detail = this.getDetailMapSet();
        let term = mapSize * mapSize * tileSize * tileSize * aiNodePerBlock * aiNodePerBlock;
        for(let xt = 0; xt < mapSize; ++xt)
        {
            for(let yt = 0; yt < mapSize; ++yt)
            {
                let tile = this.map[xt][yt];

                m.set(tile.singleAINode, new NodeAstarData(0,0, tile.singleAINode, null));


                if(detail.has(tile.singleAINode))
                {
                    m.get(tile.singleAINode).multiplyFactor = term;
                } else m.get(tile.singleAINode).multiplyFactor = 1;


                for(let x = 0; x < aiNodePerBlock; ++x)
                {
                    for(let y = 0; y < aiNodePerBlock; ++y)
                    {
                        m.set(tile.detailedAINodes[x][y], new NodeAstarData(0,0,tile.detailedAINodes[x][y], null));
                    }
                }
            }
        }
        return m;
    }


    //A* algorithm
    findPath(_start, _goal)
    {
        let closedSet = [];
        let openSet = [];
        openSet.push(_start);

        let mappedData = this.getSearchRepresentation();

        let end = mappedData.get(_goal);


        while(openSet.length > 0)
        {
            let node = openSet[0];
            for(let i = 1; i < openSet.length; ++i)
            {
                if(mappedData.get(openSet[i]).fCost < mappedData.get(node).fCost || mappedData.get(openSet[i]).fCost === mappedData.get(node).fCost)
                {
                    if(mappedData.get(openSet[i]).hCost < mappedData.get(node).hCost)
                        node = openSet[i];
                }
            }
            let index = openSet.indexOf(node);
            if(index >= 0)
                openSet.splice(index,1);
            closedSet.push(node);

            if(mappedData.get(node) === end)
            {
                //return path
                return World.retracePath(_start, node, mappedData);
            }

            for(let neighbour of node.neighbours)
            {
                if(closedSet.includes(neighbour))
                {
                    continue;
                }

                let ncth = mappedData.get(node).gCost + World.getDistance(node, neighbour);
                if(ncth < mappedData.get(neighbour).gCost || !openSet.includes(neighbour))
                {
                    mappedData.get(neighbour).gCost = ncth;
                    mappedData.get(neighbour).hCost = World.getDistance(neighbour, _goal);
                    mappedData.get(neighbour).parent = node;

                    if(!openSet.includes(neighbour))
                    {
                        openSet.push(neighbour);
                    }
                }
            }
        }
    }

    static retracePath(start, goal, data)
    {
        let path = [];
        let node = goal;

        while(node != start)
        {
            path.push(node);
            node = data.get(node).parent;

        }
        path.push(start);
        path.reverse();
        return path;
    }





}