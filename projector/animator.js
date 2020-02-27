import SimplexNoise from 'simplex-noise';
import { map, lerp } from '../utils/math';
import TWEEN from '@tweenjs/tween.js';
import random from 'lodash/random';
import config from './config';

const simplexNoise = new SimplexNoise();

class Animator {
  constructor ({ imageSize }) {
    this.imageSize = imageSize;
    this.size = imageSize.slice();
    this.initialPosition = [ 0, 0 ];
    this.initialPositionTween = new TWEEN.Tween( this.initialPosition );
    this.position = this.initialPosition.slice();
    this.scale = config.startingScale;
    this.targetScale = random( config.minScale, config.maxScale );
    this.noiseOffset = [ random( -1, 1, true ), random( -1, 1, true ) ];
    this.noiseSpeed = [ random( 0, 1, true ), random( 0, 1, true ) ];
    this.noiseInfluence = 0;
    this.released = false;
  }
  setInitialPosition ( to, duration = 2000 ) {
    this.initialPositionTween
      .stop()
      .to({ 0: to[ 0 ], 1: to[ 1 ] }, duration )
      .easing( TWEEN.Easing.Quartic.InOut )
      .start()
  }
  release ( duration = config.releaseDuration ) {
    this.released = true;
    new TWEEN.Tween( this )
      .to({ noiseInfluence: 1 }, duration )
      .easing( TWEEN.Easing.Quartic.Out )
      .start()
    new TWEEN.Tween( this )
      .to({ scale: this.targetScale }, duration )
      .easing( TWEEN.Easing.Quartic.Out )
      .start()
  }
  update ( now, canvasSize ) {
    const center = [
      canvasSize[ 0 ] / 2,
      canvasSize[ 1 ] / 2
    ]
    const size = [
      this.imageSize[ 0 ] * this.scale * config.scale,
      this.imageSize[ 1 ] * this.scale * config.scale
    ]
    const noiseSpeed = [
      map( this.noiseSpeed[ 0 ], 0, 1, config.minSpeed, config.maxSpeed ),
      map( this.noiseSpeed[ 1 ], 0, 1, config.minSpeed, config.maxSpeed )
    ]
    const noiseOffset = [
      simplexNoise.noise2D( this.noiseOffset[ 0 ], now * noiseSpeed[ 0 ] ),
      simplexNoise.noise2D( this.noiseOffset[ 1 ], now * noiseSpeed[ 1 ] )
    ]
    const maxOffset = [
      ( canvasSize[ 0 ] - size[ 0 ] ) / 2,
      ( canvasSize[ 1 ] - size[ 1 ] ) / 2
    ]
    const noisePosition = [
       center[ 0 ] + noiseOffset[ 0 ] * maxOffset[ 0 ],
       center[ 1 ] + noiseOffset[ 1 ] * maxOffset[ 1 ]
    ]
    const position = [
      lerp( this.initialPosition[ 0 ], noisePosition[ 0 ], this.noiseInfluence ) - size[ 0 ] / 2,
      lerp( this.initialPosition[ 1 ], noisePosition[ 1 ], this.noiseInfluence ) - size[ 1 ] / 2
    ]
    this.position = position;
    this.size = size;
  }
}

export default Animator;