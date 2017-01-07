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
  });
  document.getElementById("leave_room").addEventListener("click", leaveRoom);
});

function connect(room_id) {
  let socket = io.connect('http://' + document.domain + ':' + location.port);
  window._socket = socket;
  socket.on('connect', () => {
    console.log("connect");
    socket.emit('join', {"room_id": room_id});
    player_id = socket.id;
  });
  return socket;
}
function updatePlayerList(data) {
  let room = data["room"];
  let players = room["players"];

  document.getElementById("you").innerHTML = "";
  document.getElementById("you").innerHTML += players[player_id]["id"] + "<br>";
  document.getElementById("you").innerHTML += players[player_id]["status_readable"];

  var slots = [
    document.getElementById("three"),
    document.getElementById("two"),
    document.getElementById("one"),
  ];

  for (var i in slots) {
    slots[i].innerHTML = "";
  }

  for (var id in players) {
    if (id != player_id) {
      let slot = slots.pop();
      slot.innerHTML = "";
      slot.innerHTML += "id: " + id + "<br>";
      slot.innerHTML += "status: " + players[id]["status_readable"];
    }
  }
}
function gameUpdate(data) {
  console.log("game update", data);
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
    eliminateSelf(room_id);
    window.removeEventListener("devicemotion", trackMotion);
    stop_step = true;
  }
}
function leaveRoom(event) {
  document.location.href = "/";
}
