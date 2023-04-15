let debounceTimer: number;
 
const debounce = (callback: () => void, time: number) => {
  clearTimeout(debounceTimer);
  console.log(debounceTimer);
  debounceTimer = window.setTimeout(callback, time);
  console.log(debounceTimer);
};

let throttleTimer: boolean;
 
const throttle = (callback: () => void, time: number) => {
    if (throttleTimer) return;
    throttleTimer = true;
    setTimeout(() => {
        callback();
        throttleTimer = false;
    }, time);
}

export {debounce, throttle};