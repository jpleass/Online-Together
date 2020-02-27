export const Pixelate = function (image) {
  // var element = document.querySelector('img');
  // var elementParent = element.parentNode;

  var canv = document.createElement('canvas');
  // canv.style.display = 'none'
  canv.width = image.width;
  canv.height = image.height;

  var ctx = canv.getContext('2d');
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var width = image.width * 0.025;
  var height = image.height * 0.025;


  ctx.drawImage(image, 0, 0, width, height);
  ctx.drawImage(canv, 0, 0, width, height, 0, 0, canv.width, canv.height);
  ctx.clearRect(0,0, width, height);
  return canv
};