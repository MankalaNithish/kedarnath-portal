import * as React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import { motion } from 'framer-motion';
import Layout from '@/components/layout';
import Toast from '@/components/Toast';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';

export default function Donation() {
  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'success' });
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.07);

  // Unchanged from the original page.
  function downloadQRImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleDownload() {
    downloadQRImage('/qrcode.jpeg', 'Kedarnath QR Code.jpeg');
    setToast({ open: true, message: 'QR code saved to your downloads.', severity: 'success' });
  }

  return (
    <Layout>
      <Head>
        <title>Donation &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta name="description" content="Scan the QR code to contribute to the Kedarnath annadanam camp." />
      </Head>

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 } }}>
        <Box
          sx={{
            display: 'grid', gap: { xs: 4, md: 6 }, alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '1fr 0.85fr' },
          }}
        >
          <motion.div variants={group} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Typography variant="h1" component="h1">Support the annadanam</Typography>
            </motion.div>
            <motion.div variants={item}>
              <Typography variant="subtitle1" sx={{ mt: 3, maxWidth: '44ch' }}>
                Scan the code with any UPI app to contribute. Every rupee goes towards
                meals served to pilgrims at the camp.
              </Typography>
            </motion.div>
            <motion.div variants={item}>
              <Button
                onClick={handleDownload}
                variant="contained"
                startIcon={<DownloadOutlined />}
                sx={{ mt: 4 }}
              >
                Download the QR code
              </Button>
            </motion.div>
            <motion.div variants={item}>
              <Stack
                component="ol"
                spacing={1.25}
                sx={{
                  mt: 5, pt: 3, pl: 2.5, maxWidth: '44ch',
                  borderTop: theme => `1px solid ${theme.palette.divider}`,
                  color: 'text.secondary',
                }}
              >
                <Typography component="li" variant="body2">Open any UPI app on your phone.</Typography>
                <Typography component="li" variant="body2">Scan the code shown here.</Typography>
                <Typography component="li" variant="body2">Enter the amount you wish to give and confirm.</Typography>
              </Stack>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <Box
              sx={{
                p: { xs: 2, md: 2.5 }, borderRadius: 4, backgroundColor: 'background.paper',
                border: theme => `1px solid ${theme.palette.divider}`,
                boxShadow: theme => theme.shadows[8],
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '916 / 1280', borderRadius: 2, overflow: 'hidden' }}>
                <Image
                  src="/qrcode.jpeg"
                  alt="UPI QR code for donations to Kedarnath Annadana Seva Samithi"
                  fill
                  priority
                  sizes="(max-width: 900px) 90vw, 380px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>

      <Toast toast={toast} onClose={() => setToast(t => ({ ...t, open: false }))} />
    </Layout>
  );
}
