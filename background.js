const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
const BADGE_CLEAR_DELAY_MS = 1200;

let creatingOffscreenDocument;

chrome.action.onClicked.addListener((tab) => {
  copyCurrentTab(tab).catch(async (error) => {
    console.error("Failed to copy the current tab as Markdown.", error);

    if (tab?.id) {
      await showBadge(tab.id, "ERR", "#a50e0e");
    }
  });
});

async function copyCurrentTab(tab) {
  if (!tab?.id) {
    throw new Error("No active tab id was provided.");
  }

  if (!tab.url) {
    throw new Error("No active tab URL was provided.");
  }

  const title = tab.title || tab.url;
  const markdown = formatMarkdownLink(title, tab.url);

  await copyToClipboard(markdown);
  await showBadge(tab.id, "OK", "#188038");
}

function formatMarkdownLink(title, url) {
  return `[${escapeMarkdownTitle(title)}](${escapeMarkdownUrl(url)})`;
}

function escapeMarkdownTitle(title) {
  return title
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function escapeMarkdownUrl(url) {
  return url
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

async function copyToClipboard(text) {
  await ensureOffscreenDocument();

  const response = await chrome.runtime.sendMessage({
    type: "copy-to-clipboard",
    text
  });

  if (!response?.ok) {
    throw new Error(response?.error || "Clipboard write failed.");
  }
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ["CLIPBOARD"],
      justification: "Write the current tab title and URL to the clipboard."
    });
  }

  try {
    await creatingOffscreenDocument;
  } finally {
    creatingOffscreenDocument = undefined;
  }
}

async function hasOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);

  if ("getContexts" in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [offscreenUrl]
    });

    return contexts.length > 0;
  }

  const matchedClients = await clients.matchAll();
  return matchedClients.some((client) => client.url === offscreenUrl);
}

async function showBadge(tabId, text, color) {
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
  await chrome.action.setBadgeText({ tabId, text });

  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
  }, BADGE_CLEAR_DELAY_MS);
}
