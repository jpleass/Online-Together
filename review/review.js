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

fetch('/data')
  .then(response => response.json())
  .then(data => {
    
    let infos = document.querySelector('.infos');

    Object.entries(data.text).forEach(([key, val]) => {
      
      let row = document.createElement('div')
      let label = document.createElement('label')
      let input = document.createElement('input')
      let btn_submit = document.createElement('button')

      row.classList.add(key,"info_row")
      label.textContent = key
      input.setAttribute("type","text")
      input.setAttribute("name",key)
      input.value = val

      btn_submit.textContent = "update"

      row.append(label)
      row.append(input)
      row.append(btn_submit)

      infos.append(row)


      btn_submit.addEventListener('click', e => {

        e.preventDefault()
        let obj = {}
        obj[key] = input.value
        socket.emit("review:update_text", obj )

      })

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