(function () {
  console.log('[Tweet Counter] Starting...');
  
  if (window.__elon_tweet_counter_installed) {
    console.log('[Tweet Counter] Already installed, skipping');
    return;
  }
  window.__elon_tweet_counter_installed = true;
  console.log('[Tweet Counter] Installing...');

  if (!window.__elon_seen_tweets) {
    window.__elon_seen_tweets = new Set();
  }
  const seen = window.__elon_seen_tweets;
  let scanTimeout = null;

  function extractTweetInfo(article) {
    try {
      let link = article.querySelector('time')?.closest('a');
      if (!link) {
        link = article.querySelector('a[href*="/status/"]:not([role="link"])');
      }
      if (!link) {
        const allLinks = article.querySelectorAll('a[href*="/status/"]');
        link = allLinks[0];
      }

      if (!link) return null;

      const match = link.href.match(/\/status\/(\d+)/);
      if (!match) return null;

      const tweetId = match[1];
      if (seen.has(tweetId)) return null;

      const timeElem = article.querySelector("time");
      if (!timeElem) return null;

      const datetime = timeElem.getAttribute("datetime");
      if (!datetime) return null;

      const date = datetime.split("T")[0];
      seen.add(tweetId);

      return { tweetId, date };
    } catch (err) {
      return null;
    }
  }

  function scan() {
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }

    const articles = document.querySelectorAll(
      'article[role="article"][data-testid="tweet"]'
    );
    
    const newTweets = [];
    articles.forEach((article) => {
      const info = extractTweetInfo(article);
      if (info) {
        newTweets.push(info);
      }
    });

    if (newTweets.length) {
      chrome.runtime.sendMessage({ type: "newTweets", tweets: newTweets }, () => {
        if (chrome.runtime.lastError) {
          // Silently handle errors (extension might be reloading)
        }
      });
    }
  }

  function debouncedScan() {
    if (scanTimeout) {
      clearTimeout(scanTimeout);
    }
    scanTimeout = setTimeout(scan, 300);
  }

  const observer = new MutationObserver((mutations) => {
    const hasNewTweets = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType !== 1) return false;
        return node.matches?.('article[data-testid="tweet"]') ||
               node.querySelector?.('article[data-testid="tweet"]');
      });
    });

    if (hasNewTweets) {
      debouncedScan();
    }
  });

  function startObserver() {
    const feed =
      document.querySelector("div[role='feed']") ||
      document.querySelector("main[role='main']") ||
      document.body;

    if (feed) {
      observer.observe(feed, { 
        childList: true, 
        subtree: true 
      });
      scan();
    } else {
      setTimeout(startObserver, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

  setInterval(debouncedScan, 1500);

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(debouncedScan, 500);
  }, { passive: true });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'resetData') {
      seen.clear();
      sendResponse({ success: true });
    }
    return true;
  });
})();