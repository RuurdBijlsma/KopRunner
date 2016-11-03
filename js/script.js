document.addEventListener('DOMContentLoaded', init, false);

function init() {
    let renderElement = document.getElementById('renderer');
    window.MAIN = new Main(renderElement);
    window.MAIN.initialize();
}
