'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface EnhancedBackgroundProps {
  particleCount?: number;
  enableOnMobile?: boolean;
  theme?: 'light' | 'dark';
}

export default function EnhancedBackground({ 
  particleCount = 25,
  enableOnMobile = false,
  theme = 'dark'
}: EnhancedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const animationRef = useRef<number>();
  const lastMouseMoveRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Don't render on mobile if disabled
    if (!enableOnMobile && window.innerWidth < 768) {
      return () => window.removeEventListener('resize', checkMobile);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with variety
    const adjustedCount = isMobile ? Math.floor(particleCount / 2) : particleCount;
    particlesRef.current = [];
    
    // Color palette based on theme
    const colorPalette = theme === 'dark' 
      ? [
          { h: 210, s: 80, l: 60 },  // Blue
          { h: 280, s: 70, l: 60 },  // Purple
          { h: 190, s: 75, l: 55 },  // Cyan
          { h: 330, s: 70, l: 60 },  // Pink
        ]
      : [
          { h: 210, s: 60, l: 50 },  // Blue
          { h: 280, s: 55, l: 50 },  // Purple
          { h: 190, s: 60, l: 45 },  // Cyan
          { h: 260, s: 60, l: 50 },  // Violet
        ];
    
    for (let i = 0; i < adjustedCount; i++) {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const baseRadius = Math.random() * 2 + 1;
      
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: baseRadius,
        baseRadius: baseRadius,
        hue: color.h + (Math.random() - 0.5) * 20,
        saturation: color.s,
        lightness: color.l,
        opacity: Math.random() * 0.5 + 0.5,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current < 16) return;
      
      lastMouseMoveRef.current = now;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    let lastFrame = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let time = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrame < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const deltaTime = timestamp - lastFrame;
      lastFrame = timestamp;
      time += 0.01;

      // Clear with trail effect
      ctx.fillStyle = theme === 'dark' 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Draw connections first (so they're behind particles)
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.2 * Math.min(particle.opacity, other.opacity);
            
            // Gradient line for more visual interest
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y,
              other.x, other.y
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${opacity})`);
            gradient.addColorStop(1, `hsla(${other.hue}, ${other.saturation}%, ${other.lightness}%, ${opacity})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Pulsing effect
        particle.pulsePhase += particle.pulseSpeed;
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 1;
        particle.radius = particle.baseRadius * pulse;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with damping
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.95;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.95;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            particle.vx -= Math.cos(angle) * force * 0.08;
            particle.vy -= Math.sin(angle) * force * 0.08;
            
            // Enhance particle when near mouse
            particle.opacity = Math.min(1, particle.opacity + 0.02);
          } else {
            // Fade back to normal
            particle.opacity = Math.max(0.5, particle.opacity - 0.01);
          }
        }

        // Apply friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Velocity-based color shift
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const velocityBoost = Math.min(speed * 10, 15);

        // Draw particle with enhanced effects
        ctx.save();
        
        // Outer glow
        const outerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 4
        );
        outerGlow.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness + velocityBoost}%, ${particle.opacity * 0.3})`);
        outerGlow.addColorStop(0.5, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity * 0.1})`);
        outerGlow.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Inner particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness + 20}%, ${particle.opacity})`);
        gradient.addColorStop(0.6, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.opacity * 0.9})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness - 10}%, ${particle.opacity * 0.6})`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core highlight
        ctx.beginPath();
        ctx.arc(particle.x - particle.radius * 0.3, particle.y - particle.radius * 0.3, particle.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, 95%, ${particle.opacity * 0.8})`;
        ctx.fill();

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, enableOnMobile, isMobile, theme]);

  if (!enableOnMobile && isMobile) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: theme === 'dark' ? 0.6 : 0.5,
      }}
    />
  );
}

