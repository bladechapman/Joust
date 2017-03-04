"use strict";

window.interaction = {
  attachButtons: (meta) => {
    document.getElementById("leave_room").addEventListener("click", window.utils.leaveRoom);
    document.getElementById("leave_room").addEventListener("touchend", window.utils.leaveRoom);

    let start, end;
    [start, end] = generatePrimaryButtonInteraction();
    document.getElementById("you").addEventListener("touchstart", start);
    document.getElementById("you").addEventListener("touchend", end);

    return meta;
  },

  attachMotion: (meta) => {
    detectMotionSensitive()
      .then(trackMotion)
      .catch(() => {console.log("Motion not supported");})

    return meta;
  }
}


//===

function generatePrimaryButtonInteraction() {
  let interactionTimer = null;
  let socket = window.meta.socket;
  let roomId = window.meta.roomId;

  function attemptStart() {
    // required to defeat mobile limitations
    let oscillator = window.meta.audioCtx.createOscillator();
    oscillator.connect(window.meta.audioCtx.destination);
    oscillator.start(0);
    oscillator.stop(window.meta.audioCtx.currentTime + 0.001);

    interactionTimer = window.setTimeout(() => {
      socket.emit("ready", {"room_id": roomId})
    }, 1000);
  }

  function attemptEnd() {
    clearTimeout(interactionTimer);
    socket.emit("unready", {"room_id": roomId})
  }

  return [attemptStart, attemptEnd]
}

function trackMotion() {
  let eliminateSelf = generateEliminateSelf();
  window.addEventListener("devicemotion", (event) => {
    let moment = event.acceleration.x * event.acceleration.x +
    event.acceleration.y + event.acceleration.y +
    event.acceleration.z + event.acceleration.z;

    if ((window.currentGameState["room"]["session"]["status_readable"] === "fast" && moment > window.meta.fastThreshold) ||
      (window.currentGameState["room"]["session"]["status_readable"] === "slow" && moment > window.meta.slowThreshold)) {
      eliminateSelf();
    }
  });
}

function generateEliminateSelf() {
  let eliminateSent = false;
  return function () {
    if (window.utils.currentPlayerIsPlaying(window.currentGameState) && !eliminateSent) {
      eliminateSent = true;
      let room_id = window.meta.roomId;
      let player_id = window.meta.playerId;

      let eliminateSelfReq = new XMLHttpRequest();
      eliminateSelfReq.open("GET", "/eliminate_player/" + room_id + "/" + window.utils.formatStrToUUID(player_id));
      eliminateSelfReq.send();

      eliminateSelfReq.onreadystatechange = () => {
        if (eliminateSelfReq.readyState === XMLHttpRequest.DONE) {
          eliminateSent = false;
          // console.log(eliminateSent.response);
        }
      }
    }
  }
}

function detectMotionSensitive() {
  return new Promise((resolve, reject) => {
    window.addEventListener("devicemotion", hasMotion)

    function hasMotion(motionEvent) {
      window.removeEventListener("devicemotion", hasMotion);
      if (motionEvent.acceleration.x != null &&
        motionEvent.acceleration.y != null &&
        motionEvent.acceleration.z != null) {
        return resolve();
      } else {
        return reject();
      }
    }
  });
}
