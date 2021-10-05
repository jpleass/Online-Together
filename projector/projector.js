import "babel-polyfill";
import io from 'socket.io-client';
import TWEEN from '@tweenjs/tween.js';
import loadDecals from './load';
import loadImage from '../utils/loadImage';
import { canvas, render, clearRender } from './renderer';
import Decal, { placeDecals } from './decal';
import config from './config';

const socket = io( `${ window.location.host }/projector` );

const decals = {};

const loadInfos = function() {

  fetch('/data')
    .then(response => response.json())
    .then(data => {

      const overlay = document.querySelector('.overlay')
      overlay.textContent = ""

      Object.entries(data.text).forEach(([key, val]) => {

        let el = document.createElement('div')
        el.classList.add(key,'banderole','question')

        // duplicated 5 times to be able to loop the animation
        el.innerHTML = `<div class="banderole-stage"><span>${val} </span><span>${val} </span><span>${val} </span><span>${val} </span><span>${val} </span></div>`;

        overlay.append(el)

      })

  })
}


const loadShapes = function() {

   fetch('/shapes')
    .then(response => response.json())
    .then(data => {

      const shapes_container = document.querySelector('.shapes')
      shapes_container.textContent = ""

      data.forEach(item => {

        let shape = document.createElement('img')
        shape.classList.add('shape')
        let y = Math.random() * canvas.height - canvas.height * .2;
        let anim_delay = Math.random() * 40;
        let anim_duration = Math.random() * 40 + 20;

        shape.style.animationDelay = -anim_delay + "s";
        shape.style.animationDuration = anim_duration + "s";
        shape.style.top = y + "px";
        shape.src = item
        shapes_container.append(shape)

      })

    })

}

let raf;

const tick = () => {
  TWEEN.update();
  const now = Date.now();
  const canvasSize = [ canvas.width, canvas.height ];
  Object.values( decals ).forEach( decal => decal.update( now, canvasSize ) );
  render( Object.values( decals ) );
  raf = requestAnimationFrame( tick );
}


loadDecals().then( loadedDecals => {
  loadedDecals.slice(-config.maxDecals).forEach( ( d, i ) => decals[ i ] = d ) 
  tick()
});

loadInfos()
socket.on("server:refresh_text", loadInfos)
loadShapes()


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

  window.cancelAnimationFrame(raf)
  Object.keys( decals ).forEach( key => delete decals[ key ] );
  clearRender()
  loadDecals().then( loadedDecals => {
    loadedDecals.slice(-config.maxDecals).forEach( ( d, i ) => decals[ i ] = d )
    tick()
  });

}

export default refreshPage;