"use strict";

let player_id;
let largest_v = 0;
let threshold = 5000;
let room_id;

let stop_step = false;

document.addEventListener("DOMContentLoaded", () => {
  let re = /\/game\/([^\/]*)/;
  let _;
  [_, room_id] = re.exec(window.location.href);
  document.getElementById("v").innerHTML = largest_v;
  document.getElementById("threshold").innerHTML = threshold;

  let socket = connect(room_id);
  socket.on("player_joined", updatePlayerList);
  socket.on("game_update", gameUpdate);
  document.getElementById("start_game").addEventListener("click", () => {
    startGame(room_id);

    function step() {
      if (!stop_step) {
        trackMotion({
          acceleration: {
            x: Math.random() * 50,
            y: Math.random() * 50,
            z: Math.random() * 50
          }
        });
        window.requestAnimationFrame(step);
      }
    }
    step();
  });
  document.getElementById("eliminate_self").addEventListener("click", () => {
    eliminateSelf(room_id);
  })
  // window.addEventListener("devicemotion", trackMotion);
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
  console.log(player_id);
  let eliminateSelfReq = new XMLHttpRequest();
  eliminateSelfReq.open("GET", "/eliminate_player/" + room_id + "/" + player_id)
  eliminateSelfReq.responseType = "json";
  eliminateSelfReq.send();
}
function trackMotion(event) {
  let v = event.acceleration.x * event.acceleration.x +
          event.acceleration.y * event.acceleration.y +
          event.acceleration.z * event.acceleration.z;
  document.getElementById("c").innerHTML = v;
  if (v > largest_v) {
    largest_v = v;
    document.getElementById("v").innerHTML = largest_v;
  }
  if (v > threshold) {
    console.log("ELIMINATED");
    document.body.innerHTML += "ELIMINATED";
    eliminateSelf(room_id);
    window.removeEventListener("devicemotion", trackMotion);
    stop_step = true;
  }
}
