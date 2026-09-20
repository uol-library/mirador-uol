import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { ExtraDownloadSizes } from './ExtraDownloadSizes';

/**
 * A full replacement for mirador-downloaddialog's own <DownloadDialog>.
 *
 * The plugin's shipped DownloadDialog unconditionally renders one
 * "Single image: <label>" card per visible canvas (built from each
 * canvas's own info.json `sizes`) before any `children` passed to it -
 * there's no prop or config flag to suppress that section. So wrapping it
 * (as in downloadDialogExtraSizes.jsx) can only add content, never remove
 * or replace what's already there.
 *
 * This component renders its own Dialog instead, reusing the plugin's
 * config shape (`enabled`/`dialogOpen`) and the same
 * mapStateToProps/mapDispatchToProps wiring, but only rendering our own
 * ExtraDownloadSizes section plus the manifest/seeAlso links - the built-in
 * per-canvas section is simply never rendered at all.
 */
export const CustomDownloadDialog = ({
  canvasLabel,
  config,
  containerId,
  manifestUrl,
  seeAlso = [],
  updateConfig,
  visibleCanvases,
}) => {
  const { dialogOpen, enabled } = config;
  if (!enabled || !dialogOpen) return null;

  const close = () => updateConfig({ ...config, dialogOpen: false });

  return (
    <Dialog
      container={document.getElementById(containerId)}
      fullWidth
      maxWidth="xs"
      onClose={close}
      open={dialogOpen}
      scroll="paper"
    >
      <Typography component="h3" style={{ padding: '1rem 1rem 0' }}>
        <Box fontWeight="fontWeightBold">Download options</Box>
      </Typography>
      <DialogContent dividers>
        <ExtraDownloadSizes
          canvasLabel={canvasLabel}
          manifestUrl={manifestUrl}
          visibleCanvases={visibleCanvases}
        />
          <Card className="mb-3" key={`extra-sizes-seealso`} raised sx={{ marginTop: '1rem' }}>
            <CardContent>
              <Typography component="h5" style={{ textTransform: 'none' }} variant="h6">
                <Box fontWeight="fontWeightBold">
                  See Also
                </Box>
              </Typography>
              <List>
                <ListItem dense>
                  <Box fontSize="0.75rem">
                    <Link href={manifestUrl} rel="noopener" target="_blank">
                      IIIF manifest
                    </Link>
                  </Box>
                </ListItem>
                
                {seeAlso
                  .filter(({ format }) => format !== 'text/html')
                  .map(({ label, value }) => (
                    <ListItem dense>
                      <Box fontSize="0.75rem" key={value}>
                        <Link href={value} rel="noopener" target="_blank">
                          {label}
                        </Link>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={close}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
