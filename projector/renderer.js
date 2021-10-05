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


// let frame_number = 0;
// let offset_x = 0, offset_y = 0, size_x = canvas.width, size_y = canvas.height;

export const render = decals => {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  
  // draw images on the front canvas
  decals.forEach( (decal, index) => {
  
    decal.render( ctx )

  })

  // let frame_modulo = frame_number % 200;
  // if(frame_modulo === 0) {

  //   size_x = (Math.random() * 1 + .5) * canvas.width;
  //   size_y = (Math.random() * 1 + .5) * canvas.height;
  //   offset_x = ( Math.random() * canvas.width ) - size_x * 0.5;
  //   offset_y = ( Math.random() * canvas.height ) - size_y * 0.5;
   
  // }

  //   off_ctx.globalCompositeOperation = config.blend_mode;
  //   off_ctx.globalAlpha = .1;
  //   // off_ctx.drawImage(latest_decal.image, 0 + offset_x, 0 + offset_y, size_x, size_y)

  off_ctx.globalCompositeOperation = "source-over";
  off_ctx.globalAlpha = 1;
  decals[decals.length-1].render(off_ctx)


  let blur_offset = config.blur * -0.5;

  let time = performance.now() * .0002

  let x = ( config.blur_offset_x * Math.sin(time) ) + blur_offset;
  let y = ( config.blur_offset_y * Math.cos(time) ) + blur_offset;

  off_ctx.globalCompositeOperation = "source-over";
  off_ctx.globalAlpha = 1;

  for(let i = 0; i < config.blur_iterations; i++) {
    off_ctx.drawImage(off_canvas, x, y, off_canvas.width + config.blur, off_canvas.height + config.blur)
  }


  // if( frame_number % 10 === 0 ) {


  // off_ctx.fillStyle = "rgba(0,0,0,.1)";
  // off_ctx.globalCompositeOperation = "luminosity"
  // off_ctx.fillRect(0,0,canvas.width,canvas.height)

  // }
  
  bg_ctx.drawImage(off_canvas, 0,0);
  // if( frame_number % 3 === 0) {
  // }
  // frame_number++;
}


export function clearRender() {
  off_ctx.clearRect( 0, 0, canvas.width, canvas.height );
  bg_ctx.clearRect( 0, 0, canvas.width, canvas.height );
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
}