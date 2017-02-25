"use strict";

window.network = {
  attachNetworkHandlers: (meta) => {
    let socket = meta.socket;
    let room_id = meta.roomId;

    socket.on("disconnect", window.utils.leaveRoom);
    socket.on("game_update", updateGameState);
    window.currentGameState = null;

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('join', {"room_id": room_id});
        resolve(meta);
      });
    });
  },

  attachSocket: (meta) => {
    let room_id = meta.roomId;
    meta.socket = io.connect('http://' + document.domain + ':' + location.port);
    return meta;
  }
}


function updateGameState(data) {
  console.log(data);
  updatePlayerList(data);
  updateMusic(data);
  updateTracking(data);
  window.currentGameState = data;
}

// ====

function updatePlayerList(data) {
  let room = data["room"];
  let players = room["players"];
  let playerId = window.meta.playerId;
  let currentPlayer = players[playerId];

  let slots = [
    document.getElementById("three"),
    document.getElementById("two"),
    document.getElementById("one")
  ];
  let characters = ["red", "blue", "yellow", "green"];

  // TODO: find a way to templatize this
  document.getElementById("you").className = characters[currentPlayer["character"]];
  document.getElementById("you").innerHTML = "<img class=\"char_img_status\" src=../assets/"+currentPlayer["status_readable"]+".png>";

  slots.forEach((elem) => {
    elem.innerHTML = "";
    elem.className = "character";
  });

  for (let id in players) {
    if (id != playerId) {
      let slot = slots.pop();
      slot.className = "character " + characters[players[id]["character"]];
      slot.innerHTML = "<img class=\"char_img_status\" src=../assets/"+players[id]["status_readable"]+".png>"
    }
  }
}

function updateMusic(data) {
  if (window.utils.roomIsPlaying(data) &&
    window.utils.currentPlayerIsPlaying(data) &&
    window.utils.sessionIsSlow(data) &&
    !window.utils.sessionIsSlow(window.currentGameState)) {
    stopMusic();
    playMusic("slow");
  }
  else if (window.utils.roomIsPlaying(data) &&
    window.utils.currentPlayerIsPlaying(data) &&
    window.utils.sessionIsFast(data) &&
    !window.utils.sessionIsFast(window.currentGameState)) {
    stopMusic();
    playMusic("fast");
  }
  else if (!window.utils.roomIsPlaying(data) ||
    !window.utils.currentPlayerIsPlaying(data)) {
    stopMusic()
  }
  else {
    console.log("UNCAUGHT MUSIC SITUATION...");
    debugger;
  }
}

function updateTracking(data) {

}

// ====

function playMusic(type) {
  let audioData = (type === "slow") ? window.meta.music.slow[0] : window.meta.music.fast[0];
  let audioCtx = window.meta.audioCtx;
  audioCtx.decodeAudioData(audioData, (buffer) => {
    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    window.meta.audioSource = source;
    source.start(0, window.meta.averageTripTime / 1000);
  });
}

function stopMusic() {
  let audioSource = window.meta.audioSource;
  if (audioSource != null) {
    try {
      audioSource.stop();
    } catch(err) {
      console.log(err);
    }
  }
  audioSource = null;
}
