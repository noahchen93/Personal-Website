import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function AmbientBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="portfolio-backdrop" aria-hidden="true">
      <div className="portfolio-backdrop__grid" />
      <motion.div
        className="portfolio-backdrop__orb portfolio-backdrop__orb--blue"
        animate={reduceMotion ? undefined : { x: [0, 36, 0], y: [0, -24, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="portfolio-backdrop__orb portfolio-backdrop__orb--violet"
        animate={reduceMotion ? undefined : { x: [0, -28, 0], y: [0, 32, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="portfolio-backdrop__vignette" />
    </div>
  );
}
