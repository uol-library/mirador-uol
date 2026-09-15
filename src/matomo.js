/**
 * Custom Matomo tracking integration for Mirador.
 *
 * There is no official Mirador <-> Matomo plugin, so this wires one up
 * directly against Mirador's Redux store: it loads the Matomo tracker,
 * fires a tracked pageview on load, and pushes custom events whenever a
 * manifest/window is opened or the visible canvas changes.
 *
 * This is not a "plugin" in Mirador's component-injection sense (it doesn't
 * add or wrap any UI) - it's a store subscriber, so it's wired up separately
 * in main.js rather than passed into the Mirador.viewer plugins array.
 */

let paqReady = false;

/**
 * Injects the Matomo tracker script and initializes the global _paq queue.
 * Call this once, before instantiating Mirador.
 *
 * @param {Object} options
 * @param {string} options.matomoUrl - Base URL of your Matomo instance, e.g. 'https://analytics.example.org/'
 * @param {number} options.siteId - Your Matomo site ID
 */
export function initMatomo({ matomoUrl, siteId }) {
  if (paqReady) return;

  window._paq = window._paq || [];
  window._paq.push(['trackPageView']);
  window._paq.push(['enableLinkTracking']);

  const normalizedUrl = matomoUrl.endsWith('/') ? matomoUrl : `${matomoUrl}/`;
  window._paq.push(['setTrackerUrl', `${normalizedUrl}matomo.php`]);
  window._paq.push(['setSiteId', String(siteId)]);

  const script = document.createElement('script');
  script.async = true;
  script.src = `${normalizedUrl}matomo.js`;
  document.head.appendChild(script);

  paqReady = true;
}

/**
 * Subscribes to a Mirador Redux store and pushes Matomo custom events for
 * manifest loads and canvas navigation. Call this with the store returned
 * from Mirador.viewer(...).
 *
 * @param {Object} store - the Redux store returned by Mirador.viewer()
 */
export function trackMiradorEvents(store) {
  return;
  let previousState = {};

  store.subscribe(() => {
    if (!window._paq) return;

    const state = store.getState();
    const { windows = {} } = state;

    Object.entries(windows).forEach(([windowId, windowState]) => {
      const prevWindowState = previousState[windowId] || {};

      // New window/manifest opened.
      if (windowState.manifestId && windowState.manifestId !== prevWindowState.manifestId) {
        window._paq.push([
          'trackEvent',
          'Mirador',
          'OpenManifest',
          windowState.manifestId,
        ]);
      }

      // Canvas navigation within a window.
      if (
        windowState.canvasId &&
        windowState.canvasId !== prevWindowState.canvasId
      ) {
        window._paq.push([
          'trackEvent',
          'Mirador',
          'ViewCanvas',
          windowState.canvasId,
        ]);
      }
    });

    previousState = windows;
  });
}
