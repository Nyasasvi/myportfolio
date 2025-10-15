'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  const variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    enter: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
          duration: 0.3,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Alternative transition styles
export function SlideTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  const variants = {
    hidden: {
      opacity: 0,
      x: -200,
    },
    enter: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 200,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  const variants = {
    hidden: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ScaleTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    enter: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.05,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

