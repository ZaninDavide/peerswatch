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

  // Fallback: WhatsApp (app if installed, otherwise WhatsApp Web)
  window.open(
    "https://wa.me/?text=" + encodeURIComponent(text),
    "_blank",
    "noopener"
  );
}