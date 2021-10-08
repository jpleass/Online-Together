require('dotenv-expand')(require('dotenv').config());
const http = require('http');
const fs = require('fs');
const path = require('path');
const auth = require('./auth')
const express = require('express');
const socketIO = require('socket.io')
const app = express();


const server = http.createServer(app);
const io = socketIO(server);

const TIMEOUT = 60000;

const projectorSocket = io.of('/projector');
let projectorConnected = false;


const phoneSocket = io.of('/phone');
phoneSocket.on('connection', socket => {

  if (projectorConnected) {
    socket.emit('server:isProjectorConnected', 'Projector is connected...');
  } else {
    socket.emit('server:isProjectorConnected', 'Projector is not connected...');
  }


  let id = null;
  socket.on('phone:setID', msg => id = msg.id);

  let timerID = null;
  const resetIdleTimer = () => {
    clearTimeout(timerID);
    timerID = setTimeout(() => socket.disconnect(true), TIMEOUT);
  }

  const passThrough = event => socket.on(event, message => {
    resetIdleTimer();
    projectorSocket.emit(event, message);
  })

  passThrough('phone:uploadImage');
  passThrough('phone:touchstart');
  passThrough('phone:touchmove');
  passThrough('phone:drawingFinished');

  socket.on('disconnect', () => projectorSocket.emit('phone:disconnect', { id }))

})

function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true;
    }
  }
  return false;
}

function findObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return i;
    }
  }
}

let custom_data;

fs.readFile("server/custom_data.json", "utf8", function readFileCallback( err, data ) {
  if (err) {
    console.log(err);
  } else {
    custom_data = JSON.parse(data);
  }
  console.log(custom_data);
});


// Censor Image  
const reviewSocket = io.of("/review");
reviewSocket.on('connection', socket => {

  socket.on("review:censor", msg => {

        if (!containsObject(msg.decal.src, custom_data.decals_censored)) {

          custom_data.decals_censored.push(msg.decal.src);
          let json = JSON.stringify(custom_data);
          fs.writeFile("server/custom_data.json", json, "utf8", function() {
            console.log("decal censored");
            projectorSocket.emit("server:refresh", msg.decal);
            reviewSocket.emit("server:refresh", msg.decal);
          });

        } else if(!msg.decal.censored) {
          
            custom_data.decals_censored.splice(findObject(msg.decal.src, custom_data.decals_censored), 1);
            let json = JSON.stringify(custom_data);
            fs.writeFile("server/custom_data.json", json, "utf8", function() {
              console.log("decal uncensored");
              projectorSocket.emit("server:refresh", msg.decal);
              reviewSocket.emit("server:refresh", msg.decal);
            });

        }

  });


  socket.on('review:update_text', msg => {
    
    let key = Object.keys(msg)[0];
    
    if( key in custom_data.text ) {

      custom_data.text[key] = msg[key]
      let json = JSON.stringify(custom_data);
      fs.writeFile("server/custom_data.json", json, "utf8", function() {
        console.log("text updated", custom_data.text)
        projectorSocket.emit("server:refresh_text")
      });
    
    }
  })

});


projectorSocket.on('connection', socket => {

  projectorConnected = true;

  socket.on('disconnect', () => projectorConnected = false);

  socket.on('projector:ready', message => {
    console.log('projector:ready');
    phoneSocket.emit('projector:ready', message)
  })

  socket.on('projector:saveDecal', ({ id, data }) => {
    var base64Data = data.replace(/^data:image\/png;base64,/, "");
    var file = `./public/decals/${id}.png`.replace('#', '');
    if (!fs.existsSync(file)) fs.writeFileSync(file, base64Data, 'base64');
  })

  socket.on('projector:saveCanvas', ({ data }) => {
    var base64Data = data.replace(/^data:image\/png;base64,/, "");
    var file = `./public/canvas/${Date.now()}.png`;
    if (!fs.existsSync(file)) fs.writeFileSync(file, base64Data, 'base64');
  })

})

app.use('/', express.static('public/phone'));
app.use('/decals', express.static('public/decals'))
app.use('/canvas', express.static('public/canvas'))
app.use('/assets', express.static('public/assets'))


app.get('/decals/index', (req, res) => {
  var files = fs.readdirSync('./public/decals')
    .map(filename => {
      var file = path.join(process.cwd(), 'public', 'decals', filename);
      var url = `/decals/${filename}`;
      var time = fs.statSync(file).mtime.getTime();
      return { file, time, url }
    })
    .sort((a, b) => a.time - b.time)
    .map(({ url }) => url)

  const outObj = [];
  files.forEach((file, index) => {
    const fileObj = {
      url: file,
      censored: containsObject(file, custom_data.decals_censored)
    };
    outObj.push(fileObj);
  })
  res.json(outObj);
})

app.get('/data', (req, res) => {
  res.json(custom_data);
})


app.get('/shapes', (req, res) => {
  var files = fs.readdirSync('./public/assets/shapes')
    .map(filename => {

      var url = `/assets/shapes/${filename}`;
      return url;
    })
    
  res.json(files);
})

app.get('/canvas', (req, res) => {
  var files = fs.readdirSync('./public/canvas')
    .map(filename => {

      var file = path.join(process.cwd(), 'public', 'canvas', filename);
      var url = `/canvas/${filename}`;
      var time = fs.statSync(file).mtime.getTime();

      return {url, time};
    })
    .sort( (a,b) => b.time - a.time )
    .map(({ url }) => url)
    
  res.json(files);
})


app.use(auth);
app.use('/projector', express.static('public/projector'))
app.use('/review', express.static('public/review'))
app.use('/screenshots', express.static('public/screenshots'))


  
server.listen(
  process.env.PORT,
  () => console.log(`server listening to ${process.env.HOST}:${process.env.PORT}`)
)