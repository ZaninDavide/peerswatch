async function copyText(textBox) {
  try {
    await navigator.clipboard.writeText(textBox.value);
  } catch {
    // Fallback for non-secure contexts (plain http on a non-localhost address)
    textBox.select();
    document.execCommand("copy");
    textBox.setSelectionRange(0, 0);
  }
}

async function shareText(textBox) {
  const text = textBox.value;

  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
    }
    return;
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