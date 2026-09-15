# Mirador 4 build for the University of Leeds

A minimal custom distribution of the [Mirador](https://github.com/ProjectMirador/mirador) IIIF viewer,
built with Vite and bundled with the
[mirador-downloaddialog](https://github.com/dbmdz/mirador-downloaddialog) plugin.

This scaffold exists because Mirador plugins only work with the **ES module** build
of Mirador, not the plain UMD/CDN `<script>` embed — so a real build step (Vite here,
per Mirador's own recommendation) is required as soon as you want to load any plugins.

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
- **Download dialog behavior**: configure globally under `window.downloadDialog` or
  per-window under an individual window's `downloadDialog` key. Available options:
  `enabled` (bool, default `true`) and `dialogOpen` (bool, default `false`).
- **Extending the download dialog itself**: the plugin exposes a `PluginHook` target
  and lets you wrap its `DownloadDialog` component with your own children — see the
  "Extending" section of the [plugin's README](https://github.com/dbmdz/mirador-downloaddialog#extending)
  for the two supported approaches.
- **Theming**: Mirador uses MUI's theme system — pass a `theme` key in `miradorConfig`.
- **Other plugins**: install from npm, import, and add `...pluginName` to the plugins
  array passed as the second argument to `Mirador.viewer(config, [...plugins])`.
  You can combine multiple plugins by spreading each into that same array. An example
  has been added using this method ([mirador-imagecropper](https://github.com/dbmdz/mirador-imagecropper)).

## Deploying

`npm run build` outputs a static `dist/` folder — host it anywhere that serves
static files (Netlify, S3/CloudFront, GitHub Pages, nginx, etc). There's no
server-side component.

## Notes / gotchas encountered while setting this up

- **Pin versions explicitly.** `npm install mirador-downloaddialog` with no version
  can resolve to old 0.x releases (built for Mirador 3 + Material-UI 4) depending on
  what's already in your lockfile/tree, which conflicts with a fresh Mirador 4 install.
  This project pins `mirador-downloaddialog@^1.0.0`, which targets Mirador 4.x /
  React 19 — matching Mirador's own peer dependencies.
- **`mirador-downloaddialog`'s `package.json` declares `engines.npm >= 11`.** It still
  installs and builds fine with older npm (just emits an `EBADENGINE` warning); upgrade
  npm if you want to silence that.
- The initial bundle is large (~1.5 MB minified) because it includes all of MUI + all
  of Mirador. If bundle size matters for your deployment, look into code-splitting via
  dynamic `import()` for windows/plugins you don't always need.
