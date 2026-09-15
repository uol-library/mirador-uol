# Mirador 4 build for the University of Leeds

A minimal custom distribution of the [Mirador](https://github.com/ProjectMirador/mirador) IIIF viewer,
built with Vite and bundled with the
[mirador-downloaddialog](https://github.com/dbmdz/mirador-downloaddialog) and 
[mirador-imagecropper](https://github.com/dbmdz/mirador-imagecropper) plugins.

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
- `src/main.js` — instantiates Mirador, passes in the download dialog plugin, and
  holds your Mirador `config` object (manifests, window options, theme, etc.).
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
- **Matomo tracking** (`src/matomo.js`) — a small custom integration, not an
  off-the-shelf plugin (none exists publicly for Mirador 4). It loads the Matomo
  tracker and subscribes to Mirador's Redux store to fire `trackEvent` calls on
  manifest loads (`OpenManifest`) and canvas navigation (`ViewCanvas`). Set your real
  `matomoUrl` and `siteId` in `src/main.js`.

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
