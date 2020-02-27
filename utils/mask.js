import { createCanvas } from './canvas';
import { BRUSH_SIZE } from '../constants';

export class Mask {
  constructor ({ size, scale }) {
    this.canvas = createCanvas( size );
    this.ctx = this.canvas.getContext( '2d' );
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = BRUSH_SIZE * scale;
    this.prevPosition = null;
    this.scale = scale;
  }
  line ( from, to ) {
    this.ctx.beginPath();
    this.ctx.moveTo( from[ 0 ], from[ 1 ] );
    this.ctx.lineTo( to[ 0 ], to[ 1 ] );
    this.ctx.stroke();
  }
  onTouchStart ( position ) {
    this.prevPosition = position;
  }
  onTouchMove ( position ) {
    this.ctx.beginPath();
    this.ctx.moveTo( this.prevPosition[ 0 ] * this.scale, this.prevPosition[ 1 ] * this.scale );
    this.ctx.lineTo( position[ 0 ] * this.scale, position[ 1 ] * this.scale );
    this.ctx.stroke();
    this.prevPosition = position;
  }
}

export class MaskedImage {
  constructor ({ image, mode, scale, censored }) {
    this.image = image;
    this.mode = mode;
    this.censored = censored;
    this.canvas = createCanvas([ image.width, image.height ]);
    this.ctx = this.canvas.getContext( '2d' );
    this.mask = new Mask({
      size: [ image.width, image.height ],
      scale
    });
    this.render();
  }
  render () {
    this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.drawImage( this.image, 0, 0, this.canvas.width, this.canvas.height );
    this.ctx.globalCompositeOperation = this.mode === 'add' ? 'destination-in' : 'destination-out';
    this.ctx.drawImage( this.mask.canvas, 0, 0, this.canvas.width, this.canvas.height );
  }
  onTouchStart ( position ) {
    this.mask.onTouchStart( position );
    this.render();
  }
  onTouchMove ( position ) {
    this.mask.onTouchMove( position );
    this.render();
  }
}