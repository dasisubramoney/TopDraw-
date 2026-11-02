# Bespoke project photos

Every photo in this folder appears in the **Bespoke** gallery (the "Bespoke" tab in the site menu).
The tab only shows once there is at least one photo here.

## Adding photos

1. Save the photo in this folder as `.webp` (best), `.jpg` or `.png`, with a lower-case
   extension. iPhone `.heic` photos aren't supported: export them as JPEG first.
2. Name it after what it shows, with a number in front to set the order, e.g.
   `01-steel-and-oak-desk.webp`, `02-walnut-bar-counter.webp`.
   The name becomes the caption and the alt text: `01-steel-and-oak-desk.webp` shows as
   "Steel and oak desk". Avoid camera names like `IMG_1234.jpg`, which would show as "IMG 1234".
3. Rebuild (`npm run build`), or push and let Netlify build.

## Size

Photos are served exactly as saved, so keep each one around 1600 px on its longest side and under
about 400 KB. A phone photo straight off the camera (4000 px, 3 to 5 MB) slows the gallery down.

No photos of Trevor: he doesn't want his picture on the site.
