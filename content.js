chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.ready === "ready") {
    sendResponse({ download: "download" });
  }
});
