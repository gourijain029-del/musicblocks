## Description

Fixes #6597 — Non-passive wheel event listeners causing scroll-blocking performance warnings.

## PR Category

- [x] Performance

## Problem

On every page load, Chrome DevTools reported two `[Violation]` warnings:

```
[Violation] Added non-passive event listener to a scroll-blocking 'wheel' event.
Consider marking event handler as 'passive' to make the page more responsive.
```

The browser had to wait to check if `preventDefault()` would be called before allowing scroll to proceed, causing potential scroll lag.

## Changes Made

- **`js/activity.js`** — Added `{ passive: true }` to the `wheel` listener used for idle timer reset
- **`js/widgets/widgetWindows.js`** — Added `{ passive: true }` to the `wheel` and `DOMMouseScroll` listeners in `disableScroll`

Neither handler calls `preventDefault()`, so marking them passive is safe with no behavior change.

## Testing Performed

- ✅ Loaded the app locally — zero `[Violation]` warnings in the console
- ✅ Scrolling behavior unchanged
- ✅ Widget scroll lock still works correctly

## Checklist

- [x] I have tested these changes locally and they work as expected
- [x] I have run `npm run lint` with no errors
- [x] I have run `npx prettier --check .` with no errors

## Screenshots

### Before (violations present)
<!-- Add screenshot showing the [Violation] warnings in the console -->

### After (violations resolved)
<!-- Add screenshot showing clean console with no [Violation] warnings -->
