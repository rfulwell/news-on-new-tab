// Opens story links from content.js in a background tab next to the results tab.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type !== "open-background" || !sender.tab) return;
  chrome.tabs.create({
    url: msg.url,
    active: false,
    index: sender.tab.index + 1,
    openerTabId: sender.tab.id,
    windowId: sender.tab.windowId,
  });
});
