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
  // document.getElementById("v").innerHTML = largest_v;
  // document.getElementById("threshold").innerHTML = threshold;

  let socket = connect(room_id);
  socket.on("game_update", gameUpdate);
  socket.on("disconnect", () => {
    console.log("disconnect");
    document.location.href = "/";
  });
  document.getElementById("you").addEventListener("mousedown", () => {
    console.log("READY");
    socket.emit("ready", {"room_id": room_id});
  });
  document.getElementById("you").addEventListener("mouseup", () => {
    console.log("UNREADY");
    socket.emit("unready", {"room_id": room_id});
  })
  // document.getElementById("start_game").addEventListener("click", () => {
  //   startGame(room_id);
  //   window.addEventListener("devicemotion", trackMotion);
  // });
  // document.getElementById("eliminate_self").addEventListener("click", () => {
  //   eliminateSelf(room_id);
  // });
  document.getElementById("leave_room").addEventListener("click", leaveRoom);
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
  // document.getElementById("players").innerHTML = "";
  window._data = data;
  for (var id in data["players_status_readable"]) {
    // document.getElementById("players").innerHTML += id + ": " + data["players_status_readable"][id] + "<br>";
  }
}
function gameUpdate(data) {
  console.log("game update", data);
  // document.getElementById("status").innerHTML = data["room_status_readable"]
  updatePlayerList(data);
}
function eliminateSelf(room_id) {
  let eliminateSelfReq = new XMLHttpRequest();
  eliminateSelfReq.open("GET", "/eliminate_player/" + room_id + "/" + player_id)
  eliminateSelfReq.responseType = "json";
  eliminateSelfReq.send();
}
function trackMotion(event) {
  let v = event.acceleration.x * event.acceleration.x +
          event.acceleration.y * event.acceleration.y +
          event.acceleration.z * event.acceleration.z;
  // document.getElementById("c").innerHTML = v;
  if (v > largest_v) {
    largest_v = v;
    // document.getElementById("v").innerHTML = largest_v;
  }
  if (v > threshold) {
    console.log("ELIMINATED");
    // document.body.innerHTML += "ELIMINATED";
    eliminateSelf(room_id);
    window.removeEventListener("devicemotion", trackMotion);
    stop_step = true;
  }
}
function leaveRoom(event) {
  // let leaveRoomReq = new XMLHttpRequest();
  // leaveRoomReq.open("GET", "/leave_room/" + room_id + "/" + player_id);
  // leaveRoomReq.responseType = "json";
  // leaveRoomReq.send();
  // leaveRoomReq.onreadystatechange = () => {
  //   if (leaveRoomReq.readyState === XMLHttpRequest.DONE) {
  //     console.log("LEAVE ROOM RESPONSE");
  document.location.href = "/";
  //   }
  // }
}
