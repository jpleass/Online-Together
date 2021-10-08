import { GUI } from 'dat.gui';
import refreshPage from "./projector.js";


const gui = new GUI({
  autoPlace: true, // this is default
  hideable: true, // this is default, press 'h' to show/hide
});

gui.hide()

const blend_modes = ["source-over","source-in","source-out","source-atop","destination-over","destination-in","destination-out","destination-atop","lighter","copy","xor","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity",];

const config = {
  scale: 1.2,
  startingScale: 1.2,
  minScale: .8,
  maxScale: 1,
  minSpeed: .2,
  maxSpeed: .9,
  releaseDuration: 5000,
  maxDecals: 20,
  blur: 2,
  blur_offset_x: 1,
  blur_offset_y: 1,
  blend_mode: "source-over",
  title1_loop_duration: 10,
  title2_loop_duration: 10,
}

gui.remember(config);

gui.add( config, 'scale', .1, 2, .01 );
gui.add( config, 'startingScale', .1, 3, .01 );
gui.add( config, 'minScale', .1, 1, .01 );
gui.add( config, 'maxScale', .1, 1, .01 );
gui.add( config, 'minSpeed', .1, 5, .01 );
gui.add( config, 'maxSpeed', .1, 5, .01 );
gui.add( config, 'releaseDuration', 100, 10000, 1 );
gui.add( config, 'maxDecals', 1, 500, 1 );

let blur_folder = gui.addFolder('blur')
blur_folder.add( config, 'blur', -20, 20, .001 );
blur_folder.add( config, 'blur_offset_x', -20, 20, .001 );
blur_folder.add( config, 'blur_offset_y', -20, 20, .001 );
blur_folder.add( config, 'blend_mode', blend_modes );

gui.add( config, 'title1_loop_duration', 1, 50, 0.1 )
  .onFinishChange( function(e) {
    const val = this.getValue()
    document.querySelectorAll('.banderole-stage')[0].style.animationDuration = val+'s'
  })
gui.add( config, 'title2_loop_duration', 1, 50, 0.1 )
  .onFinishChange( function(e) {
    const val = this.getValue()
    document.querySelectorAll('.banderole-stage')[1].style.animationDuration = val+'s'
  })

var resetButton = { reset: () => { refreshPage(); } };
gui.add(resetButton,'reset');

export default config;