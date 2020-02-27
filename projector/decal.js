import Animator from './animator';
import { MaskedImage } from '../utils/mask';
import { Pixelate } from './pixelate';
import { throws } from 'assert';

class Decal {
  constructor ({ image, scale, censored, url, mode }) {
    this.maskedImage = new MaskedImage({ image, mode, scale });
    this.animator = new Animator({ imageSize: [ image.width, image.height ] })
    this.censored = censored;
    this.image = image;
    this.url = url;
    this.pixelated = null;
  }
  onTouchStart ( position ) {
    this.maskedImage.onTouchStart( position );
  }
  onTouchMove ( position ) {
    this.maskedImage.onTouchMove( position );
  }
  release ( duration ) {
    this.animator.release( duration );
    this.pixelated = Pixelate(this.maskedImage.canvas)
  }
  update ( now, canvasSize ) {
    this.animator.update( now, canvasSize );
  }
  render ( ctx ) {
    const [ x, y ] = this.animator.position;
    const [ w, h ] = this.animator.size;
    if (!this.censored) {
      ctx.drawImage(this.maskedImage.canvas, x, y, w, h);
    } else {
      ctx.drawImage(this.pixelated, x, y, w, h);
    }
  }
  toDataURL () {
    return this.maskedImage.canvas.toDataURL();
  }
}

export const placeDecals = ( decals, canvasSize ) => {
  decals
    .filter( decal => !decal.animator.released )
    .forEach( ( decal, i, list ) => {
      const x = ( ( i + 1 ) / ( list.length + 1 ) ) * canvasSize[ 0 ];
      const y = canvasSize[ 1 ] / 2;
      decal.animator.setInitialPosition([ x, y ]);
    })
}

export default Decal;