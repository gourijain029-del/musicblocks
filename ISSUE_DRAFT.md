### Description

The console shows warnings related to non-passive event listeners attached to `wheel` events in the following files:

- `js/activity.js`
- `js/widgets/widgetWindows.js`

### Steps to Reproduce

1. Clone the repo and run:
```bash
npm run serve:dev
```
2. Open the app in Chrome
3. Open DevTools → **Console** tab → set level to **"All levels"**
4. Reload the page (`Cmd+R` / `Ctrl+R`)
5. Observe the following warning appearing twice:
```
[Violation] Added non-passive event listener to a scroll-blocking 'wheel' event.
Consider marking event handler as 'passive' to make the page more responsive.
```

### Impact

The browser has to wait to check if `preventDefault()` is called before it can begin scrolling. This may cause scroll lag, especially on touchpads and lower-end devices.

### Expected Behavior

No violation warnings in the console and smoother scrolling performance.

### Files Affected

- `js/activity.js` (~line 3118)
- `js/widgets/widgetWindows.js` (~line 268)

### References

- [MDN: passive event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive)
- [Chrome status: Passive event listeners](https://www.chromestatus.com/feature/5745543795965952)

---

I am currently working on this issue and will submit a PR soon.
