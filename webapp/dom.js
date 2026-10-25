export const connectionPage = document.getElementById("connectionPage")
export const watchPage = document.getElementById("watchPage")
export const closedPage = document.getElementById("closedPage")

export const newRoomButton = document.getElementById("newRoomButton")
export const refreshButton = document.getElementById("refreshButton")
export const peersCounter = document.getElementById("peersCounter")

export const videoInputNode = document.getElementById("videoInput")
export const videoPlayerNode = document.getElementById("videoPlayer")

export function show(elem) {
    elem.style.removeProperty("display")
}

export function hide(elem) {
    elem.style.setProperty("display", "none")
}

export function withDisabledControls(promise) {
  const controls = [...document.querySelectorAll("button, input")]
    .filter(el => !el.disabled);

  controls.forEach(el => { el.disabled = true; });

  return Promise.resolve(promise).finally(() => {
    controls.forEach(el => { el.disabled = false; });
  });
}