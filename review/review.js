import loadImage from '../utils/loadImage';
import io from "socket.io-client";

const socket = io(`${window.location.host}/review`);
console.log(socket);

const loadDecals = () => fetch('/decals/index')
  .then(r => r.json())
  .then(urls =>
    Promise.all(urls.map(loadImage))
      .then(images => {
        return images;
      })
  )


loadDecals().then(loadedDecals => {
  loadedDecals.forEach(decal => {
    const decalThumb = decal.url;
    decalThumb.dataset.censoring = false;
    decalThumb.dataset.src = decal.src;

    if (decal.censored) {
      decalThumb.classList.add('hidden')
    }

    decalThumb.addEventListener('click', e => {
      e.preventDefault();
      if (decalThumb.dataset.censoring == "false") {    
        decalThumb.dataset.censoring = true;    
        decal.censored = !decal.censored;
        socket.emit("review:censor", { decal });
      }
    })

    document.querySelector('.decals').prepend(decalThumb)
  })
});

socket.on("server:refresh", msg => {
  document.querySelectorAll('canvas').forEach(decal => {
    if(decal.dataset.src === msg.src) {
      msg.censored ? decal.classList.add("hidden") : decal.classList.remove("hidden");
      decal.dataset.censoring = false;    
    }
  })
});