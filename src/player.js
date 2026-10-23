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

videoPlayerNode.onplay = function (event) {
  message = {
    event: "play",
    time: videoPlayerNode.currentTime,
  }
  sendToPeer(message)
}

videoPlayerNode.onpause = function (event) {
  message = {
    event: "pause",
    time: videoPlayerNode.currentTime,
  }
  sendToPeer(message)
}

/*
videoPlayerNode.onseeked = function (event) {
  message = {
    event: "seeked",
    time: videoPlayerNode.currentTime,
    }
    sendToPeer(message)
}
*/

refreshButton.onclick = function (event) {
  videoPlayerNode.load()
}