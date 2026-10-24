// Makes the "Top stories" previews on https://www.google.com/search?q=headline+news...
// open in a background tab instead of navigating the current one.
(() => {
  "use strict";

  const HEADING_TEXT = "top stories";

  // Links that leave Google (directly, or via a google.com/url?q=... redirect).
  function isStoryLink(a) {
    if (!a.href) return false;
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return false;
    }
    if (!/^https?:$/.test(url.protocol)) return false;
    if (!/(^|\.)google\.[a-z.]+$/.test(url.hostname)) return true;
    return url.pathname === "/url" && (url.searchParams.has("q") || url.searchParams.has("url"));
  }

  // The Top stories block: the nearest ancestor of its heading that holds the story links.
  function findTopStoriesContainers() {
    const containers = [];
    if (!document.body) return containers;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.nodeValue.trim().toLowerCase() !== HEADING_TEXT) continue;
      let node = t.parentElement;
      while (node && node !== document.body) {
        const links = [...node.querySelectorAll("a[href]")].filter(isStoryLink);
        if (links.length >= 2) {
          containers.push(node);
          break;
        }
        node = node.parentElement;
      }
    }
    return containers;
  }

  function storyLinkFor(target) {
    const a = target instanceof Element ? target.closest("a[href]") : null;
    if (!a || !isStoryLink(a)) return null;
    if (!a.dataset.hnNewTab) markAll();
    return a.dataset.hnNewTab ? a : null;
  }

  function mark(a) {
    a.target = "_blank";
    a.rel = "noopener";
    a.dataset.hnNewTab = "1";
  }

  // Mark links up front so long-press / context menus behave too.
  function markAll() {
    for (const c of findTopStoriesContainers()) {
      for (const a of c.querySelectorAll("a[href]")) if (isStoryLink(a)) mark(a);
    }
  }

  // Intercept before Google's own handlers so they can't navigate the current tab,
  // and have the background script open the link in a background tab.
  window.addEventListener(
    "click",
    (e) => {
      if (e.button !== 0) return;
      const a = storyLinkFor(e.target);
      if (!a) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      chrome.runtime.sendMessage({ type: "open-background", url: a.href }).catch(() => {
        // Extension was reloaded/updated under this page: fall back to a normal new tab.
        window.open(a.href, "_blank", "noopener");
      });
    },
    true
  );

  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      markAll();
    });
  }).observe(document, { childList: true, subtree: true });
})();
