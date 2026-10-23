async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for non-secure contexts (plain http on a non-localhost address)
    textBox.select();
    document.execCommand("copy");
    textBox.setSelectionRange(0, 0);
  }
}

async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
    }
  }

  window.open(
    "https://wa.me/?text=" + encodeURIComponent(text),
    "_blank",
    "noopener"
  );
}

async function readClipboard(prompt) {
  try {
    return JSON.parse(await navigator.clipboard.readText());
  } catch {
    const pasted = window.prompt(prompt);
    return pasted ? JSON.parse(pasted) : null;
  }
}