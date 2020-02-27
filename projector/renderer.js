export const canvas = document.getElementById("globalCanvas");
const ctx = canvas.getContext('2d');
const onResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener( 'resize', onResize );
onResize();

export const render = decals => {
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  decals.forEach( decal => {
    decal.render( ctx );
  })
}