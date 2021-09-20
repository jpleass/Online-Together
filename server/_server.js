require('dotenv-expand')(require('dotenv').config());
const http = require('http');
const https = require('https'); 
const fs = require('fs');
const path = require('path');
const auth = require('./auth')
const express = require('express');
const socketIO = require('socket.io')
const app = express();

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }))

// Certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/online-together.net/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/online-together.net/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/online-together.net/chain.pem', 'utf8');


const privateKey = fs.readFileSync('./server/www.online-together.net.key', 'utf8');
const certificate = fs.readFileSync('./server/www.online-together.net.crt', 'utf8');
const ca = fs.readFileSync('./server/GandiStandardSSLCA2.pem', 'utf8');


const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};


const envDev = true;
let server;

if ( envDev ) {

  server = http.createServer(app);

} else {

  server = https.createServer(credentials, app);

}
const io = socketIO(server);

const TIMEOUT = 60000;

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
    console.log(event);
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

let censoredList;
fs.readFile("server/censoredDecals.json", "utf8", function readFileCallback( err, data ) {
  if (err) {
    console.log(err);
  } else {
    censoredList = JSON.parse(data);
  }
  console.log(censoredList);
});


// Censor Image  
const reviewSocket = io.of("/review");
reviewSocket.on('connection', socket => {
  socket.on("review:censor", msg => {
    fs.readFile('server/censoredDecals.json', 'utf8', function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        censoredList = JSON.parse(data);
        if (!containsObject(msg.decal.src, censoredList.decals)) {
          censoredList.decals.push(msg.decal.src);
          json = JSON.stringify(censoredList);
          fs.writeFile("server/censoredDecals.json", json, "utf8", function() {
            console.log("file added");
            projectorSocket.emit("server:refresh", msg.decal);
            reviewSocket.emit("server:refresh", msg.decal);
          });
        } else {
          if(!msg.decal.censored) {
            censoredList.decals.splice(findObject(msg.decal.src, censoredList.decals), 1);
            json = JSON.stringify(censoredList);
            fs.writeFile("server/censoredDecals.json", json, "utf8", function() {
              console.log("file deleted");
              projectorSocket.emit("server:refresh", msg.decal);
              reviewSocket.emit("server:refresh", msg.decal);
            });
          }
        }

      }
    });
  });
});

const projectorSocket = io.of('/projector');

let projectorConnected = false;

projectorSocket.on('connection', socket => {

//   if (projectorConnected) {
//     socket.disconnect(true);
//     return;
//   }

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

  const censoredFiles = [];
  files.forEach((file, index) => {
    const fileObj = {
      url: file,
      censored: containsObject(file, censoredList.decals)
    };
    censoredFiles.push(fileObj);
  })
  res.json(censoredFiles);
})


app.use(auth);
app.use('/projector', express.static('public/projector'));
app.use('/review', express.static('public/review'));


if( envDev ) {
  
  server.listen(
    process.env.PORT,
    () => console.log(`👍 ${process.env.HOST}:${process.env.PORT}`)
  )

} else {

  server.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

}


http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);