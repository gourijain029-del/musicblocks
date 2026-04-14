## Description

The application used a hybrid loading strategy — mixing global `<script>` tags in `index.html` with RequireJS — causing race conditions, unpredictable dependency resolution, and a fragile bootstrap process. This PR standardizes on RequireJS as the single module loading mechanism by removing all global script tags and properly wiring every dependency through RequireJS.

## Related Issue

This PR fixes #6333

## PR Category

-   [x] Bug Fix — Fixes a bug or incorrect behavior
-   [ ] Feature — Adds new functionality
-   [x] Performance — Improves performance (load time, memory, rendering, etc.)
-   [ ] Tests — Adds or updates test coverage
-   [ ] Documentation — Updates to docs, comments, or README

## Changes Made

-   Removed all global `<script src="...">` tags from `index.html` — jQuery, Materialize, Tone.js, EaselJS, TweenJS, libgif, gif-animator, astring, acorn, mb-dialog, env.js, and others
-   Load jQuery via RequireJS; temporarily hide `define` before loading Materialize to prevent Materialize's bundled Velocity from calling anonymous `define()` and conflicting with RequireJS
-   Load `Tone`, `libgif`, and `gif-animator` via RequireJS; explicitly set `window.Tone`, `window.SuperGif`, and `window.GIFAnimator` after AMD load so `activity.js` `globalsReady` check passes
-   Add `utils/zoomOverlay` to RequireJS shim, paths, and `CORE_BOOTSTRAP_MODULES` — removes the last remaining global script tag
-   Add `libgif` and `activity/gif-animator` to `MYDEFINES` in `activity.js`
-   Switch `libgif` path from CDN to local `lib/libgif`
-   Remove `waitForGlobals` polling loop — no longer needed since EaselJS loads through RequireJS
-   Remove `PRELOADED_SCRIPTS` pre-define hack — existed only to bridge the hybrid gap
-   Remove duplicate broken fullscreen script block from `index.html` (had malformed `}} )` closure)
-   Guard `createjs.Stage` check in `index.html` `init()` to handle incremental EaselJS initialization

## Testing Performed

-   Loaded app locally via `npm run serve:dev` on `http://127.0.0.1:3000`
-   App loads fully with toolbar, palette, and blocks rendering correctly
-   Music plays on clicking Play button
-   Save dropdown opens correctly (Materialize working)
-   Zoom overlay appears on `Ctrl+scroll` (`zoomOverlay.js` loading via RequireJS)
-   Fullscreen toggle works correctly
-   No RequireJS errors or undefined global errors in console
-   `npm run lint` — 0 errors
-   `npx prettier --check` — all files pass

## Checklist

-   [x] I have tested these changes locally and they work as expected.
-   [ ] I have added/updated tests that prove the effectiveness of these changes.
-   [x] I have updated the documentation to reflect these changes, if applicable.
-   [x] I have followed the project's coding style guidelines.
-   [x] I have run `npm run lint` and `npx prettier --check .` with no errors.
-   [ ] I have addressed the code review feedback from the previous submission, if applicable.

## Additional Notes for Reviewers

The key challenge was that several libraries (Materialize/Velocity, Tone.js, libgif) are UMD modules that detect `define.amd` and self-register via AMD — but don't set `window.*` globals. The `globalsReady` check in `activity.js` requires `window.Tone`, `window.SuperGif`, and `window.GIFAnimator` to be defined. The fix explicitly sets these on `window` after RequireJS loads them, and temporarily hides `define` during Materialize load to prevent Velocity's anonymous `define()` from conflicting with RequireJS.
