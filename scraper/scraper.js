(function () {
  if (window.__elon_tweet_counter_installed) return;
  window.__elon_tweet_counter_installed = true;

  console.log("[Elon Counter] Content script loaded");

  const seen = new Set(); // track already processed tweets
  let totalsByDate = {};   // { '2025-11-12': { tweets: 5 } }

  // Extract tweet info
  function extractTweetInfo(article) {
    try {
      const link = article.querySelector('a[href*="/status/"]');
      if (!link) return null;

      const match = link.href.match(/status\/(\d+)/);
      if (!match) return null;
      const tweetId = match[1];
      if (seen.has(tweetId)) return null; // skip already counted
      seen.add(tweetId);

      const timeElem = article.querySelector('time');
      const date = timeElem ? timeElem.getAttribute('datetime').split('T')[0] : null;
      if (!date) return null;

      return { tweetId, date };
    } catch (err) {
      console.error("Error parsing tweet:", err);
      return null;
    }
  }

  // Scan current tweets
  function scan() {
    const articles = document.querySelectorAll('article[role="article"][data-testid="tweet"]');
    const newTweets = [];

    articles.forEach(article => {
      const info = extractTweetInfo(article);
      if (info) newTweets.push(info);
    });

    if (newTweets.length) {
      // Update totals
      newTweets.forEach(t => {
        if (!totalsByDate[t.date]) totalsByDate[t.date] = { tweets: 0 };
        totalsByDate[t.date].tweets++;
      });

      // Send updated totals to background
      chrome.runtime.sendMessage({ type: "newTweets", tweets: newTweets });
    }
  }

  // Observe dynamically loaded tweets
  const observer = new MutationObserver((mutations) => {
    let added = false;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (
          node.matches('article[role="article"][data-testid="tweet"]') ||
          node.querySelector('article[role="article"][data-testid="tweet"]')
        ) {
          added = true;
          break;
        }
      }
      if (added) break;
    }
    if (added) scan();
  });

  // Start observing feed
  function startObserver() {
    const feed = document.querySelector("div[role='feed']") || document.querySelector("main[role='main']") || document.body;
    if (feed) {
      observer.observe(feed, { childList: true, subtree: true });
      console.log("[Elon Counter] Observer attached");
      scan(); // initial scan
    } else {
      console.log("[Elon Counter] Feed not found yet, retrying...");
      setTimeout(startObserver, 1000);
    }
  }

  startObserver();
})();