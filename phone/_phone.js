import io from 'socket.io-client';
import loadImage from '../utils/loadImage';
import { MaskedImage } from '../utils/mask';
import { MAX_DECAL_SIZE, BRUSH_SIZE } from '../constants';

import cropImage from '../utils/crop';

var DPR = window.devicePixelRatio;

const socket = io(`${ window.location.host }/phone`);

var getPosition = e => [ e.touches[ 0 ].clientX, e.touches[ 0 ].clientY ];

// Upload file from phone.
var input = document.querySelector( 'input[type=file]' );
var onUpload = callback => {
  input.addEventListener( 'change', () => {
    var reader = new FileReader();
    reader.onload = async e => {
      var img = await loadImage( e.target.result )
      callback( img );
    }
    reader.readAsDataURL( input.files[ 0 ] )
  })
}

onUpload( originalImage => {
  document.body.classList.add('loading'); // Disable touch events whilst server retrieves image.
  
  var canvasSize = [
    Math.min( window.innerWidth, MAX_DECAL_SIZE ) * DPR,
    Math.min( window.innerHeight, MAX_DECAL_SIZE ) * DPR
  ];
  
  var croppedImage = cropImage( originalImage, canvasSize );

  
  var maskedImage = new MaskedImage({
    image: croppedImage,
    mode: 'subtract',
    scale: DPR
  });
  document.body.appendChild( maskedImage.canvas );


  var canvasSizeProjector = [
    Math.min( window.innerWidth, MAX_DECAL_SIZE ),
    Math.min( window.innerHeight, MAX_DECAL_SIZE )
  ];
  var croppedImageProjector = cropImage( originalImage, canvasSizeProjector );
  socket.emit( 'phone:uploadImage', {
    imageSrc: croppedImageProjector.toDataURL(),
    size: [ croppedImageProjector.width, croppedImageProjector.height ]
  })
  
  maskedImage.canvas.addEventListener( 'touchstart', e => {
    e.preventDefault();
    var position = getPosition( e );
    maskedImage.onTouchStart( position );
    socket.emit( 'phone:touchstart', position );
  })
  
  maskedImage.canvas.addEventListener( 'touchmove', e => {
    e.preventDefault();
    var position = getPosition( e );
    maskedImage.onTouchMove( position );
    document.body.classList.add('drawing--active');
    socket.emit( 'phone:touchmove', position );
  })
  
})

// Wait for projector...
socket.on( 'projector:ready', () => {
  setTimeout(()=>{
    document.body.classList.remove('loading');
    document.body.classList.add('drawing');
    alert('Please draw');
  }, 500)
})

const drawingFinished = () => {
  socket.emit( 'phone:drawingFinished');
  document.body.classList.remove('drawing');
  document.querySelector('canvas').remove();
  document.body.classList.remove('drawing--active');
  document.querySelector("input").value = "";
}

const done = document.querySelector('.done');
done.addEventListener('click', drawingFinished);

// On phone timeout as decided by server.
socket.on( 'server:timeout', () => {
  drawingFinished();
})
  
const init = () => {
  alert('To participate, please select an image from your Photo Library');
  let dots = 1;
  const loader = document.getElementById('loader');
  const dot = '.';
  const type = () => {
    loader.innerHTML = `Loading${dot.repeat(dots)}<span class="invisible-dot">${dot.repeat(3 - dots)}</span>`
    if (dots == 3) {
      dots = 0;
    }
    dots++;
  }
  setInterval (type, 250);
}
// init();


