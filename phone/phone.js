import 'babel-polyfill';
import html from 'nanohtml';
import io from 'socket.io-client';
import { nextEvent, nextMessage, nextMessageIf, nextFileInput } from './events';
import { MAX_DECAL_SIZE } from '../constants';
import cropImage from '../utils/crop';
import { MaskedImage } from '../utils/mask';

const DPR = window.devicePixelRatio;

const socket = io(`${ window.location.host }/phone`);

console.log( socket );

var getPosition = e => [ e.touches[ 0 ].clientX, e.touches[ 0 ].clientY ];

const createInput = () => html`
  <div>
    <input class="inputfile" type="file" id="file" name="upload" accept="image/*">
    <label for="file">Choose File</label>
  </div>
`
const createButton = () => html`
  <div class="done__wrapper"><button class="done">✓</button></div>
`

const createLoader = () => html`
  <div id="loader">Loading.<span class="invisible-dot">.</span><span class="invisible-dot">.</span></div>
`
alert('Select an image from your Photo Library');
const start = async imageID => {
  
  const id = `${ socket.id }_${ imageID }`
  socket.emit( 'phone:setID', { id } );
  
  // CHOOSING
  const input = createInput();
  input.type = 'file';
  document.body.appendChild( input );
  const image = await nextFileInput( input.querySelector('.inputfile') );
  
  // UPLOADING
  document.body.removeChild( input );
  const loading = createLoader();
  document.body.appendChild( loading );

  let dots = 1;
  const dot = '.';
  const type = () => {
    loading.innerHTML = `Loading${dot.repeat(dots)}<span class="invisible-dot">${dot.repeat(3 - dots)}</span>`
    if (dots == 3) {
      dots = 0;
    }
    dots++;
  }
  let dotInterval = setInterval (type, 250);
  
  
  const canvasSize = [
    Math.min( window.innerWidth, MAX_DECAL_SIZE ),
    Math.min( window.innerHeight, MAX_DECAL_SIZE )
  ];
  socket.emit( 'phone:uploadImage', {
    imageSrc: cropImage( image.url, canvasSize ).toDataURL(),
    size: canvasSize,
    id
  });
  await nextMessageIf( socket, 'projector:ready', message => message.id === id );
  
  // DRAWING
  document.body.removeChild( loading );
  clearInterval(dotInterval);
  const maskedImage = new MaskedImage({
    image: cropImage( image.url, [ canvasSize[ 0 ] * DPR, canvasSize[ 1 ] * DPR ] ),
    mode: 'subtract',
    scale: DPR
  });
  document.body.appendChild( maskedImage.canvas );
  alert('Draw to transfer the image to the canvas');
  maskedImage.canvas.addEventListener( 'touchstart', e => {
    e.preventDefault();
    const position = getPosition( e );
    maskedImage.onTouchStart( position );
    socket.emit( 'phone:touchstart', { id, position });
  })
  maskedImage.canvas.addEventListener( 'touchmove', e => {
    e.preventDefault();
    const position = getPosition( e );
    maskedImage.onTouchMove( position );
    document.body.classList.add('drawing--active');
    socket.emit( 'phone:touchmove', { id, position });
  } );
  await nextEvent( maskedImage.canvas, 'touchend' );
  
  // DRAWN
  const done = createButton();
  document.body.appendChild( done );
  await nextEvent( done, 'click' );
  
  // DONE
  socket.emit( 'phone:drawingFinished', { id } );
  document.body.removeChild( maskedImage.canvas );
  document.body.removeChild( done );
  start( imageID + 1 );
  
}

socket.once( 'connect', () => start( 0 ) );