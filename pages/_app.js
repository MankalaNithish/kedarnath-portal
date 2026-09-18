import '@/styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import ColorModeProvider from '@/theme/ColorModeProvider';
import { pageTransition } from '@/components/motion';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <ColorModeProvider>
      <Head>
        {/* Was previously set only on the home page, so every other route
            rendered at desktop width on phones. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.pathname}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ColorModeProvider>
  );
}
