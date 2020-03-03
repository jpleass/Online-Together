import { GUI } from 'dat.gui';
import refreshPage from "./projector.js";


const gui = new GUI();

const config = {
  scale: .6,
  startingScale: 1.5,
  minScale: .8,
  maxScale: 1,
  minSpeed: .0001,
  maxSpeed: .0003,
  releaseDuration: 5000,
  maxDecals: 500
}

gui.remember(config);

gui.add( config, 'scale', .1, 2, .01 );
gui.add( config, 'startingScale', .1, 3, .01 );
gui.add( config, 'minScale', .1, 1, .01 );
gui.add( config, 'maxScale', .1, 1, .01 );
gui.add( config, 'minSpeed', .00001, .0005, .00001 );
gui.add( config, 'maxSpeed', .00001, .0005, .00001 );
gui.add( config, 'releaseDuration', 100, 10000, 1 );
gui.add( config, 'maxDecals', 1, 500, 1 );

var resetButton = { reset: () => { refreshPage(); } };
gui.add(resetButton,'reset');

document.addEventListener('keypress', toggleStats);

let hideStats = false;
function toggleStats(e) {
  if (e === '72') {
    hideStats
      ? document.querySelector('.dg').style.display = 'none'
      : document.querySelector('.dg').style.display = 'block'
  }
}

export default config;