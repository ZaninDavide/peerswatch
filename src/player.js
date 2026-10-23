let guardingPause = 0
function guardedPause() {
  guardingPause += 1
  videoPlayerNode.pause()
}

let guardingPlay = 0
function guardedPlay() {
  guardingPlay += 1
  videoPlayerNode.play()
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

  message = {
    event: "play",
    time: videoPlayerNode.currentTime,
  }
  sendToPeer(message)
}

videoPlayerNode.onpause = async function (event) {
  if (guardingPause > 0) { 
    guardingPause -= 1
    return;
  }

  message = {
    event: "pause",
    time: videoPlayerNode.currentTime,
  }
  sendToPeer(message)
}

refreshButton.onclick = function (event) {
  videoPlayerNode.load()
}

function messageFromPeer(msg) {
  // Safety checks
  if (msg.constructor !== Object) { return; }
  if (!("event" in msg)) { return; }
  if (!("time" in msg)) { return; }

  // Event handling
  if (msg.event === "play") {
    videoPlayerNode.currentTime = msg.time
    if (videoPlayerNode.paused) { guardedPlay() }
  } else if (msg.event === "pause") {
    videoPlayerNode.currentTime = msg.time
    if (!videoPlayerNode.paused) { guardedPause() }
  } else if (msg.event === "click") {
    videoPlayerNode.currentTime = msg.time
  }
}