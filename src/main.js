import Mirador from 'mirador';
import downloadDialogPlugin from './plugins/downloadDialogExtraSizes';
import imageCropperPlugin from 'mirador-imagecropper';
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import miradorSharePlugins from 'mirador-share-plugin';
import { initMatomo, trackMiradorEvents } from './plugins/matomo';

// Base Mirador configuration.
// Swap the sample manifest below for whatever IIIF content you want to ship with.
const miradorConfig = {
  id: 'mirador',
  window: {
    // Enables the download dialog for every window by default.
    downloadDialog: {
      enabled: true,
      dialogOpen: false,
    },
    // Enables the image cropper for every window by default.
    imageCropper: {
      enabled: true,
      active: false,
      dialogOpen: false,
      showRightsInformation: true,
    },
    imageToolsEnabled: true,
    imageToolsOpen: false,
    miradorSharePlugin: {
      iiifInfoLink: 'https://iiif.io',
      embedOption: {
        enabled: false,
        // embedUrlReplacePattern: [
        //   /.*\.edu\/(\w+)\/iiif\/manifest/,
        //   'https://embed.stanford.edu/iframe?url=https://purl.stanford.edu/$1',
        // ],
        syncIframeDimensions: {
          height: { param: 'maxheight' },
        },
      },
      shareLink: {
        enabled: false,
        // manifestIdReplacePattern: [
        //   /\/iiif\/manifest/,
        //   '',
        // ],
      },
    },
  },
  windows: [
    {
      loadedManifest: 'https://iiif.library.leeds.ac.uk/presentation/cc/vp1ch8wd',
    },
  ],
};

// Loads the Matomo tracker and starts sending a pageview.
// Replace with your actual Matomo instance URL and site ID.
initMatomo({
  matomoUrl: 'https://analytics.example.org/',
  siteId: 1,
});

// The three-dot spread merges each plugin's component array into Mirador's
// plugin list. This is the ES-module integration path Mirador's own docs
// recommend for anything that uses plugins (the UMD/CDN build doesn't support them).
const { store } = Mirador.viewer(miradorConfig, [
  ...downloadDialogPlugin,
  ...imageCropperPlugin,
  ...miradorImageToolsPlugin,
  ...miradorSharePlugins,
]);

// Wire up Matomo custom-event tracking against the live Mirador store.
trackMiradorEvents(store);
