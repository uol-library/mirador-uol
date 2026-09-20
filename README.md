# Mirador 4 build for the University of Leeds

A minimal custom distribution of the [Mirador](https://github.com/ProjectMirador/mirador) IIIF viewer,
built with Vite and bundled with the
[mirador-downloaddialog](https://github.com/dbmdz/mirador-downloaddialog), 
[mirador-imagecropper](https://github.com/dbmdz/mirador-imagecropper), 
[mirador-image-tools](https://github.com/ProjectMirador/mirador-image-tools) and
[mirador-share](https://github.com/ProjectMirador/mirador-share-plugin) plugins.

Mirador plugins only work with the **ES module** build of Mirador, not the plain 
UMD/CDN `<script>` embed — so a real build step (Vite here, per Mirador's own 
recommendation) is required as soon as you want to load any plugins.

## Getting started

```bash
npm install
npm run dev      # dev server with hot reload, http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

## Project layout

- `index.html` — page shell, mounts Mirador into `#mirador`.
- `src/main.js` — instantiates Mirador, passes in the download plugins, and
  holds the Mirador `config` object (manifests, window options, theme, etc.).
- `src/matomo.js` — loads the Matomo tracker and subscribes to Mirador's Redux 
  store to fire `trackEvent` calls on manifest loads (`OpenManifest`) and canvas 
  navigation (`ViewCanvas`).
- `src/plugins/` — folder containing plugin files.
- `package.json` — `mirador` and `mirador-downloaddialog` are pinned to the latest
  compatible major versions (Mirador 4.x, plugin 1.x, React 19, MUI 7).

## Customizing

- **Manifests / windows**: edit the `windows` array in `src/main.js`.
- **Theming**: Mirador uses MUI's theme system — pass a `theme` key in `miradorConfig`.

## Plugins included

- **[mirador-downloaddialog](https://github.com/dbmdz/mirador-downloaddialog)** — adds
  a download dialog to each window. Configure under `window.downloadDialog` (global)
  or per-window. Options: `enabled` (bool, default `true`), `dialogOpen` (bool, default
  `false`). The plugin exposes a `PluginHook` target and lets you wrap its 
  `DownloadDialog` component with your own children — see the "Extending" section of 
  the [plugin's README](https://github.com/dbmdz/mirador-downloaddialog#extending)
  for the two supported approaches.
- **[mirador-imagecropper](https://github.com/dbmdz/mirador-imagecropper)** — adds a
  crop-and-copy-URL tool to each window. Configure under `window.imageCropper` (global)
  or per-window. Options: `active`, `dialogOpen`, `enabled`, `roundingPrecision`,
  `showRightsInformation` — see the plugin's README for details.
- **[mirador-image-tools](https://github.com/ProjectMirador/mirador-image-tools)** — 
  adds image manipulation tools to the UI. Config options are `imageToolsEnabled` and
  `imageToolsOpen` which are both set to `true` in this repo.
- **[mirador-share-plugin](https://github.com/ProjectMirador/mirador-share-plugin)** — 
  adds several options for sharing a resource. Configuration of this plugin is minimal
  in this repo and documented in the plugin's 
  [README](https://github.com/ProjectMirador/mirador-share-plugin/blob/main/README.md).
- **Matomo tracking** (`src/matomo.js`) — a small custom integration, not an
  off-the-shelf plugin (none exists publicly for Mirador 4). It loads the Matomo
  tracker and subscribes to Mirador's Redux store to fire `trackEvent` calls on
  manifest loads (`OpenManifest`) and canvas navigation (`ViewCanvas`). Set your real
  `matomoUrl` and `siteId` in `src/main.js`.
- **Extra download sizes** (`plugins/downloadDialogExtraSizes.jsx`,
  `plugins/ExtraDownloadSizes.jsx`). `mirador-downloaddialog` only lists image sizes 
  present in each canvas's *main* IIIF Image API `info.json` `sizes` array (plus the 
  canvas's own full/original size). `src/plugins/downloadDialogExtraSizes.jsx` follows 
  the plugin's
  [Extending documentation](https://github.com/dbmdz/mirador-downloaddialog#extending)
  pattern. it swaps in a wrapped `DownloadDialog` (keeping every other component
  the plugin exports, e.g. the toolbar button, untouched) whose `children` render
  an "Thumbnails" section per canvas, built in `src/plugins/ExtraDownloadSizes.jsx`.
  This component reads thumbnail sizes from the manifest, getting them for each canvas 
  in its `sizes` array. Because the thumbnail service has its own separate image identifier 
  from the main image service (e.g. a `/thumbs/` path vs `/image/` path), links are built 
  directly from that service's own `id`, not from `canvas.getCanonicalImageUri()` (which 
  only knows about the main image service). The component fetches the manifest JSON itself 
  (via the `manifestUrl` prop the plugin already receives) and caches it per URL, since the 
  shape needed (`thumbnail[i].service[j]`) isn't exposed through any canvas helper method.

## Deploying

`npm run build` outputs a static `dist/` folder — host it anywhere that serves
static files (Netlify, S3/CloudFront, GitHub Pages, nginx, etc). There's no
server-side component.

## Notes

- **Pin versions explicitly.** `npm install mirador-downloaddialog` with no version
  can resolve to old 0.x releases (built for Mirador 3 + Material-UI 4) depending on
  what's already in your lockfile/tree, which conflicts with a fresh Mirador 4 install.
  This project pins `mirador-downloaddialog@^1.0.0`, which targets Mirador 4.x /
  React 19 — matching Mirador's own peer dependencies.
