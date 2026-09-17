import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { useTheme } from "@mui/material/styles";

/**
 * mirador-downloaddialog only lists sizes present in a canvas's *main* IIIF
 * Image API info.json `sizes` array (plus the canvas's own full/original
 * size). Many manifests - including this one - don't declare a `sizes`
 * array on the main (level2) image service at all, since it can scale to
 * any width on request.
 *
 * Instead, this reads `items[i].thumbnail[0].service[1].sizes` straight out
 * of the manifest: the IIIF Image API 3 service attached to each canvas's
 * thumbnail. That service is typically level0 (pre-generated, fixed sizes
 * only), so its `sizes` array is an exact, guaranteed-valid list of sizes
 * to offer as download links - unlike guessing arbitrary widths against the
 * main image service.
 *
 * Note this service has its own separate image identifier/base URL from
 * the main image service (e.g. a "/thumbs/" path vs "/image/" path), so
 * links are built directly from `service.id`, not from
 * `canvas.getCanonicalImageUri()` (which targets the main image service).
 */

// Cache manifest JSON per URL across renders/instances, since Mirador
// already fetched it once internally and we don't need to hit it again for
// every window/component instance.
const manifestCache = new Map();

function fetchManifestJson(manifestUrl) {
  if (!manifestCache.has(manifestUrl)) {
    manifestCache.set(
      manifestUrl,
      fetch(manifestUrl).then((res) => res.json()),
    );
  }
  return manifestCache.get(manifestUrl);
}

export const ExtraDownloadSizes = ({ canvasLabel, manifestUrl, visibleCanvases = [] }) => {
  const [sizesByCanvasId, setSizesByCanvasId] = useState({});
  const theme = useTheme();

  useEffect(() => {
    if (!manifestUrl) return undefined;
    let cancelled = false;

    fetchManifestJson(manifestUrl)
      .then((manifest) => {
        if (cancelled) return;

        const byCanvasId = {};
        (manifest.items ?? []).forEach((item) => {
          const services = item.thumbnail?.[0]?.service ?? [];
          const service = services.find((s) => s.type === 'ImageService3');
          const serviceId = service?.id ?? service?.['@id'];
          if (serviceId && Array.isArray(service?.sizes)) {
            byCanvasId[item.id] = { serviceId, sizes: service.sizes };
          }
        });
        setSizesByCanvasId(byCanvasId);
      })
      .catch(() => {
        // A failed manifest re-fetch here just means no extra sizes are
        // shown - the dialog's built-in sizes still work fine.
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  return (
    <>
      {visibleCanvases.map((canvas) => {
        const entry = sizesByCanvasId[canvas.id];
        if (!entry) return null;

        const { serviceId, sizes } = entry;
        const base = serviceId.replace(/\/$/, '');
        const sorted = [...sizes].sort((a, b) => b.width - a.width);

        return (
          <Card className="mb-3" key={`extra-sizes-${canvas.id}`} raised>
            <CardContent>
              <Typography component="h5" style={{ textTransform: 'none' }} variant="h6">
                <Box fontWeight="fontWeightBold">
                  Thumbnails for {canvasLabel(canvas.id)}
                </Box>
              </Typography>
              <List>
                {sorted.map(({ width, height }) => (
                  <ListItem dense key={`${canvas.id}-${width}x${height}`}>
                    <Box
                      fontFamily={theme.typography.fontFamily ?? "sans-serif"}
                      fontSize="0.75rem"
                    >
                      JPEG:{' '}
                      <Link href={`${base}/full/${width},${height}/0/default.jpg`} target="_blank">
                        {width} x {height} pixels
                      </Link>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

