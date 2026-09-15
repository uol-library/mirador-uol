import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // The 500kB default warning threshold is tuned for typical web apps.
    // Mirador's remaining large chunk is OpenSeadragon (deep-zoom rendering)
    // + manifesto.js (IIIF parsing) - both needed immediately to show the
    // first image, so there's nothing left to usefully lazy-load. Raised
    // here so the build stays quiet for byte counts that are expected for
    // this class of app.
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // Mirador's own package already ships pre-split, dynamically-imported
          // chunks (OpenSeadragonViewer, AudioViewer, VideoViewer, etc.) so it
          // only loads the media viewers actually in use. Don't force those
          // back into one file - just let Rollup keep Mirador's own splits.
          if (id.includes('node_modules/mirador/')) return undefined;

          // MUI + emotion are large and shared across Mirador and its plugins.
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';

          // React itself, split out so it's cached separately too.
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          // Everything else from node_modules (openseadragon, redux, plugins, etc).
          return 'vendor';
        },
      },
    },
  },
});
