/**
 * Created by hindrik on 30-10-16.
 */
class PixelFetcher
{
    constructor(_texture)
    {
        let image = document.createElement('img');
        image.src = _texture;
        this.texture = image;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.texture.width;
        this.canvas.height = this.texture.height;

        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.texture, 0,0);
    }

    getPixelR(x,y)
    {
        let pos = (x + this.texture.width * y) * 4, data = this.texture.data;
        return data[pos];
    }
    getPixelG(x,y)
    {
        let pos = (x + this.texture.width * y) * 4, data = this.texture.data;
        return data[pos + 1];
    }
    getPixelB(x,y)
    {
        let pos = (x + this.texture.width * y) * 4, data = this.texture.data;
        return data[pos + 2];
    }
    getPixelA(x,y)
    {
        let pos = (x + this.texture.width * y) * 4, data = this.texture.data;
        return data[pos + 3];
    }
    getPixelRGBA(x,y)
    {
        let pos = (x + this.texture.width * y) * 4, data = this.texture.data;
        return { r: data[pos], g: data[pos + 1], b: data[pos + 2], a: data[pos + 3] };
    }
}