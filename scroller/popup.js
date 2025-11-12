const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const speedInput = document.getElementById('speed');
const pauseIntervalInput = document.getElementById('pauseInterval');
const pauseDurationInput = document.getElementById('pauseDuration');

function updateStatus(isRunning) {
  if (isRunning) {
    status.textContent = '▶️ Auto-scroll active';
    status.className = 'status active';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    status.textContent = '⏹️ Auto-scroll stopped';
    status.className = 'status stopped';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

startBtn.addEventListener('click', () => {
  const speed = parseInt(speedInput.value, 10);
  const pauseInterval = parseInt(pauseIntervalInput.value, 10);
  const pauseDuration = parseInt(pauseDurationInput.value, 10);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (speed, pauseInterval, pauseDuration) => {
        if (!window.autoScrollState) {
          window.autoScrollState = {
            interval: null,
            timeout: null,
            active: false,
            scrollTime: 0
          };
        }

        const state = window.autoScrollState;

        function stopScroll() {
          if (state.interval) clearInterval(state.interval);
          if (state.timeout) clearTimeout(state.timeout);
          state.interval = null;
          state.timeout = null;
          state.active = false;
          console.log('⏹️ Auto-scroll stopped');
        }

        function startScroll() {
          if (state.active) return;
          state.active = true;
          state.scrollTime = 0;

          function scroll() {
            if (!state.active) {
              stopScroll();
              return;
            }

            window.scrollBy(0, speed);
            state.scrollTime += 0.016; 

            if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
              stopScroll();
              return;
            }

            if (state.scrollTime >= pauseInterval) {
              clearInterval(state.interval);
              state.interval = null;
              state.timeout = setTimeout(() => {
                state.timeout = null;
                if (!state.active) return;
                state.scrollTime = 0;
                state.interval = setInterval(scroll, 16);
              }, pauseDuration * 1000);
            }
          }

          state.interval = setInterval(scroll, 16);
        }

        window.stopAutoScroll = stopScroll;
        startScroll();
      },
      args: [speed, pauseInterval, pauseDuration]
    });
    updateStatus(true);
  });
});

stopBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (window.stopAutoScroll) window.stopAutoScroll();
      }
    });
    updateStatus(false);
  });
});