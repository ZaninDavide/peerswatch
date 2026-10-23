"use strict";

// COMMUNICATION

let peerChannel;

function messageFromPeer(msg) {
  // Safety checks
  if (msg.constructor !== Object) { return; }
  if (!("event" in msg)) { return; }
  if (!("time" in msg)) { return; }

  // Event handling
  if (msg.event === "play") {
    videoPlayerNode.currentTime = msg.time
    if (videoPlayerNode.paused) { videoPlayerNode.play() }
  } else if (msg.event === "pause") {
    videoPlayerNode.currentTime = msg.time
    if (!videoPlayerNode.paused) { videoPlayerNode.pause() }
  }

}

function sendToPeer(msg) {
  if (peerChannel) {
    peerChannel.send(JSON.stringify(msg));
  }
}

function setup(channel) {
  peerChannel = channel;
  peerChannel.onopen    = () => {
    console.info('* Connection opened')
    show(watchPage)
    hide(connectionPage)
    hide(closedPage)
  };
  peerChannel.onclose   = () => {
    console.info('* Connection closed')
    show(closedPage)
    hide(connectionPage)
    hide(watchPage)
  };
  peerChannel.onmessage = e => messageFromPeer(JSON.parse(e.data));
}
  
// CONNECTION

const peerConnection = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
peerConnection.ondatachannel = e => setup(e.channel);

const showLocal = async () => {
  await new Promise(res => {
    if (peerConnection.iceGatheringState === 'complete') return res();
    peerConnection.onicegatheringstatechange = () =>
    peerConnection.iceGatheringState === 'complete' && res();
  });
  return JSON.stringify(peerConnection.localDescription);
};

offerButton.onclick = async () => {
  // Peer A
  setup(peerConnection.createDataChannel('chat'));
  await peerConnection.setLocalDescription(await peerConnection.createOffer());
  let offerToken = await showLocal();
  show(connectButton)
  show(offerTextBox)
  show(offerCopyButton)
  show(offerShareButton)
  hide(answerButton)
  hide(offerButton)
  offerTextBox.value = offerToken;
};
answerButton.onclick = async () => {
  let offer;
  try {
    offer = await navigator.clipboard.readText();
    offer = JSON.parse(offer);
  } catch (error) {
    window.alert("Failed to read offer from clipboard: " + error)
  }
  // Peer B
  await peerConnection.setRemoteDescription(offer);
  await peerConnection.setLocalDescription(await peerConnection.createAnswer());
  let answerToken = await showLocal();
  hide(connectButton)
  hide(answerButton)
  hide(offerButton)
  show(answerTextBox)
  show(answerCopyButton)
  show(answerShareButton)
  answerTextBox.value = answerToken;
};
connectButton.onclick = async () => {
  let answer;
  try {
    answer = await navigator.clipboard.readText();
    answer = JSON.parse(answer);
  } catch (error) {
    window.alert("Failed to read answer from clipboard: " + error)
  }
  peerConnection.setRemoteDescription(answer)
  hide(connectButton)
  hide(answerTextBox)
  hide(answerCopyButton)
  hide(answerShareButton)
  hide(answerButton)
  hide(offerButton)
};

// Bebugging
peerConnection.onsignalingstatechange     = () => console.info('* signaling state: ' + peerConnection.signalingState);
peerConnection.oniceconnectionstatechange = () => console.info('* ICE state: ' + peerConnection.iceConnectionState);
peerConnection.onconnectionstatechange    = () => console.info('* connection state: ' + peerConnection.connectionState);