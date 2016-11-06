/**
 * Created by jornv on 3-11-2016.
 */
class TextureMap extends Singleton {
    setup() {
        this.folder = "./img/textures/";
        this.extension = ".png";
        this.map = {};

        this.loadTextures(this.fileNames);
    }

    loadTextures(names) {
        console.log(names, this);
        this.filesToLoad = names.length * 2;
        let loader = new THREE.TextureLoader();
        for (let name of names) {
            this.map[name] = {
                texture: loader.load(this.folder + name + this.extension, () => this.onLoadFile()),
                canvas: this.createCanvasElement(this.folder + name + this.extension)
            };
            this.map[name].texture.anisotropy = 16;
            this.map[name].texture.magFilter = THREE.LinearFilter;
            this.map[name].texture.minFilter = THREE.LinearMipMapNearestFilter;
        }
    }

    createCanvasElement(name) {
        console.log(name);
        let image = document.createElement('img');
        image.src = name;

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        image.onload = () => {

            console.log("drawing img");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);

            this.onLoadFile();
        };

        return context;
    }

    onLoad() {
    }

    onLoadFile() {
        if (--this.filesToLoad <= 0) {
            // Done
            console.log("All files loaded");
            this.onLoad();
        }

        console.log(this.filesToLoad);
    }

    get fileNames() {
        // return new Promise(resolve => fetch(folder).then(data => data.text().then(text => {
        //     resolve(
        //         text.split('href="')
        //         .filter(s=>s.includes('png'))
        //         .map(s=> folder + s.split('.png"')[0] + ".png")
        //     )
        // })));

        // The above code doesn't work on servers that don't show folders
        // Instead, we need to hardcode all filenames here
        let names =  [
            "4wayroad",
            "3wayroad",
            "2wayroad",
            "corner",
            "grass",
            "grasshill"
        ];

        return names.concat(names.map(s => s + ".channels"));
    }
}