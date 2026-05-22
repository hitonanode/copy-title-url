chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "copy-to-clipboard") {
    return false;
  }

  writeTextToClipboard(message.text)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    });

  return true;
});

async function writeTextToClipboard(text) {
  if (typeof text !== "string") {
    throw new TypeError("Clipboard text must be a string.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("document.execCommand('copy') returned false.");
    }
  } finally {
    textarea.remove();
  }
}
