"use strict";

window.setup.DOMContentLoaded()
  .then(window.setup.attachMetaObject)
  .then(window.setup.attachRoomId)
  .then(window.network.attachSocket)
  .then(window.network.attachNetworkHandlers)
  .then(window.setup.attachPlayerId)
  .then(window.setup.attachAverageTripTime)
  .then(window.setup.attachMusic)
  .then(window.interaction.attachButtons)
  .then(window.interaction.attachMotion)
  .then((meta) => {console.log("Done loading!");});
