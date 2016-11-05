document.addEventListener('DOMContentLoaded', init, false);

function init() {
    Physijs.scripts.worker = 'js/physijs/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
    let renderElement = document.getElementById('renderer');
    MAIN = new Main(renderElement);
    // MAIN.initialize();
}
