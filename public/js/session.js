"use strict";

let player_id;
document.addEventListener("DOMContentLoaded", () => {
  let re = /\/game\/([^\/]*)/;
  let _, room_id;
  [_, room_id] = re.exec(window.location.href);

  let socket = connect(room_id);
  socket.on("player_joined", updatePlayerList);
  socket.on("game_update", gameUpdate);
  document.getElementById("start_game").addEventListener("click", () => {
    startGame(room_id);
  });
  document.getElementById("eliminate_self").addEventListener("click", () => {
    eliminateSelf(room_id);
  })
});

function connect(room_id) {
  let socket = io.connect('http://' + document.domain + ':' + location.port);
  socket.on('connect', () => {
    console.log("connect");
    socket.emit('join', {"room_id": room_id});
  });
  socket.on('join_ack', (data) => {
    player_id = data["player_id"]
  });
  return socket;
}
function updatePlayerList(data) {
  console.log("player_joined", data);

  document.getElementById("players").innerHTML = "";
  for (var i in data["players"]) {
    document.getElementById("players").innerHTML += data["players"][i] + "<br>";
  }
}
function startGame(room_id) {
  let startGameReq = new XMLHttpRequest();
  startGameReq.open("GET", "/begin_session/" + room_id);
  startGameReq.responseType = "json";
  startGameReq.send();
}
function gameUpdate(data) {
  console.log(data);
  document.getElementById("status").innerHTML = data["room_status_readable"]
}
function eliminateSelf(room_id) {
  console.log("FDAFSAF", player_id);
  let eliminateSelfReq = new XMLHttpRequest();
  eliminateSelfReq.open("GET", "/eliminate_player/" + room_id + "/" + player_id)
  eliminateSelfReq.responseType = "json";
  eliminateSelfReq.send();
}
