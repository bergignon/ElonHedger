let totalsByDate = {}; // { '2025-11-12': 8 }

// Load existing data on startup
chrome.storage.local.get({ totalsByDate: {} }, (data) => {
  totalsByDate = data.totalsByDate;
  console.log('Background script loaded, existing data:', totalsByDate);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received message:', msg.type, 'from tab:', sender.tab?.id);
  
  if (msg.type === "newTweets") {
    console.log('Processing tweets:', msg.tweets);
    msg.tweets.forEach((t) => {
      if (!totalsByDate[t.date]) {
        totalsByDate[t.date] = 0;
      }
      totalsByDate[t.date]++;
    });
    console.log('Updated totals:', totalsByDate);
    chrome.storage.local.set({ totalsByDate }, () => {
      console.log('Saved to storage');
    });
    chrome.runtime.sendMessage({ type: "totalsUpdated", totalsByDate }).catch(() => {});
    sendResponse({ success: true });
    return true;
  } else if (msg.type === "getTotals") {
    chrome.storage.local.get({ totalsByDate: {} }, (data) => {
      sendResponse({ totalsByDate: data.totalsByDate });
    });
    return true;
  } else if (msg.type === "resetTotals") {
    console.log('Resetting data');
    totalsByDate = {};
    chrome.storage.local.set({ totalsByDate });
    chrome.runtime.sendMessage({ type: "totalsUpdated", totalsByDate }).catch(() => {});
    
    // Send reset message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'resetData' }).catch(() => {});
      });
    });
    sendResponse({ success: true });
    return true;
  }
  
  return false;
});