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
  peerChannel.onopen = () => {
    console.info('* Connection opened')
    show(watchPage)
    hide(connectionPage)
    hide(closedPage)
  };
  peerChannel.onclose = () => {
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

const getConnectionDescription = async () => {
  await withDisabledControls(new Promise(resolve => {
    if (peerConnection.iceGatheringState === 'complete') return resolve();
    peerConnection.onicegatheringstatechange = () => { 
      if (peerConnection.iceGatheringState === 'complete') { resolve() } 
    };
  }));
  return JSON.stringify(peerConnection.localDescription);
};

offerButton.onclick = async () => {
  setup(peerConnection.createDataChannel('chat'));
  let offerToken = await withDisabledControls(new Promise(async (resolve) => {
    await peerConnection.setLocalDescription(await peerConnection.createOffer());
    resolve(await getConnectionDescription())
  }))
  show(connectButton)
  show(offerTextBox)
  show(offerCopyButton)
  show(offerShareButton)
  hide(answerButton)
  hide(offerButton)
  offerTextBox.value = offerToken;
  connectionPageText.innerText = "Here is your connection offer, send it to your friend. When you'll accept his answer make sure that he is active on its page."
};

answerButton.onclick = async () => {
  let offer = await readClipboard("Paste the offer here");
  let answerToken = await withDisabledControls(new Promise(async (resolve) => {
    await peerConnection.setRemoteDescription(offer);
    await peerConnection.setLocalDescription(await peerConnection.createAnswer());
    resolve(await getConnectionDescription())
  }))
  hide(connectButton)
  hide(answerButton)
  hide(offerButton)
  show(answerTextBox)
  show(answerCopyButton)
  show(answerShareButton)
  answerTextBox.value = answerToken;
  connectionPageText.innerText = "Here is your answer to the offer you received, send it to your friend and keep this page open when he is accepting the answer."
};

connectButton.onclick = async () => {
  let answer = await readClipboard("Paste the answer here");
  peerConnection.setRemoteDescription(answer)
  hide(connectButton)
  hide(offerTextBox)
  hide(offerCopyButton)
  hide(offerShareButton)
  hide(answerTextBox)
  hide(answerCopyButton)
  hide(answerShareButton)
  hide(answerButton)
  hide(offerButton)
  connectionPageText.innerText = "Connecting..."
};

// Bebugging
peerConnection.onsignalingstatechange     = () => console.info('* signaling state: ' + peerConnection.signalingState);
peerConnection.oniceconnectionstatechange = () => console.info('* ICE state: ' + peerConnection.iceConnectionState);
peerConnection.onconnectionstatechange    = () => console.info('* connection state: ' + peerConnection.connectionState);
peerConnection.onicecandidate = e => {
  if (e.candidate) console.info('* candidate:', e.candidate.candidate);
};
peerConnection.onicecandidateerror = e => console.warn('* ICE candidate error:', e.errorCode, e.errorText, e.url);