import { useReducedMotion } from 'framer-motion';
import { motion as tokens } from '@/theme/tokens';

/**
 * Shared framer-motion variants. Every export is routed through
 * useAnimation(), which collapses each variant to an instant state change
 * when the visitor has asked for reduced motion.
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: tokens.base, ease: tokens.ease } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: tokens.base, ease: tokens.ease } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: tokens.base, ease: tokens.ease } },
};

export const staggerContainer = (stagger = 0.045, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const STILL = { hidden: {}, show: { transition: { duration: 0 } } };

/**
 * Returns variants that respect the reduced-motion preference.
 * Usage: const v = useAnimation(fadeInUp)  ->  <motion.div variants={v} />
 */
export function useAnimation(variants) {
  const reduced = useReducedMotion();
  return reduced ? STILL : variants;
}

export function useStagger(stagger, delay) {
  const reduced = useReducedMotion();
  return reduced ? STILL : staggerContainer(stagger, delay);
}

/** Page-level transition used by the route change wrapper in _app.js. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: tokens.base, ease: tokens.ease } },
  exit: { opacity: 0, y: -6, transition: { duration: tokens.fast, ease: 'easeIn' } },
};
