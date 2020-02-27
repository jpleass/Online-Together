import { createCanvas } from './canvas';

var cover = ( src, dest ) => {
  var scale = Math.max( dest[ 0 ] / src[ 0 ], dest[ 1 ] / src[ 1 ] );
  return [ src[ 0 ] * scale, src[ 1 ] * scale ];
}
var contain = ( src, dest ) => {
  var scale = Math.min( dest[ 0 ] / src[ 0 ], dest[ 1 ] / src[ 1 ] );
  return [ src[ 0 ] * scale, src[ 1 ] * scale ];
}
var center = ( src, dest ) => [ ( dest[ 0 ] - src[ 0 ] ) / 2, ( dest[ 1 ] - src[ 1 ] ) / 2 ];

var cropImage = ( image, size ) => {
  var originalSize = [ image.width, image.height ];
  var scaledSize = contain( originalSize, size );
  var offset = center( scaledSize, size );
  var canvas = createCanvas( size );
  var ctx = canvas.getContext('2d');
  ctx.drawImage( image, offset[ 0 ], offset[ 1 ], scaledSize[ 0 ], scaledSize[ 1 ] );
  return canvas;
}

export default cropImage;