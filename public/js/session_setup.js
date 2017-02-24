"use strict"


window.utils = {
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

  extractRoomId: () => {
    let re = /\/game\/([^\/]*)/;
    let _, room_id;
    [_, room_id] = re.exec(window.location.href);
    return room_id;
  },

  leaveRoom: () => {
    document.location.href = "/";
  }
}


window.setup = {
  DOMContentLoaded: () => {
    return new Promise((resolve, reject) => {
      document.addEventListener("DOMContentLoaded", resolve);
    });
  },

  attachMetaObject: () => {
    window.meta = {threshold: 1000};
    return window.meta;
  },

  attachRoomId: (meta) => {
    meta.roomId = window.utils.extractRoomId();
    return meta;
  },

  attachPlayerId: (meta) => {
    meta.playerId = meta.socket.id;
    return meta;
  },

  attachAverageTripTime: (meta) => {
    let socket = meta.socket;
    return new Promise((resolve, reject) => {
      let tripTimes = [];

      let asyncIncrement = window.utils.async(10, () => {
        socket.off("synchronize_ack");
        window.meta.averageTripTime = tripTimes.reduce((a, b) => a + b, 0) / 10;
        resolve(meta);
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
  },

  attachMusic: (meta) => {
    let slowMusicRequest = new XMLHttpRequest();
    slowMusicRequest.open("GET", "/assets/test.mp3");
    slowMusicRequest.responseType = "arraybuffer";
    let fastMusicRequest = new XMLHttpRequest();
    fastMusicRequest.open("GET", "/assets/fast.mp3");
    fastMusicRequest.responseType = "arraybuffer";
    meta.music = {
      fast: [],
      slow: []
    };
    meta.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    meta.audioSource = null;

    return new Promise((resolve, reject) => {
      let incrementAsync = window.utils.async(2, () => {
        resolve(meta);
      });

      slowMusicRequest.send();
      fastMusicRequest.send();

      fastMusicRequest.onreadystatechange = () => {
        if (fastMusicRequest.readyState === XMLHttpRequest.DONE) {
          incrementAsync();
          meta.music.fast = [fastMusicRequest.response];
        }
      }
      slowMusicRequest.onreadystatechange = () => {
        if (slowMusicRequest.readyState === XMLHttpRequest.DONE) {
          incrementAsync();
          meta.music.slow = [slowMusicRequest.response];
        }
      }
    });
  }
}
