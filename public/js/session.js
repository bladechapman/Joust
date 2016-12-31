"use strict";

document.addEventListener("DOMContentLoaded", () => {
  let re = /\/game\/([^\/]*)/;
  let _, room_id;
  [_, room_id] = re.exec(window.location.href);

  let socket = connect(room_id);
  socket.on("player_joined", (data) => {
    console.log("player_joined", data)
  });
});

function connect(room_id) {
  let socket = io.connect('http://' + document.domain + ':' + location.port);
  socket.on('connect', () => {
    console.log("connect");
    socket.emit('join', {"room_id": room_id});
  });
  socket.on('join_ack', (data) => {
    console.log("join_ack", data);
  });
  return socket;
}
