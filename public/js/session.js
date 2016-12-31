"use strict";

document.addEventListener("DOMContentLoaded", () => {
  console.log(window.location.href);
  var re = /\/game\/([^\/]*)\/([^\/]*)/;
  var _, room_id, player_id;
  [_, room_id, player_id] = re.exec(window.location.href);

  console.log(room_id);
  console.log(player_id);
});
