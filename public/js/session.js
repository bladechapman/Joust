"use strict";

let player_id;
let largest_v = 0;
let threshold = 5000;
let room_id;
let startTimer;

document.addEventListener("DOMContentLoaded", () => {
  let re = /\/game\/([^\/]*)/;
  let _;
  [_, room_id] = re.exec(window.location.href);

  let socket = connect(room_id);
  socket.on("game_update", gameUpdate);
  socket.on("disconnect", leaveRoom);
  document.getElementById("leave_room").addEventListener("click", leaveRoom);

  document.getElementById("you").addEventListener("mousedown", () => {
    startTimer = window.setTimeout(() => {
      socket.emit("ready", {"room_id": room_id});
    }, 1000);
  });
  document.getElementById("you").addEventListener("mouseup", () => {
    clearTimeout(startTimer);
    socket.emit("unready", {"room_id": room_id});
  })
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
  let current_player = players[player_id];

  var slots = [
    document.getElementById("three"),
    document.getElementById("two"),
    document.getElementById("one"),
  ];

  var characters = [
    "red",
    "blue",
    "yellow",
    "green"
  ]

  // document.getElementById("you").innerHTML += current_player["id"] + "<br>";
  // document.getElementById("you").innerHTML += current_player["status_readable"];
  document.getElementById("you").className = characters[current_player["character"]]
  document.getElementById("you").innerHTML = "<img class=\"char_img_main\" src=../assets/"+characters[current_player["character"]]+".png >";

  for (var i in slots) {
    slots[i].innerHTML = "";
    slots[i].className = "character";
  }

  for (var id in players) {
    if (id != player_id) {
      let slot = slots.pop();
      slot.innerHTML = "<img class=\"char_img\" src=../assets/"+characters[players[id]["character"]]+".png>";
      // slot.innerHTML += "id: " + id + "<br>";
      // slot.innerHTML += "status: " + players[id]["status_readable"];
      slot.className = "character " + characters[players[id]["character"]];
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
    eliminateSelf(room_id);
    window.removeEventListener("devicemotion", trackMotion);
  }
}
function leaveRoom(event) {
  document.location.href = "/";
}
