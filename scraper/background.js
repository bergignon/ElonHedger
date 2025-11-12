let totalsByDate = {}; // { '2025-11-12': 8 }

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'newTweets') {
    msg.tweets.forEach(t => {
      if (!totalsByDate[t.date]) {
        totalsByDate[t.date] = 0;
      }
      totalsByDate[t.date]++;
    });
    chrome.storage.local.set({ totalsByDate });
    chrome.runtime.sendMessage({ type: 'totalsUpdated', totalsByDate });
  } else if (msg.type === 'getTotals') {
    chrome.storage.local.get({ totalsByDate: {} }, data => {
      sendResponse({ totalsByDate: data.totalsByDate });
    });
    return true;
  } else if (msg.type === 'resetTotals') {
    totalsByDate = {};
    chrome.storage.local.set({ totalsByDate });
    chrome.runtime.sendMessage({ type: 'totalsUpdated', totalsByDate });
  }
});