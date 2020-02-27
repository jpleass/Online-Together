import loadImageBI from 'blueimp-load-image';

// var loadImage = url => new Promise( resolve => {
//  var img = new Image();
//  img.onload = () => resolve( img );
//  img.src = url;
// });

const loadImage = url => new Promise ( resolve => {
  loadImageBI( url.url, (image) => {
      resolve( {url: image, censored: url.censored, src: url.url} )
    }, {orientation: true}
  );
})

export default loadImage