### Run

Install dependencies with `npm install`, then start the radio with `npm run dev`.
Serve the page over HTTP rather than opening `index.html` directly so YouTube can identify the embedding site.

### Controls

- **Songs:** open the left-edge tab to browse 19 YouTube mixes in a vertically scrolling sidebar. Titles and thumbnails load from YouTube's key-free oEmbed API when opened; failed requests leave a selectable fallback, and the player updates titles when available.
- **Backgrounds:** open the bottom tab to browse 48 image previews. Swipe, mouse-drag, scroll, or use the arrows to move left/right. Click a preview to apply it and turn off random changes.
- **Random on song change:** the checkbox in the background tray picks a different image when changing songs. Uncheck it to keep the current scene.
- Close either picker with its × button, Escape, or a click outside it.
- **Volume:** updates immediately and supports muting at zero.
- Playback starts when YouTube permits autoplay; otherwise press **play**. Unavailable videos can be skipped or replaced using the song selector.

Run `npm test` for player regression tests (Node.js 18+), and `npm run lint` for JavaScript linting.
The image catalog is in `src/vid.js`; the tests check that it matches `assets/img/images` exactly. Song metadata and previews use YouTube's servers; no API key is required.

### Credits
 - The CRT effect : `https://github.com/namishh/onesemester`
 - Scanline : `https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh`
 - ASCII Rest: `https://ascii.rest/`
