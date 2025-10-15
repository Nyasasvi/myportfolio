'use client';

import React, { useEffect, useRef } from 'react';

/**
 * AR Marker Component
 * This component provides AR.js marker-based tracking capabilities
 * Uses the Hiro marker pattern (standard AR.js marker)
 */
export default function ARMarker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    let animationId: number;
    let stream: MediaStream | null = null;

    const initializeAR = async () => {
      try {
        // Check for camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('Camera access not available');
          return;
        }

        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Use back camera on mobile
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Start AR tracking (simplified - in production you'd use AR.js library)
        const animate = () => {
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
            }
          }
          animationId = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Error initializing AR:', error);
      }
    };

    initializeAR();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="ar-marker-container">
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '12px',
        }}
      />
    </div>
  );
}

/**
 * Hiro Marker Pattern Generator
 * Generates the standard Hiro marker for AR.js tracking
 */
export function HiroMarkerPattern() {
  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        background: 'white',
        padding: '20px',
        border: '10px solid black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'black',
          position: 'relative',
        }}
      >
        {/* Hiro pattern - simplified representation */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '60%',
            height: '60%',
            background: 'white',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '2px',
          }}
        >
          {[1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1].map((cell, i) => (
            <div
              key={i}
              style={{
                background: cell ? 'black' : 'white',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

