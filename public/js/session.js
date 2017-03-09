"use strict";

window.setup.DOMContentLoaded()
  .then(window.setup.attachMetaObject)
  .then(window.setup.attachRoomId)
  .then((meta) => {
    window.utils.changeLoadingStatus("Loading Music");
    return meta;
  })
  .then(window.setup.attachMusic)
  .then((meta) => {
    window.utils.changeLoadingStatus("Loading Sound Effects");
    return meta;
  })
  .then(window.setup.attachSoundEffects)
  .then((meta) => {
    window.utils.changeLoadingStatus("Connecting");
    return meta;
  })
  .then(window.network.attachSocket)
  .then(window.network.attachNetworkHandlers)
  .then(window.network.attachPlayerId)
  .then(window.network.attachOffset)
  .then(window.interaction.attachButtons)
  .then(window.interaction.attachMotion)
  .then(window.utils.removeLoadingScreen)
  .catch(window.utils.leaveRoom);
