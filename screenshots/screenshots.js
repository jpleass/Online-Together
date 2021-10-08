
fetch('/canvas')
  .then(response => response.json())
  .then(data => {
    
    let div = document.createElement('div')
    div.classList.add('images')

    data.forEach((item, index) => {

      let container = document.createElement('div')
      let img = document.createElement('img')
      img.src = item
      container.append(img)
      div.append(container)

    })

    document.body.append(div);


  });