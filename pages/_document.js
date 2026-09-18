import { Html, Head, Main, NextScript } from 'next/document';
import { palette } from '@/theme/tokens';

/**
 * Runs before first paint: resolves the stored / OS colour mode and puts it on
 * <html> so the CSS in globals.css can paint the correct page background
 * immediately. React still hydrates in light mode and syncs in an effect, so
 * the markup the server sent matches the first client render exactly.
 */
const PRE_PAINT = `(function(){try{var m=localStorage.getItem('colorMode');
if(m!=='light'&&m!=='dark'){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
document.documentElement.dataset.colorMode=m;}catch(e){document.documentElement.dataset.colorMode='light';}})();`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content={palette.light.bg} media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content={palette.dark.bg} media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
