/**
 * Created by jornv on 10/30/2016. eigenlijk ruurd hoor
 */
class Singleton {
    constructor() {
        if (this.constructor._instance) return this.constructor._instance;
        this.constructor._instance = this;
        this.setup();
    }

    setup(){}

    static get instance() {
        return new this;
    }
}