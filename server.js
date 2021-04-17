const express = require('express'),
      app = express(),
      server = require('http').createServer(app);
      io = require('socket.io')(server);

let timerId = null,
    sockets = new Set();

const myServerPort = 8080;


//This example emits to individual sockets (track by sockets Set above).
//Could also add sockets to a "room" as well using socket.join('roomId')
//https://socket.io/docs/server-api/#socket-join-room-callback

app.use(express.static(__dirname + '/dist')); 

io.on('connection', socket => {

  sockets.add(socket);
  console.log(`Socket ${socket.id} added`);

  if (!timerId) {
    startTimer();
  }

  socket.on('clientdata', data => {
    console.log(data);
  });

  socket.on('disconnect', () => {
    console.log(`Deleting socket: ${socket.id}`);
    sockets.delete(socket);
    console.log(`Remaining sockets: ${sockets.size}`);
  });

});



let apiKey = "fc5825d4f088f2e678be68f88f80abbe7fdf404396303fff67842c1edbea438f";
const WebSocket = require('ws');
const ccStreamer = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + apiKey);

ccStreamer.on('open', function open() {
    var subRequest = {
        "action": "SubAdd",
        "subs": ["2~Coinbase~BTC~USD"]
    };
    ccStreamer.send(JSON.stringify(subRequest));

});

ccStreamer.on('message', function incoming(myData) {
    console.log(myData);
    //server.emit("msgToServer", "hello");
    //server.emit("msgToClient", "hello");
    //server.emit("msgToServer", myData);
   
    //s.emit("chat", myData);

    for (const s of sockets) {
      console.log(`Emitting value: ${myData}`);
      s.emit('data', { data: myData });
    }
   
});

function startTimer() {
  //Simulate stock data received by the server that needs 
  //to be pushed to clients
  timerId = setInterval(() => {
    if (!sockets.size) {
      clearInterval(timerId);
      timerId = null;
      console.log(`Timer stopped`);
    }
    let value = ((Math.random() * 50) + 1).toFixed(2);
    //See comment above about using a "room" to emit to an entire
    //group of sockets if appropriate for your scenario
    //This example tracks each socket and emits to each one
    for (const s of sockets) {
      console.log(`Emitting value: ${value}`);
      s.emit('data', { data: value });
    }

  }, 2000);
}

server.listen(myServerPort);

console.log('Visit http://localhost:'+ myServerPort + ' in your browser');
console.log('NESTJS RUNNING ON: http://localhost:'+ myServerPort);
