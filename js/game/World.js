const mapSize = 7;
const tileSize = 15;
const tileHeight = 0.1;
const aiNodePerBlock = 10;
const tileYlevel = 5;

function getDistance(nodeA, nodeB) {
    let dstX = Math.abs(nodeA.worldPosition.x - nodeB.worldPosition.x);
    let dstY = Math.abs(nodeA.worldPosition.y - nodeB.worldPosition.y);

    if (dstX > dstY)
        return 14 * dstY + 10 * (dstX - dstY);
    return 14 * dstX + 10 * (dstY - dstX);
}


class World {
    constructor() {
        this.map = [];
        this.createMap();
    }

    createMap() {
        let t = new THREE.TextureLoader();
        let mat = t.load('img/textures/4way.png', () => {

            for (let x = 0; x < mapSize; ++x) {
                let row = [];
                for (let y = 0; y < mapSize; ++y) {
                    row.push(new WorldTile(x, y, mat, 'img/textures/4way.png'));
                }
                this.map.push(row);
            }

            for (let i = 0; i < mapSize; ++i) {
                this.map[i][0].north = null;
                this.map[0][i].west = null;
                this.map[i][mapSize - 1].south = null;
                this.map[mapSize - 1][i].east = null;
            }

            for (let x = 1; x < mapSize - 1; ++x) {
                for (let y = 1; y < mapSize - 1; ++y) {
                    this.map[x][y].north = this.map[x][y - 1];
                    this.map[x][y].south = this.map[x][y + 1];

                    this.map[x][y].west = this.map[x - 1][y];
                    this.map[x][y].east = this.map[x + 1][y];
                }
            }

            this.recalculatePaths();

            let t = this.findPath(this.map[0][0].singleAINode, this.map[1][1].singleAINode);

            let geom = new THREE.CylinderGeometry(1, 1, 2, 4, 1);
            let mat2 = new THREE.MeshPhongMaterial({ color: "yellow" });
            let mesh = new THREE.Mesh(geom, mat2);

            for (k of t) {
                let m = mesh.clone();
                m.position.set(k.worldPosition.x, 0, k.worldPosition.z);
                MAIN.scene.add(m);
            }
        });



    }

    recalculatePaths() {
        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {

                let tile = this.map[x][y];
                let sainode = tile.singleAINode;
                sainode.neighbours = [];

                for (let x = 0; x < aiNodePerBlock; ++x) {
                    for (let y = 0; y < aiNodePerBlock; ++y) {
                        tile.detailedAINodes[x][y].neighbours = [];
                    }
                }

                if (tile.west != null)
                    sainode.neighbours.push(tile.west.singleAINode);
                if (tile.east != null)
                    sainode.neighbours.push(tile.east.singleAINode);
                if (tile.south != null)
                    sainode.neighbours.push(tile.south.singleAINode);
                if (tile.north != null)
                    sainode.neighbours.push(tile.north.singleAINode);

                for (let xt = 0; xt < aiNodePerBlock; ++xt) {
                    for (let yt = 0; yt < aiNodePerBlock; ++yt) {
                        if (xt >= 1 && xt < aiNodePerBlock - 1 && yt >= 1 && yt < aiNodePerBlock - 1) {
                            //regular case
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt - 1][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt + 1][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt - 1]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.detailedAINodes[xt][yt + 1]);
                        }

                        if (xt == 0 && tile.west != null) {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.west.detailedAINodes[aiNodePerBlock - 1][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.west.singleAINode);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.singleAINode);
                        }

                        if (xt == aiNodePerBlock - 1 && tile.east != null) {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.east.detailedAINodes[0][yt]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.east.singleAINode);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.singleAINode);
                        }

                        if (yt == 0 && tile.north != null) {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.north.detailedAINodes[xt][aiNodePerBlock - 1]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.north.singleAINode);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.singleAINode);
                        }

                        if (yt == aiNodePerBlock - 1 && tile.south != null) {
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.south.detailedAINodes[xt][0]);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.south.singleAINode);
                            tile.detailedAINodes[xt][yt].neighbours.push(tile.singleAINode);
                        }
                    }
                }
            }
        }
    }


    getDetailSet() {
        let midpoint = Math.floor(mapSize / 2);
        let arr = [];
        for (let x = -1; x <= 1; ++x) {
            for (let y = -1; y <= 1; ++y) {
                arr.push(this.map[midpoint + x][midpoint + y]);
            }
        }
    }

    getSimpleSet() {
        let arr = this.getDetailSet();
        let arr2 = [];
        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {
                if (!arr.contains(this.map[x][y]))
                    arr2.push(this.map[x][y]);
            }
        }
        return arr2;
    }

    getSearchRepresentation() {
        let m = new Map();

        for (let xt = 0; xt < mapSize; ++xt) {
            for (let yt = 0; yt < mapSize; ++yt) {
                let tile = this.map[xt][yt];

                let key = tile.getSingleAINode();
                m.set(key, new NodeAstarData(0, 0, tile.getSingleAINode(), null));

                for (let x = 0; x < aiNodePerBlock; ++x) {
                    for (let y = 0; y < aiNodePerBlock; ++y) {
                        key = tile.detailedAINodes[x][y];
                        m.set(key, new NodeAstarData(0, 0, tile.detailedAINodes[x][y], null));
                    }
                }
            }
        }
        return m;
    }

    findPath(_start, _goal) {
        let closedSet = [];
        let openSet = [];
        openSet.push(_start);

        let mappedData = this.getSearchRepresentation();

        let end = mappedData.get(_goal);


        while (openSet.length > 0) {
            let node = openSet[0];
            for (let i = 1; i < openSet.length; ++i) {
                if (mappedData.get(openSet[i]).fCost < mappedData.get(node).fCost || mappedData.get(openSet[i]).fCost === mappedData.get(node).fCost) {
                    if (mappedData.get(openSet[i]).hCost < mappedData.get(node).hCost)
                        node = openSet[i];
                }
            }
            let index = openSet.indexOf(node);
            if (index >= 0)
                openSet.splice(index, 1);
            closedSet.push(node);

            if (mappedData.get(node) === end) {
                //return path
                return this.retracePath(_start, node, mappedData);
            }

            for (let neighbour of node) {
                if (closedSet.contains(neighbour)) {
                    continue;
                }

                let ncth = mappedData.get(node).gCost + getDistance(node, neighbour);
                if (ncth < mappedData.get(neighbour).gCost || !openSet.contains(neighbour)) {
                    mappedData.get(neighbour).gCost = ncth;
                    mappedData.get(neighbour).hCost = getDistance(neighbour, _goal);
                    mappedData.get(neighbour).parent = node;

                    if (!openSet.contains(neighbour)) {
                        openSet.push(neighbour);
                    }
                }
            }
        }
    }

    retracePath(start, goal, data) {
        let path = [];
        let node = goal;

        while (node != start) {
            path.push(node);
            node = data.get(node).parent;

        }
        path.reverse();
        return path;
    }





}
