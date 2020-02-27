import loadImage from '../utils/loadImage';

const once = ( element, event, fn ) => {
  const handler = ( ...args ) => {
    element.removeEventListener( event, handler );
    fn( ...args );
  }
  element.addEventListener( event, handler );
}

export const nextEvent = ( element, event ) => new Promise( resolve => {
  once( element, event, resolve );
})

export const nextMessage = ( socket, event ) => new Promise( resolve => {
  socket.once( event, resolve );
})

export const nextMessageIf = ( socket, event, predicate ) => new Promise( resolve => {
  const onMessage = message => {
    if ( predicate( message ) ) {
      resolve( message );
      socket.off( event, onMessage );
    }
  }
  socket.on( event, onMessage );
})


const readFile = file => new Promise( resolve => {
  const reader = new FileReader();
  reader.onload = e => resolve( e.target.result );
  reader.readAsDataURL( file );
})

export const nextFileInput = async input => {
  await nextEvent( input, 'change' );
  const file = await readFile( input.files[ 0 ] );
  return loadImage( {url: file, censored: false} );
}