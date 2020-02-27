import loadImage from '../utils/loadImage';
import Decal from './decal';

export default () => fetch( '/decals/index' )
  .then( r => r.json() )
  .then( urls => 
    Promise.all( urls.map( loadImage ) )
      .then( images => {
        var decals = images.map( image => new Decal({
          image: image.url,
          mode: 'subtract',
          censored: image.censored,
          scale: 1,
          url: image.src
        }))
        decals.forEach( ( decal, i ) => decal.release() );
        return decals;
      })
  )