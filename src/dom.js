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
const connectionPageText = document.getElementById("connectionPageText")

function show(elem) {
    elem.style.removeProperty("display")
}

function hide(elem) {
    elem.style.setProperty("display", "none")
}

function withDisabledControls(promise) {
  const controls = [...document.querySelectorAll("button, input")]
    .filter(el => !el.disabled);

  controls.forEach(el => { el.disabled = true; });

  return Promise.resolve(promise).finally(() => {
    controls.forEach(el => { el.disabled = false; });
  });
}

function makeOfferURL(offer) {
  const params = new URLSearchParams();
  params.set('offer', offer);
  const baseUrl = window.location.href.split('?')[0];
  return `${baseUrl}?${params.toString()}`;
}

offerCopyButton.onclick = () => copyText(makeOfferURL(offerTextBox.value));
offerShareButton.onclick = () => shareText(makeOfferURL(offerTextBox.value));
answerCopyButton.onclick = () => copyText(answerTextBox.value);
answerShareButton.onclick = () => shareText(answerTextBox.value);