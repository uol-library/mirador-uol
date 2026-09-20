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

function adjustFullSize({ width, height }) {
  // The "full/original" size is always available, but the built-in
  // mirador-downloaddialog only lists it if it's larger than the largest
  // size in the canvas's own info.json `sizes` array. Since we're not
  // using that array at all, we need to make sure the full size is always
  // larger than any of the extra sizes we list here, or else it won't be
  // shown.
  if (width > height && width > 5000) {
    return { width: 5000, height: Math.round((height / width) * 5000) };
  } else if (height > width && height > 5000) {
    return { width: Math.round((width / height) * 5000), height: 5000 };
  } else if (width === height && width > 5000) {
    return { width: 5000, height: 5000 };
  }
  // We also need to ensure that the full size is at least 1px
  // larger than the largest extra size, or else the built-in
  // mirador-downloaddialog will omit it from the list of sizes. 
  // So we add 1px to both width and height here.
  return { width: width + 1, height: height + 1 };
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
        const fullSize = adjustFullSize({ width: canvas.getWidth(), height: canvas.getHeight() });
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
                  {canvasLabel(canvas.id)}
                </Box>
              </Typography>
              <List>
                <ListItem dense key={`${canvas.id}-full-${fullSize.width}x${fullSize.height}`}>
                  <Box
                    fontFamily={theme.typography.fontFamily ?? "sans-serif"}
                    fontSize="0.75rem"
                  >
                    JPEG:{' '}
                    <Link href={`${base.replace(/thumbs/, 'image')}/full/${fullSize.width},${fullSize.height}/0/default.jpg`} target="_blank">
                      {fullSize.width} x {fullSize.height} pixels
                    </Link>
                  </Box>
                </ListItem>
              </List>
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

