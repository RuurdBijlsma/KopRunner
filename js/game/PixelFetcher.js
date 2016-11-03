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
        return this.context.getImageData(x,y,1,1).data.r;
    }
    getPixelG(x,y)
    {
        return this.context.getImageData(x,y,1,1).data.g;
    }
    getPixelB(x,y)
    {
        return this.context.getImageData(x,y,1,1).data.b;
    }
    getPixelA(x,y)
    {
        return this.context.getImageData(x,y,1,1).data.a;
    }
    getPixelRGBA(x,y)
    {
        return this.context.getImageData(x,y,1,1).data;
    }
}