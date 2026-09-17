import downloadDialogComponents, { getPluginConfig, translations } from 'mirador-downloaddialog';
import { updateWindow, getManifestUrl, getManifestSeeAlso, getVisibleCanvases, getCanvasLabel, getConfig } from 'mirador';
import { CustomDownloadDialog } from './CustomDownloadDialog';

// Keep every other component the plugin exports (e.g. the toolbar button)
// unchanged, and only replace its "DownloadDialog" entry - the plugin's own
// DownloadDialog renders a per-canvas section unconditionally, before any
// `children`, so it can't be reused here; see CustomDownloadDialog.jsx.
const otherComponents = downloadDialogComponents.filter(
  (c) => c.name !== 'DownloadDialog',
);

export default [
  ...otherComponents,
  {
    component: CustomDownloadDialog,
    // Same config/mapDispatchToProps/mapStateToProps/mode/name/target as the
    // original "DownloadDialog" entry in mirador-downloaddialog, so this
    // substitute is wired into the same config, toolbar button, and Redux
    // state the plugin already provides.
    config: { translations },
    mapDispatchToProps: (dispatch, { windowId }) => ({
      updateConfig: (config) => dispatch(updateWindow(windowId, { downloadDialog: config })),
    }),
    mapStateToProps: (state, { windowId }) => ({
      canvasLabel: (canvasId) => getCanvasLabel(state, { canvasId, windowId }),
      config: getPluginConfig(state, { windowId }),
      containerId: getConfig(state).id,
      manifestUrl: getManifestUrl(state, { windowId }),
      seeAlso: getManifestSeeAlso(state, { windowId }),
      visibleCanvases: getVisibleCanvases(state, { windowId }),
    }),
    mode: 'add',
    name: 'DownloadDialog',
    target: 'Window',
  },
];
