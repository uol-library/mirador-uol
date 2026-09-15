import Mirador from 'mirador';
import downloadDialogPlugin from 'mirador-downloaddialog';
import imageCropperPlugin from 'mirador-imagecropper';
import { initMatomo, trackMiradorEvents } from './matomo';

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
]);

// Wire up Matomo custom-event tracking against the live Mirador store.
trackMiradorEvents(store);
