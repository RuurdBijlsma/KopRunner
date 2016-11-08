const mapSize = 10;
const tileSize = 60;
const aiNodePerBlock = 10;
const tileYlevel = 5;
const halfMapSize = mapSize * tileSize / 2;
const showDebugMeshes = false;

const connectionsDictionary = {
    "4wayroadrotate0": [true, true, true, true],
    "4wayroadrotate1": [true, true, true, true],
    "4wayroadrotate2": [true, true, true, true],
    "4wayroadrotate3": [true, true, true, true],

    "3wayroadrotate0": [true, true, false, true],
    "3wayroadrotate1": [true, true, true, false],
    "3wayroadrotate2": [false, true, true, true],
    "3wayroadrotate3": [true, false, true, true],

    "2wayroadrotate0": [false, true, false, true],
    "2wayroadrotate1": [true, false, true, false],
    "2wayroadrotate2": [false, true, false, true],
    "2wayroadrotate3": [true, false, true, false],

    "cornerrotate0": [true, false, false, true],
    "cornerrotate1": [true, true, false, false],
    "cornerrotate2": [false, true, true, false],
    "cornerrotate3": [false, false, true, true],

    "grassrotate0": [false, false, false, false],
    "grassrotate1": [false, false, false, false],
    "grassrotate2": [false, false, false, false],
    "grassrotate3": [false, false, false, false],

    "grasshillrotate0": [false, false, false, false],
    "grasshillrotate1": [false, false, false, false],
    "grasshillrotate2": [false, false, false, false],
    "grasshillrotate3": [false, false, false, false],
};




class World {
    constructor() {
        this.map = [];

        // MAIN.loop.add(()=>{console.log(MAIN.game.world.getAINodeOnVector(new THREE.Vector2(MAIN.game.car.mesh.position.x, MAIN.game.car.mesh.position.z)))});

        this.createMap();

        // let testMesh = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshPhongMaterial({color: "pink"}));
        //
        // testMesh.position.copy(this.map[1][1].northTile.mesh.position);
        // MAIN.scene.add(testMesh);
    }

    generatePath()
    {
        let columns = [];
        for(let row = 0; row < mapSize; ++row)
        {
            columns.push([]);
        }



        for(let column = 0; column < mapSize; ++column)
        {
            for(let row = 0; row < mapSize; ++row)
            {
                let arr = columns[column][row] = [];
                for(let i = 0; i < 4; ++i) {
                    arr.push(true);
                }


                if (column === 0)
                    arr[3] = false;
                if (column === mapSize - 1)
                    arr[1] = false;
                if (row === 0)
                    arr[2] = false;
                if (row === mapSize - 1)
                    arr[0] = false;

            }
        }

        let tilesVisited = 0;

        let messedWith = [];
        for(let column = 1; column < mapSize - 1; ++column)
        {
            rowLoop:
            for(let row = 1; row < mapSize - 1; ++row) {
                ++tilesVisited;
                if (Math.random() * 2 > 1)
                    continue;

                let result;
                let count = 0;
                for(let k in connectionsDictionary) {
                    if(Math.random() < 1 / ++count) {
                        result = connectionsDictionary[k];
                    }
                }

                for(let tile of messedWith) {
                    let xDiff = Math.abs(column - tile.column);
                    let yDiff = Math.abs(row - tile.row);

                    if(xDiff + yDiff < 3) {
                        continue rowLoop;
                    }
                }

                columns[column][row] = result;

                columns[column + 1][row][3] = columns[column][row][1];
                columns[column - 1][row][1] = columns[column][row][3];

                columns[column][row + 1][2] = columns[column][row][0];
                columns[column][row - 1][0] = columns[column][row][2];

                /*
                 arr 3 is west
                 arr 2 is zuid
                 arr 1 oost
                 aarr 0 noord
                 */

                messedWith.push({
                    column: column,
                    row: row
                });

            }
        }
        //console.log("visited tiles", tilesVisited);
        return columns;
    }

    createMap() {


        let data = this.generatePath();

        for (let x = 0; x < mapSize; ++x) {
            let row = [];
            for (let y = 0; y < mapSize; ++y) {

                let b = false;

                for(let key in connectionsDictionary)
                {
                    if(connectionsDictionary[key][0] !== data[x][y][0]){
                        b = true;
                        continue;
                    }else b = false;
                    if(connectionsDictionary[key][1] !== data[x][y][1]){
                        b = true;
                        continue;
                    }else b = false;
                    if(connectionsDictionary[key][2] !== data[x][y][2]){
                        b = true;
                        continue;
                    }else b = false;
                    if(connectionsDictionary[key][3] !== data[x][y][3]){
                        b = true;
                        continue;
                    } else b = false;

                    row.push(new WorldTile(x, y, key));
                    break;
                }
                if(b == true) {
                    console.log(data[x][y]);
                    console.log("FAIL");
                }
            }
            this.map.push(row);
        }

        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {

                if (y != 0)
                    this.map[x][y].northTile = this.map[x][y - 1];
                else this.map[x][y].northTile = null;

                if (y != mapSize - 1)
                    this.map[x][y].southTile = this.map[x][y + 1];
                else this.map[x][y].southTile = null;

                if (x != 0)
                    this.map[x][y].westTile = this.map[x - 1][y];
                else this.map[x][y].westTile = null;

                if (x != mapSize - 1)
                    this.map[x][y].eastTile = this.map[x + 1][y];
                else this.map[x][y].eastTile = null;
            }
        }

        this.recalculatePaths();



        // let t2 = this.findPath(this.map[0][0].singleAINode, this.map[mapSize - 1][mapSize - 1].singleAINode);
        // if (showDebugMeshes) {
        //     let geom = new THREE.CylinderGeometry(0.1, 0.1, 6, 8, 8);
        //     let mat2 = new THREE.MeshPhongMaterial({ color: "yellow" });
        //     let mesh = new THREE.Mesh(geom, mat2);
        //     console.log(t2);
        //     if (t2)
        //         for (let k of t2) {
        //             let m = mesh.clone();
        //             m.position.set(k.worldPosition.x, 0, k.worldPosition.y);
        //             MAIN.scene.add(m);
        //         }
        // }


        this.generateSideFaces();
    }

    generateSideFaces() {
        let geom = new THREE.PlaneGeometry(tileSize * mapSize, tileSize, 1, 1);

        let texture = TextureMap.instance.map['skylinerotate2'].texture;
        let mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        let mesh = new Physijs.PlaneMesh(geom, mat);
        mesh.translateY(tileSize / 3);

        let mesh0 = mesh.clone();
        let mesh1 = mesh.clone();
        let mesh2 = mesh.clone();
        let mesh3 = mesh.clone();

        mesh0.translateZ(halfMapSize);
        mesh1.translateZ(-halfMapSize);
        mesh0.rotateY(Math.PI);

        mesh2.translateX(halfMapSize);
        mesh2.rotateY(-Math.PI / 2);

        mesh3.translateX(-halfMapSize);
        mesh3.rotateY(Math.PI / 2);

        MAIN.scene.add(mesh0);
        MAIN.scene.add(mesh1);
        MAIN.scene.add(mesh2);
        MAIN.scene.add(mesh3);

    }

    static getDistance(nodeA, nodeB) {
        let dstX = Math.abs(nodeA.worldPosition.x - nodeB.worldPosition.x);
        let dstY = Math.abs(nodeA.worldPosition.y - nodeB.worldPosition.y);

        if (dstX > dstY)
            return 14 * dstY + 10 * (dstX - dstY);
        return 14 * dstX + 10 * (dstY - dstX);
    }

    recalculatePaths() {
        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;
                sainode.neighbours = [];
            }
        }

        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {
                let tile = this.map[x][y];
                let sainode = tile.singleAINode;

                // if (tile.westTile != null && tile.westConnectable)
                //     sainode.neighbours.push(tile.westTile.singleAINode);
                // if (tile.eastTile != null && tile.eastConnectable)
                //     sainode.neighbours.push(tile.eastTile.singleAINode);
                // if (tile.southTile != null && tile.southConnectable)
                //     sainode.neighbours.push(tile.southTile.singleAINode);
                // if (tile.northTile != null && tile.northConnectable)
                //     sainode.neighbours.push(tile.northTile.singleAINode);

                if (tile.westTile != null)
                    sainode.neighbours.push(tile.westTile.singleAINode);
                if (tile.eastTile != null)
                    sainode.neighbours.push(tile.eastTile.singleAINode);
                if (tile.southTile != null)
                    sainode.neighbours.push(tile.southTile.singleAINode);
                if (tile.northTile != null)
                    sainode.neighbours.push(tile.northTile.singleAINode);

                //console.log(sainode.neighbours);

            }
        }
    }

    getSearchRepresentation() {
        let m = new Map();
        let term = mapSize * mapSize * tileSize * tileSize;
        for (let xt = 0; xt < mapSize; ++xt) {
            for (let yt = 0; yt < mapSize; ++yt) {
                let tile = this.map[xt][yt];

                m.set(tile.singleAINode, new NodeAstarData(0, 0, tile.singleAINode, null));


                if (tile.singleAINode.densityFactor == 0) {
                    m.get(tile.singleAINode).multiplyFactor = term;
                } else m.get(tile.singleAINode).multiplyFactor = 1;
            }
        }
        return m;
    }


    //A* algorithm
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
                return World.retracePath(_start, node, mappedData);
            }

            for (let neighbour of node.neighbours) {
                if (closedSet.includes(neighbour)) {
                    continue;
                }

                let ncth = mappedData.get(node).gCost + World.getDistance(node, neighbour);
                if (ncth < mappedData.get(neighbour).gCost || !openSet.includes(neighbour)) {
                    mappedData.get(neighbour).gCost = ncth;
                    mappedData.get(neighbour).hCost = World.getDistance(neighbour, _goal);
                    mappedData.get(neighbour).parent = node;

                    if (!openSet.includes(neighbour)) {
                        openSet.push(neighbour);
                    }
                }
            }
        }
    }

    static retracePath(start, goal, data) {
        let path = [];
        let node = goal;

        while (node != start) {
            path.push(node);
            node = data.get(node).parent;

        }
        path.push(start);
        path.reverse();
        return path;
    }

    getAINodeOnVector(vector2) {
        let dst = 99999999;
        let tile = null;

        for (let x = 0; x < mapSize; ++x) {
            for (let y = 0; y < mapSize; ++y) {
                let dstX = Math.abs(this.map[x][y].singleAINode.worldPosition.x - vector2.x);
                let dstY = Math.abs(this.map[x][y].singleAINode.worldPosition.y - vector2.y);

                if (dstX > dstY) {
                    let calc = 14 * dstY + 10 * (dstX - dstY) / 1000;
                    dst = calc < dst ? calc : dst;
                    if (calc <= dst)
                        tile = this.map[x][y];
                } else {
                    let calc = 14 * dstX + 10 * (dstY - dstX) / 1000;
                    dst = calc < dst ? calc : dst;
                    if (calc <= dst)
                        tile = this.map[x][y];
                }
            }
        }
        return tile.singleAINode;
    }
}
