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
        this.filesToLoad = names.length * 4;
        let loader = new THREE.TextureLoader();
        for (let name of names) {
            for (let i = 0; i < 4; ++i) {
                this.createCanvasElement(name, i);
            }
        }
    }

    setCanvas(name) {
        document.getElementsByTagName("canvas")[0].replaceWith(this.map[name].canvas.canvas);
    }

    createCanvasElement(name, rotation) {
        let image = document.createElement('img');
        image.src = this.folder + name + this.extension;

        image.onload = () => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;

            switch (rotation) {
                case 1:
                    context.translate(image.width, 0);
                    break;
                case 2:
                    context.translate(image.width, image.height);
                    break;
                case 3:
                    context.translate(0, image.height);
                    break;
            }

            context.rotate((Math.PI / 2) * rotation);
            context.drawImage(image, 0, 0, image.width, image.height);

            let dictName;
            if (name.includes(".channels")) {
                name = name.substring(0, name.length - 9);
                dictName = name + "rotate" + rotation + ".channels";
            } else dictName = name + "rotate" + rotation;

            // document.body.appendChild(document.createElement("p"));
            // document.getElementsByTagName('p')[document.getElementsByTagName('p').length - 1].innerText = dictName;
            // document.getElementsByTagName('p')[document.getElementsByTagName('p').length - 1].style.color = 'black';
            // document.getElementsByTagName('p')[document.getElementsByTagName('p').length - 1].style.fontSize = '80px';
            // document.body.appendChild(canvas);

            this.map[dictName] = {
                canvas: context,
                texture: new THREE.Texture(canvas)
            };

            this.map[dictName].texture.flipY = false;
            this.map[dictName].texture.anisotropy = 16;
            this.map[dictName].texture.magFilter = THREE.LinearFilter;
            this.map[dictName].texture.minFilter = THREE.LinearMipMapNearestFilter;
            this.map[dictName].texture.needsUpdate = true;

            this.onLoadFile();
        };
    }

    onLoad() {}

    onLoadFile() {
        if (--this.filesToLoad <= 0) {
            // Done
            this.onLoad();
        }
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
        let names = [
            '4wayroad',
            '3wayroad',
            '2wayroad',
            'corner',
            'grass',
            'grasshill'
        ];

        names = names.concat(names.map(s => s + '.channels'));

        // Textures that don't have a channels image
        let namesWithoutChannels = [
            'skyline',
        ];

        return names.concat(namesWithoutChannels);
    }
}
