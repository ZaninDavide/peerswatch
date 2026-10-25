"use strict";

// The socket.io library on our server is automatically
// serving this file so that here we can load it like this
// and the client will always use the same socket.it version
// that the server is also using. 
import { io } from "/socket.io/socket.io.esm.min.js"
import { connectionPage, watchPage, closedPage, peersCounter, hide, show } from "./dom.js"
import { processMessageFromPeer } from "./player.js"

// This defaults to connecting to the WebSocket channel 
// of the same server that is serving the webapp so we 
// can just leave the call to io() empty. Notice that the
// io() function is defined in the socket.io script.
// The WebSocket connection is with the server and all 
// communication with the server will happen via the open
// WebSocket. The server will make sure that the only the
// correct peers will be notified of the corrects events.
const socket = io();

// CONNECTION AND AUTO-JOIN

function physicallyEnterRoom(roomId) {
  window.history.replaceState(null, "", `/r/${roomId}`)
  show(watchPage)
  hide(connectionPage)
  hide(closedPage)
}

function getRoomIdFromUrl() {
  const match = location.pathname.match(/^\/r\/([^/]+)\/?$/)
  return match ? match[1] : null
}

socket.on("connect", () => {
  const roomIdFromUrl = getRoomIdFromUrl();
  if (roomIdFromUrl) {
    socket.emit("join-room", roomIdFromUrl, (res) => {
      if (!res.ok) return window.location.replace("/");
      physicallyEnterRoom(roomIdFromUrl)
    });
  }
});

// CREATE ROOM

newRoomButton.onclick = function() {
  socket.emit("create-room", (res) => {
    if (!res.ok) return alert(res.error);
    physicallyEnterRoom(res.roomId)
  });
}

// COMMUNICATION

export function sendToPeers(msg) {
  socket.emit("send-to-peers", msg, (res) => {
    if (!res.ok) return console.error(res.error);
  });
}

socket.on("peer-message", processMessageFromPeer)

socket.on("peers-count", count => {
  peersCounter.innerText = count.toString()
})