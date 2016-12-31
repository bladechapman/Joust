"use strict";
// console.log("Hello world");
//
// document.addEventListener("DOMContentLoaded", () => {
//   let largest_v = 0;
//
//   window.addEventListener("devicemotion", (event) => {
//     console.log(event);
//
//     let v = event.acceleration.x * event.acceleration.x +
//             event.acceleration.y * event.acceleration.y +
//             event.acceleration.z * event.acceleration.z;
//     if (v > largest_v) {
//       largest_v = v;
//     }
//
//     document.getElementById("timestamp").innerHTML = Date.now();
//     document.getElementById("value").innerHTML = v;
//     document.getElementById("largest").innerHTML = largest_v;
//
//   });
// });

function joinRoom() {
  document.location.href = "/join_room/" + document.getElementById("room_id").value;
}

// document.addEventListener("DOMContentLoaded", () => {
//   // document.getElementById("new").addEventListener("click", () => {
//   //   let newRoomReq = new XMLHttpRequest();
//   //   newRoomReq.open("GET", "/new_room");
//   //   newRoomReq.responseType = "document";
//   //   newRoomReq.send();
//   // });
//   // document.getElementById("join").addEventListener("click", () => {
//   // });
// });
