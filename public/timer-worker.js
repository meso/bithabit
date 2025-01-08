let timer = null;
let startTime = null;
let elapsedTime = 0;

self.onmessage = function(e) {
  if (e.data.action === 'start') {
    startTime = Date.now() - elapsedTime;
    timer = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      self.postMessage({ time: elapsedTime });
    }, 1000);
  } else if (e.data.action === 'stop') {
    clearInterval(timer);
    timer = null;
  } else if (e.data.action === 'reset') {
    elapsedTime = 0;
    if (timer) {
      clearInterval(timer);
      startTime = Date.now();
      timer = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        self.postMessage({ time: elapsedTime });
      }, 1000);
    }
  }
};

