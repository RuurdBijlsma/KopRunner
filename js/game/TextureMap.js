/**
 * Created by jornv on 3-11-2016.
 */
class TextureMap extends Singleton {
    setup() {
        this.folder = "./img/textures/";
        this.map = {};

        this.getFileNames(this.folder).then(result => {
            this.filesToLoad = result.length;
            this.loadTextures(result)
        });
    }

    loadTextures(urls) {
        let loader = new THREE.TextureLoader();
        for(let url of urls) {
            this.map[url.substring(this.folder.length).slice(0, -4)] = loader.load(url, () => this.onLoadFile());
        }
    }

    onLoadFile() {
        if(--this.filesToLoad <= 0) {
            // Done
            console.log("All files loaded");
        }
    }

    getFileNames(folder) {
        //noinspection JSUnresolvedFunction
        return new Promise(resolve => fetch(folder).then(data => data.text().then(text => {
            resolve(
                text.split('href="')
                .filter(s=>s.includes('png'))
                .map(s=> folder + s.split('.png"')[0] + ".png")
            )
        })));
    }
}