"use strict";

window.interaction = {
  attachButtons: (meta) => {
    document.getElementById("leave_room").addEventListener("click", window.utils.leaveRoom);
    document.getElementById("leave_room").addEventListener("touchend", window.utils.leaveRoom);

    let start, end;
    [start, end] = generatePrimaryButtonInteraction();
    document.getElementById("you").addEventListener("mousedown", start);
    document.getElementById("you").addEventListener("touchstart", start);
    document.getElementById("you").addEventListener("mouseup", end);
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
  window.addEventListener("devicemotion", (event) => {
    let moment = event.acceleration.x * event.acceleration.x +
    event.acceleration.y + event.acceleration.y +
    event.acceleration.z + event.acceleration.z;

    if (moment > window.meta.threshold) {
      console.log("Exceeded threshold");
    }
  });
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
