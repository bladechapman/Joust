"use strict"

let utils = {
  getTimestampMilliseconds: () => {
    return parseInt(Date.now());
  },
  async: (numCalls, callback) => {
    let numCalled = 0;
    return () => {
      numCalled += 1;
      if (numCalled == numCalls) {
        callback();
      }
    }
  },
  extractRoomId : () => {
    let re = /\/game\/([^\/]*)/;
    let _, room_id;
    [_, room_id] = re.exec(window.location.href);
    return room_id;
  }
}

// bind utilities to global
window.utils = utils


function attachMetaObject() {
  window.meta = {}
}

function wsConnect(room_id) {
  return new Promise((resolve, reject) => {
    let socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', () => {
      socket.emit('join', {"room_id": room_id});
      resolve(socket)
    });
  });
}

function attachAverageTripTime(socket) {
  return new Promise((resolve, reject) => {
    let tripTimes = [];

    let asyncIncrement = window.utils.async(10, () => {
      socket.off("synchronize_ack");
      window.meta.averageTripTime = tripTimes.reduce((a, b) => a + b, 0) / 10;
      resolve(socket);
    });
    socket.on("synchronize_ack", (data) => {
      let server_timestamp = data["timestamp"]
      let client_timestamp = window.utils.getTimestampMilliseconds();
      let tripTime = client_timestamp - server_timestamp;
      tripTimes.push(tripTime);
      asyncIncrement();
    });
    socket.emit("synchronize");
  })
}

function attachPlayerId(socket) {
  window.meta.playerId = socket.id;
  return socket;
}

function attachMusic(socket) {
  let slowMusicRequest = new XMLHttpRequest();
  slowMusicRequest.open("GET", "/assets/test.mp3");
  slowMusicRequest.responseType = "arraybuffer";
  let fastMusicRequest = new XMLHttpRequest();
  fastMusicRequest.open("GET", "/assets/fast.mp3");
  fastMusicRequest.responseType = "arraybuffer";
  window.meta.music = {
    fast: [],
    slow: []
  };

  return new Promise((resolve, reject) => {
    let incrementAsync = window.utils.async(2, () => {
      resolve(socket);
    });

    slowMusicRequest.send();
    fastMusicRequest.send();

    fastMusicRequest.onreadystatechange = () => {
      if (fastMusicRequest.readyState === XMLHttpRequest.DONE) {
        incrementAsync();
        window.meta.music.fast = [fastMusicRequest.response];
      }
    }
    slowMusicRequest.onreadystatechange = () => {
      if (slowMusicRequest.readyState === XMLHttpRequest.DONE) {
        incrementAsync();
        window.meta.music.slow = [slowMusicRequest.response];
      }
    }
  });
}

function DOMContentLoaded() {
  return new Promise((resolve, reject) => {
    document.addEventListener("DOMContentLoaded", resolve);
  });
}


window.setup = DOMContentLoaded()
  .then(attachMetaObject)
  .then(window.utils.extractRoomId)
  .then(wsConnect)
  .then(attachPlayerId)
  .then(attachAverageTripTime)
  .then(attachMusic)
  .then(() => {return window.meta});
