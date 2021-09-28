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

    const decalThumb = document.createElement('div')
    decalThumb.classList.add("decal")
    decalThumb.append(decal.url)
    decalThumb.dataset.censored = decal.censored;
    decalThumb.dataset.src = decal.src;

    decalThumb.addEventListener('click', e => {
      e.preventDefault();
      decal.censored = !decal.censored;
      socket.emit("review:censor", { decal });
      
    })

    document.querySelector('.decals').prepend(decalThumb)
  })
});

socket.on("server:refresh", msg => {
  console.log("server refresh")
  document.querySelectorAll('.decal').forEach(decal => {
    if(decal.dataset.src === msg.src) {
      decal.dataset.censored = msg.censored;
    }
  })
});