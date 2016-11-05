/**
 * Created by hindrik on 30-10-16.
 */
class PixelFetcher
{
    constructor(name)
    {
        this.context = TextureMap.instance.map[name].canvas;

    }

    getPixelR(x,y)
    {
        return this.context.getImageData(x,y,1,1).data[0];
    }
    getPixelG(x,y)
    {
        return this.context.getImageData(x,y,1,1).data[1];
    }
    getPixelB(x,y)
    {
        return this.context.getImageData(x,y,1,1).data[2];
    }
    getPixelA(x,y)
    {
        return this.context.getImageData(x,y,1,1).data[3];
    }
    getPixelRGBA(x,y)
    {
        return this.context.getImageData(x,y,1,1).data;
    }
}