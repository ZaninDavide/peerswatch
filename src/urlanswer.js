const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const offerFromURL = urlParams.get("offer");

console.log("offer: " + offerFromURL)

if (offerFromURL !== null) {
    answerToOffer(JSON.parse(offerFromURL))
    window.history.replaceState({}, document.title, window.location.pathname);
}