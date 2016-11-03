
const mapSize = 7;
const tileSize = 15;
const tileHeight = 0.1;
const AINodeDensityFactor = 5;

class World{
	constructor()
	{
        this.map = [];
        this.createMap();
	}

    createMap()
    {
        let textureLoader = new THREE.TextureLoader();
        let floorMap = textureLoader.load('img/textures/floor.png');

        for(let x = 0; x < mapSize; ++x)
        {
            let row = [];
            for(let y = 0; y < mapSize; ++y)
            {
                row.push(new WorldTile(x,y, floorMap,'img/textures/floor.png'));
            }
            this.map.push(row);
        }

        for(let i = 0; i < mapSize; ++i)
        {
            this.map[i][0].north = null;
            this.map[0][i].west = null;
            this.map[i][mapSize - 1].south = null;
            this.map[mapSize - 1][i].east = null;
        }

        for(let x = 1; x < mapSize - 1; ++x)
        {
            for(let y = 1; y < mapSize - 1; ++y)
            {
                this.map[x][y].north = this.map[x][y - 1];
                this.map[x][y].south = this.map[x][y + 1];

                this.map[x][y].west = this.map[x - 1][y];
                this.map[x][y].east = this.map[x + 1][y];
            }
        }
    }
}