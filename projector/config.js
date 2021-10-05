import { GUI } from 'dat.gui';
import refreshPage from "./projector.js";


const gui = new GUI();

const blend_modes = ["source-over","source-in","source-out","source-atop","destination-over","destination-in","destination-out","destination-atop","lighter","copy","xor","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity",];

const config = {
  scale: .6,
  startingScale: 1.5,
  minScale: .8,
  maxScale: 1,
  minSpeed: .00002,
  maxSpeed: .00014,
  releaseDuration: 5000,
  maxDecals: 10,
  blur: 2,
  blur_offset_x: 1,
  blur_offset_y: 1,
  blend_mode: "source-over",
  blur_iterations: 1
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
gui.add( config, 'blur', -20, 20, .001 );
gui.add( config, 'blur_offset_x', -20, 20, .001 );
gui.add( config, 'blur_offset_y', -20, 20, .001 );
gui.add( config, 'blend_mode', blend_modes );
gui.add( config, 'blur_iterations', 1, 50, 1 );

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