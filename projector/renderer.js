import config from './config';

export const canvas = document.getElementById("globalCanvas");
const off_canvas = document.createElement("canvas");

const ctx = canvas.getContext('2d');
const off_ctx = off_canvas.getContext('2d');

const onResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  off_canvas.width = window.innerWidth;
  off_canvas.height = window.innerHeight;
}

window.addEventListener( 'resize', onResize );
onResize();

export const render = decals => {
  // ctx.clearRect( 0, 0, canvas.width, canvas.height );
  // off_ctx.fillStyle = "rgba(0,0,0,.005)";
  // off_ctx.fillRect(0,0,canvas.width,canvas.height)

  let blur_offset = config.blur * -0.5;

  off_ctx.globalCompositeOperation = config.blend_mode;
  
  for(let i = 0; i < config.blur_iterations; i++) {

    off_ctx.drawImage(off_canvas, blur_offset + config.blur_offset_x, blur_offset + config.blur_offset_y, off_canvas.width + config.blur, off_canvas.height + config.blur)
  // off_ctx.drawImage(off_canvas, - ( blur_offset + config.blur_offset_x ), - (blur_offset + config.blur_offset_y), off_canvas.width - config.blur, off_canvas.height - config.blur)
  }
  

  off_ctx.globalCompositeOperation = "source-over";
  decals.forEach( decal => {
    decal.render( off_ctx );
  })

  ctx.drawImage(off_canvas, 0,0);
  

}


export function clearRender() {
  off_ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
}