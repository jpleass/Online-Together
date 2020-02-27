import "babel-polyfill";
import io from 'socket.io-client';
import TWEEN from '@tweenjs/tween.js';
import loadDecals from './load';
import loadImage from '../utils/loadImage';
import { canvas, render } from './renderer';
import Decal, { placeDecals } from './decal';
import config from './config';

const socket = io( `${ window.location.host }/projector` );

const decals = {};

loadDecals().then( loadedDecals => loadedDecals.slice(-config.maxDecals).forEach( ( d, i ) => decals[ i ] = d ) );

const tick = () => {
  TWEEN.update();
  document.querySelector('.decalCount').innerHTML = Object.keys( decals ).length;
  const now = Date.now();
  const canvasSize = [ canvas.width, canvas.height ];
  Object.values( decals ).forEach( decal => decal.update( now, canvasSize ) );
  render( Object.values( decals ) );
  requestAnimationFrame( tick );
}

tick();

socket.on( 'phone:uploadImage', ({ id, imageSrc }) => {
  console.log( 'uploadImage', id, imageSrc )
  loadImage( {url: imageSrc, censored: false} ).then( image => {
    console.log( 'loaded image', image );
    decals[ id ] = new Decal({ image: image.url, mode: 'add', scale: 1, censored: false });
    placeDecals( Object.values( decals ), [ canvas.width, canvas.height ] );
    socket.emit( 'projector:ready', { id });
  })
})

socket.on( 'phone:touchstart', ({ id, position }) => {
  console.log( 'touchstart', id, position )
  var decal = decals[ id ];
  if ( !decal ) return;
  decal.onTouchStart( position );
})

socket.on( 'phone:touchmove', ({ id, position }) => {
  console.log( 'touchmove', id, position )
  var decal = decals[ id ];
  if ( !decal ) return;
  decal.onTouchMove( position );
})

var onFinished = ({ id }) => {
  var decal = decals[ id ];
  if ( !decal ) return;
  decal.release();
  placeDecals( Object.values( decals ), [ canvas.width, canvas.height ] );
  socket.emit( 'projector:saveDecal', { id, data: decal.toDataURL() })

  setTimeout(() => {
    socket.emit('projector:saveCanvas', { id, data: canvas.toDataURL() })
  }, 100);

}

socket.on( 'phone:drawingFinished', onFinished )
socket.on( 'phone:disconnect', onFinished )

socket.on("server:refresh", msg => {
  Object.keys(decals).forEach(key => {
    if (msg.src === decals[key].url) {
      decals[key].censored = !decals[key].censored;
    }
  });
});

const refreshPage = () => {
  Object.keys( decals ).forEach( key => delete decals[ key ] );
  loadDecals().then( loadedDecals => loadedDecals.slice(-config.maxDecals).forEach( ( d, i ) => decals[ i ] = d ) );
}

export default refreshPage;