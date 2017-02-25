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
  },

  roomIsPlaying: (data) => {
    return data !== null &&
      data["room"] !== null &&
      data["room"]["status_code"] === 1;
  },

  currentPlayerIsPlaying: (data) => {
    return data !== null &&
      data["room"] !== null &&
      data["room"]["players"] !== null &&
      data["room"]["players"][window.meta.playerId] !== null &&
      data["room"]["players"][window.meta.playerId]["status_code"] === 2;
  },

  sessionIsSlow: (data) => {
    return data !== null &&
      data["room"] !== null &&
      data["room"]["session"] !== null &&
      data["room"]["session"]["status_readable"] === "slow";
  },

  sessionIsFast: (data) => {
    return data !== null &&
      data["room"] !== null &&
      data["room"]["session"] !== null &&
      data["room"]["session"]["status_readable"] === "fast";
  },

  formatStrToUUID: (str) => {
    return str.slice(0,8) + "-" +
      str.slice(8,12) + "-" +
      str.slice(12,16) + "-" +
      str.slice(16,20) + "-" +
      str.slice(20);
  }
}


window.setup = {
  DOMContentLoaded: () => {
    return new Promise((resolve, reject) => {
      document.addEventListener("DOMContentLoaded", resolve);
    });
  },

  attachMetaObject: () => {

    // misc setup
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });

    window.meta = {threshold: 100};
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
