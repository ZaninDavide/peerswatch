const videoInputNode = document.getElementById("videoInput")
const videoPlayerNode = document.getElementById("videoPlayer")

const connectionPage = document.getElementById("connectionPage")
const watchPage = document.getElementById("watchPage")

const connectButton = document.getElementById("connectButton");

const offerButton = document.getElementById("offerButton");
const offerTextBox = document.getElementById("offerTextBox");
const offerCopyButton = document.getElementById("offerCopyButton");
const offerShareButton = document.getElementById("offerShareButton");

const answerButton = document.getElementById("answerButton");
const answerTextBox = document.getElementById("answerTextBox");
const answerCopyButton = document.getElementById("answerCopyButton");
const answerShareButton = document.getElementById("answerShareButton");

const refreshButton = document.getElementById("refreshButton")

function show(elem) {
    elem.style.removeProperty("display")
}
function hide(elem) {
    elem.style.setProperty("display", "none")
}

offerCopyButton.onclick = () => copyText(offerTextBox);
offerShareButton.onclick = () => shareText(offerTextBox);
answerCopyButton.onclick = () => copyText(answerTextBox);
answerShareButton.onclick = () => shareText(answerTextBox);