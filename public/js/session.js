"use strict";

window.setup.DOMContentLoaded()
  .then(window.setup.attachMetaObject)
  .then(window.setup.attachRoomId)
  .then(window.setup.attachMusic)
  .then(window.network.attachSocket)
  .then(window.network.attachNetworkHandlers)
  .then(window.network.attachPlayerId)
  .then(window.network.attachOffset)
  .then(window.interaction.attachButtons)
  .then(window.interaction.attachMotion)
  .then(window.utils.removeLoadingScreen)
  .catch(window.utils.leaveRoom);
