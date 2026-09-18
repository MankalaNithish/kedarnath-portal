import * as React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Box, Button, Container, Dialog, IconButton, Stack, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Layout from '@/components/layout';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';
import totalMembers from '@/pages/data/members.json';

// Unchanged: all 22 gallery entries, same filenames and order.
const itemData = [
  { img: '1.jpg', title: 'kedarnath1', cols: 2, rows: 2 },
  { img: '4.jpg', title: 'kedarnath4', cols: 1, rows: 1 },
  { img: '3.jpg', title: 'kedarnath3', cols: 1, rows: 1 },
  { img: '2.jpg', title: 'kedarnath2', cols: 1, rows: 1 },
  { img: '5.jpeg', cols: 1, rows: 1 },
  { img: '6.jpeg', cols: 1, rows: 1 },
  { img: '7.jpeg', cols: 1, rows: 1 },
  { img: '8.jpeg', cols: 1, rows: 1 },
  { img: '9.jpeg', cols: 1, rows: 1 },
  { img: '10.jpeg', cols: 1, rows: 1 },
  { img: '11.jpeg', cols: 1, rows: 1 },
  { img: '12.jpeg', cols: 1, rows: 1 },
  { img: '13.jpeg', cols: 1, rows: 1 },
  { img: '14.jpeg', cols: 1, rows: 1 },
  { img: '15.jpeg', cols: 1, rows: 1 },
  { img: '16.jpeg', cols: 1, rows: 1 },
  { img: '17.jpeg', cols: 1, rows: 1 },
  { img: '18.jpeg', cols: 1, rows: 1 },
  { img: '19.jpg', cols: 1, rows: 1 },
  { img: '20.jpeg', cols: 1, rows: 1 },
  { img: '21.jpeg', cols: 1, rows: 1 },
  { img: '22.jpeg', cols: 1, rows: 1 },
];

const altFor = item => item.title || `Kedarnath annadanam camp, photograph ${item.img.split('.')[0]}`;

const memberCount =
  totalMembers.honMems.length + totalMembers.mainMems.length +
  totalMembers.commiteeMems.length + totalMembers.members.length;

function Hero() {
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.08, 0.05);

  return (
    <Box component="section" sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 4, md: 7 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid', gap: { xs: 4, md: 7 }, alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <motion.div variants={group} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Typography variant="h1">Annadanam at Kedarnath</Typography>
            </motion.div>

            <motion.div variants={item}>
              <Typography variant="subtitle1" sx={{ mt: 3, maxWidth: '46ch' }}>
                The only Telugu free-food camp on the Kedarnath yatra. Volunteers from
                Siddipet, Telangana serve hot meals to pilgrims, alongside Shri Kedarnath
                Langar Committee, Jalandhar.
              </Typography>
            </motion.div>

            <motion.div variants={item}>
              <Stack direction="row" spacing={1.5} sx={{ mt: 4, flexWrap: 'wrap', gap: 1.5 }}>
                <Button component={Link} href="/donation" variant="contained">Donate</Button>
                <Button component={Link} href="/about" variant="outlined">Read about the seva</Button>
              </Stack>
            </motion.div>

            <motion.div variants={item}>
              <Stack
                direction="row"
                spacing={4}
                sx={{ mt: 5, pt: 3, borderTop: theme => `1px solid ${theme.palette.divider}` }}
              >
                <Box>
                  <Typography sx={{ fontFamily: t => t.typography.h1.fontFamily, fontSize: '1.7rem', lineHeight: 1.1 }}>
                    {memberCount}
                  </Typography>
                  <Typography variant="caption">Volunteers and office bearers</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: t => t.typography.h1.fontFamily, fontSize: '1.7rem', lineHeight: 1.1 }}>
                    4/2020
                  </Typography>
                  <Typography variant="caption">Registration number</Typography>
                </Box>
              </Stack>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          >
            <Box
              sx={{
                position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden',
                border: theme => `1px solid ${theme.palette.divider}`,
                boxShadow: theme => theme.shadows[8],
              }}
            >
              <Image
                src="/13.jpeg"
                alt="Volunteers serving rice onto steel plates for pilgrims at the camp"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

function Lightbox({ index, onClose, onStep }) {
  const open = index !== null;

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onStep]);

  const current = open ? itemData[index] : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-label="Photograph viewer"
      PaperProps={{ sx: { bgcolor: 'background.default', position: 'relative' } }}
    >
      {current && (
        <>
          <Box sx={{ position: 'relative', width: '100%', height: { xs: '60vh', md: '78vh' } }}>
            <Image
              src={`/${current.img}`}
              alt={altFor(current)}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </Box>

          <IconButton
            onClick={onClose}
            aria-label="Close photograph viewer"
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
          >
            <CloseIcon />
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5 }}
          >
            <IconButton onClick={() => onStep(-1)} aria-label="Previous photograph">
              <ChevronLeft />
            </IconButton>
            <Typography variant="caption">
              {index + 1} of {itemData.length}
            </Typography>
            <IconButton onClick={() => onStep(1)} aria-label="Next photograph">
              <ChevronRight />
            </IconButton>
          </Stack>
        </>
      )}
    </Dialog>
  );
}

export default function Home() {
  const [lightbox, setLightbox] = React.useState(null);
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.03);

  const step = React.useCallback(delta => {
    setLightbox(prev => (prev === null ? prev : (prev + delta + itemData.length) % itemData.length));
  }, []);

  return (
    <Layout>
      <Head>
        <title>Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta name="description" content="This is a portal for kedarntah annadana seva samithi siddipet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Hero />

      <Box component="section" sx={{ pb: 8 }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            sx={{ mb: 3, pb: 2, borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="h2" component="h2">From the camp</Typography>
            <Typography variant="caption">{itemData.length} photographs</Typography>
          </Stack>

          <motion.div
            variants={group}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <Box
              sx={{
                display: 'grid', gap: { xs: 1, sm: 1.5 },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              }}
            >
              {itemData.map((tile, i) => (
                <motion.div key={tile.img} variants={item}>
                  <Box
                    component="button"
                    onClick={() => setLightbox(i)}
                    aria-label={`Open photograph ${i + 1} of ${itemData.length}`}
                    sx={{
                      display: 'block', width: '100%', p: 0, border: 0, cursor: 'pointer',
                      position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden',
                      borderRadius: 2, background: 'transparent',
                      outline: theme => `1px solid ${theme.palette.divider}`,
                      '& img': { transition: 'transform .4s cubic-bezier(.22,1,.36,1)' },
                      '&:hover img': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Image
                      src={`/${tile.img}`}
                      alt={altFor(tile)}
                      fill
                      loading="lazy"
                      sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Lightbox index={lightbox} onClose={() => setLightbox(null)} onStep={step} />
    </Layout>
  );
}
