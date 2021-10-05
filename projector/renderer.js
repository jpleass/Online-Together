import config from './config';

export const canvas = document.getElementById("globalCanvas");
const bg_canvas = document.getElementById("bgCanvas");
const off_canvas = document.createElement("canvas");

const ctx = canvas.getContext('2d');
const bg_ctx = bg_canvas.getContext('2d');
const off_ctx = off_canvas.getContext('2d');



const onResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  bg_canvas.width = window.innerWidth;
  bg_canvas.height = window.innerHeight;

  off_canvas.width = window.innerWidth;
  off_canvas.height = window.innerHeight;
}

window.addEventListener( 'resize', onResize );
onResize();


export const render = decals => {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  
  // draw images on the front canvas
  decals.forEach( decal => { decal.render( ctx )  })

  // draw latest decal on another canvas
  off_ctx.globalCompositeOperation = "source-over";
  off_ctx.globalAlpha = 1;
  decals[decals.length-1].render(off_ctx)

  // make feedback blur with scale and translate
  let time = performance.now() * .0002

  let blur_offset = config.blur * -0.5;
  let x = ( config.blur_offset_x * Math.sin(time) ) + blur_offset;
  let y = ( config.blur_offset_y * Math.cos(time) ) + blur_offset;

  off_ctx.globalCompositeOperation = "source-over";
  off_ctx.globalAlpha = 1;

  for(let i = 0; i < config.blur_iterations; i++) {
    off_ctx.drawImage(off_canvas, x, y, off_canvas.width + config.blur, off_canvas.height + config.blur)
  }

  // draw feedback blur on background canvas
  bg_ctx.drawImage(off_canvas, 0,0);

}


export function clearRender() {
  off_ctx.clearRect( 0, 0, canvas.width, canvas.height );
  bg_ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
}