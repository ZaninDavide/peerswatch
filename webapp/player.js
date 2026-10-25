import { videoInputNode, videoPlayerNode, refreshButton } from "./dom.js"
import { sendToPeers } from "./peers.js"

let guardingPause = 0
function guardedPause() {
  if (!videoPlayerNode.paused) { 
    guardingPause += 1
    videoPlayerNode.pause()
  }
}

let guardingPlay = 0
function guardedPlay() {
  if (videoPlayerNode.paused) { 
    guardingPlay += 1
    videoPlayerNode.play()
  }
}

let guardingTimeChange = 0
function guardedTimeChange(time) {
  if (videoPlayerNode.currentTime != time) { 
    guardingTimeChange += 1
    videoPlayerNode.currentTime = time
  }
}

videoInputNode.onchange = function (event) {
  // Read input file
  let file = this.files[0]

  // Check file type is playable
  if (!videoPlayerNode.canPlayType(file.type)) { return }
  
  // Play
  let URL = window.URL || window.webkitURL
  videoPlayerNode.src = URL.createObjectURL(file)
  videoPlayerNode.load()
}

videoPlayerNode.onplay = async function (event) {
  if (guardingPlay > 0) { 
    guardingPlay -= 1
    return;
  }

  const message = {
    event: "play",
    time: videoPlayerNode.currentTime,
  }
  sendToPeers(message)
}

videoPlayerNode.onpause = async function (event) {
  if (guardingPause > 0) { 
    guardingPause -= 1
    return;
  }

  const message = {
    event: "pause",
    time: videoPlayerNode.currentTime,
  }
  sendToPeers(message)
}

let lastTimeChangeEvent = 0
videoPlayerNode.ontimeupdate = async function (event) {
  if (guardingTimeChange > 0) { 
    guardingTimeChange -= 1
    return;
  }
  
  if (!videoPlayerNode.paused) { return; }
  if (videoPlayerNode.currentTime == lastTimeChangeEvent) { return; }
  lastTimeChangeEvent = videoPlayerNode.currentTime
  const message = {
    event: "timeupdate",
    time: videoPlayerNode.currentTime,
  }
  sendToPeers(message)
}

refreshButton.onclick = function (event) {
  videoPlayerNode.load()
}

export function processMessageFromPeer(msg) {
  // Safety checks
  if (msg.constructor !== Object) { return; }
  if (!("event" in msg)) { return; }
  if (!("time" in msg)) { return; }

  // Event handling
  if (msg.event === "play") {
    guardedTimeChange(msg.time)
    guardedPlay()
  } else if (msg.event === "pause") {
    guardedTimeChange(msg.time)
    guardedPause()
  } else if (msg.event === "timeupdate") {
    guardedTimeChange(msg.time)
    guardedPause()
  }
}