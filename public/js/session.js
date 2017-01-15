"use strict";

let player_id;
let largest_v = 0;
let threshold = 5000;
let room_id;
let startTimer;
let updateObject;
let averageTripTime;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioDataSlow;
var audioDataFast;
var currentAudioSource;

document.addEventListener("DOMContentLoaded", () => {
  let re = /\/game\/([^\/]*)/;
  let _;
  [_, room_id] = re.exec(window.location.href);

  let socket = connect(room_id);
  socket.on("game_update", gameUpdate);
  socket.on("disconnect", leaveRoom);
  document.getElementById("leave_room").addEventListener("click", leaveRoom);
  document.getElementById("leave_room").addEventListener("touchend", leaveRoom)

  document.getElementById("you").addEventListener("mousedown", () => {
    startTimer = window.setTimeout(() => {
      socket.emit("ready", {"room_id": room_id});
    }, 1000);
  });
  document.getElementById("you").addEventListener("mouseup", () => {
    clearTimeout(startTimer);
    socket.emit("unready", {"room_id": room_id});
  });

  document.getElementById("you").addEventListener("touchstart", () => {
    startTimer = window.setTimeout(() => {
      socket.emit("ready", {"room_id": room_id});
    }, 1000);
  });
  document.getElementById("you").addEventListener("touchend", () => {
    clearTimeout(startTimer);
    socket.emit("unready", {"room_id": room_id});
  })
});
retrieveMusic();

function retrieveMusic() {
  let musicRequest = new XMLHttpRequest();
  musicRequest.open("GET", "/assets/test.mp3");
  musicRequest.responseType = "arraybuffer";
  musicRequest.send();

  musicRequest.onreadystatechange = () => {
    if (musicRequest.readyState === XMLHttpRequest.DONE) {
      console.log("SLOW MUSIC DOWNLOADED");
      audioDataSlow = musicRequest.response;
    }
  }

  let fastMusicRequest = new XMLHttpRequest();
  fastMusicRequest.open("GET", "/assets/fast.mp3");
  fastMusicRequest.responseType = "arraybuffer";
  fastMusicRequest.send();

  fastMusicRequest.onreadystatechange = () => {
    if (fastMusicRequest.readyState === XMLHttpRequest.DONE) {
      console.log("FAST MUSIC DOWNLOADED");
      audioDataFast = fastMusicRequest.response;
    }
  }
}
function initiateNtpSynchronize(socket) {
  console.log("INITIATE");
  socket.emit("synchronize");
  let tripTimes = [];
  let asyncIncrement = async(10, () => {
    averageTripTime = tripTimes.reduce((a, b) => a + b, 0) / 10;
    socket.off("synchronize_ack");
    console.log("SYNC COMPLETE", averageTripTime);
  });
  socket.on("synchronize_ack", (data) => {
    let server_timestamp = data["timestamp"]
    let client_timestamp = getTimestampMilliseconds();
    let tripTime = client_timestamp - server_timestamp;
    tripTimes.push(tripTime);
    asyncIncrement();
  });
}
function getTimestampMilliseconds() {
  return parseInt(Date.now());
}
function connect(room_id) {
  let socket = io.connect('http://' + document.domain + ':' + location.port);
  window._socket = socket;
  socket.on('connect', () => {
    console.log("connect");
    socket.emit('join', {"room_id": room_id});
    player_id = socket.id;
    initiateNtpSynchronize(socket);
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

  document.getElementById("you").className = characters[current_player["character"]]
  // document.getElementById("you").innerHTML = "<img class=\"char_img_main\" src=../assets/"+characters[current_player["character"]]+".png >";
  document.getElementById("you").innerHTML = "<img class=\"char_img_status\" src=../assets/"+current_player["status_readable"]+".png>"

  for (var i in slots) {
    slots[i].innerHTML = "";
    slots[i].className = "character";
  }

  for (var id in players) {
    if (id != player_id) {
      let slot = slots.pop();
      slot.className = "character " + characters[players[id]["character"]];
      // slot.innerHTML = "<img class=\"char_img\" src=../assets/"+characters[players[id]["character"]]+".png>";
      slot.innerHTML = "<img class=\"char_img_status\" src=../assets/"+players[id]["status_readable"]+".png>"
    }
  }
}
function gameUpdate(data) {
  console.log(data)
  updatePlayerList(data);
  updateMusic(data);
  updateObject = data;
}
function updateMusic(data) {
  if (data["room"]["status_code"] === 1 &&
    data["room"]["players"][player_id]["status_code"] === 2 &&
    data["room"]["session"]["status_readable"] == "slow" &&
    (updateObject == undefined || updateObject["room"]["session"] === null || updateObject["room"]["session"]["status_readable"] !== "slow")) {
      if (currentAudioSource !== undefined) {
        currentAudioSource.stop();
      }
    audioCtx.decodeAudioData(audioDataSlow, (buffer) => {
      console.log("START");
      let source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      currentAudioSource = source;
      currentAudioSource.start(0, averageTripTime / 1000);
    })
  }
  else if (data["room"]["status_code"] === 1 &&
      data["room"]["players"][player_id]["status_code"] === 2 &&
      data["room"]["session"]["status_readable"] == "fast" &&
      (updateObject == undefined || updateObject["room"]["session"] === null || updateObject["room"]["session"]["status_readable"] !== "fast")) {
        console.log("FAST")
        if (currentAudioSource !== undefined) {
          currentAudioSource.stop();
        }
        audioCtx.decodeAudioData(audioDataFast, (buffer) => {
          console.log("START");
          let source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          currentAudioSource = source;
          currentAudioSource.start(0, averageTripTime / 1000);
        });
  }
  else if (currentAudioSource !== undefined &&
    data["room"]["players"][player_id]["status_code"] !== 2) {
    console.log("STOP");
    currentAudioSource.stop();
    currentAudioSource = undefined;
  }
  else {
    if (currentAudioSource !== undefined) {
      currentAudioSource.stop();
    }
  }
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
function async(numCalls, callback) {
  let numCalled = 0;
  return () => {
    numCalled += 1;
    if (numCalled == numCalls) {
      callback();
    }
  }
}
