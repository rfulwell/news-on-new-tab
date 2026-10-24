# Headline News: Open in New Tab

A tiny Manifest V3 extension (Brave / Chrome / any Chromium browser). On pages starting with
`https://www.google.com/search?q=headline+news`, clicking or tapping a **Top stories** preview opens
the story in a new tab instead of navigating the current one. Nothing else on the page, or on any
other site, is touched. No permissions, no background script.

## Install (sideload)

1. Open the latest [Release](../../releases/latest) and download `headline-news-new-tab-vX.Y.Z.zip`.
2. Unzip it to a folder you'll keep (the browser loads it from there).
3. Go to `brave://extensions` (or `chrome://extensions`), turn on **Developer mode**.
4. Click **Load unpacked** and choose the unzipped folder.

To update: download the new zip, replace the folder contents, and click the reload icon on the
extension card.

## How it works

`extension/content.js` finds the "Top stories" heading, marks the story links in that block with
`target="_blank"`, and intercepts clicks on them in the capture phase so Google's own click handlers
can't navigate the current tab. The browser then opens the link in a new tab.

## CI

`.github/workflows/build.yml` validates and zips `extension/` on every push. On `main` it publishes
a GitHub Release tagged `v<manifest version>` (bump `version` in `extension/manifest.json` for a new
release; otherwise the existing release's zip is replaced).
