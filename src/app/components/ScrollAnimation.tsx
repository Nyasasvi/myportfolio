'use client';

import React from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn';
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollAnimation({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  className,
  style,
}: ScrollAnimationProps) {
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      variants={variants[animation]}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Parallax({ children, offset = 50, className, style }: ParallaxProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);

  return (
    <motion.div className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
  style,
}: StaggerChildrenProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function HoverScale({ children, scale = 1.05, className, style }: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface ScrollProgressProps {
  height?: number;
  color?: string;
}

export function ScrollProgress({ height = 4, color = '#3b82f6' }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        background: color,
        transformOrigin: '0%',
        scaleX: scrollYProgress,
        zIndex: 9999,
      }}
    />
  );
}

