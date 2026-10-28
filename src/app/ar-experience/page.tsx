'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as QRCode from 'qrcode';
import { ArrowLeft, Box, Gamepad2 } from 'lucide-react';
import './ar-experience.css';

// Dynamically import AR components to avoid SSR issues
const ARScene = dynamic(() => import('../components/ARScene'), {
  ssr: false,
  loading: () => <div className="ar-stage-loading" role="status">Loading 3D scene…</div>,
});
const BugCatcherGame = dynamic(() => import('../components/BugCatcherGame'), {
  ssr: false,
  loading: () => <div className="ar-stage-loading" role="status">Loading game…</div>,
});

const steps = [
  'Scan the QR code with your phone camera. No app needed.',
  'Point the camera at a flat surface.',
  'Use gestures to move between projects.',
  'Play the bug-catching game or explore the 3D scene.',
];

const features = [
  { title: '3D avatar', text: 'A 3D avatar with blinking, breathing and natural expressions.' },
  { title: 'Realistic materials', text: 'Skin textures, subsurface scattering and physically based rendering.' },
  { title: 'Gesture control', text: 'Move through projects with hand gestures in real time.' },
  { title: 'Floating code', text: 'Code snippets and tech stacks orbiting in 3D space.' },
  { title: 'Architecture diagrams', text: 'Interactive system diagrams with lighting and shadows.' },
  { title: 'Bug catcher', text: 'A quick reflex game about squashing bugs.' },
  { title: 'WebXR', text: 'Runs on phones and AR headsets through WebXR.' },
  { title: 'Physics', text: 'Floating particles and dynamic interactions.' },
];

export default function ARExperience() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeMode, setActiveMode] = useState<'intro' | 'ar' | 'game'>('intro');
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // Generate QR code for the AR experience
    const generateQRCode = async () => {
      try {
        const url = typeof window !== 'undefined'
          ? `${window.location.origin}/ar-experience?mode=ar`
          : '';

        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQRCode();

    // Check if URL has mode parameter
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'ar') {
      setActiveMode('ar');
      setShowInstructions(false);
    }
  }, []);

  const handleStartAR = () => {
    setActiveMode('ar');
    setShowInstructions(false);
  };

  const handleStartGame = () => {
    setActiveMode('game');
    setShowInstructions(false);
  };

  const backToIntro = () => {
    setActiveMode('intro');
    setShowInstructions(true);
  };

  if (activeMode !== 'intro') {
    const inAR = activeMode === 'ar';
    return (
      <div className="ar-stage">
        <div className="ar-stage__bar">
          <button type="button" className="ds-btn ds-btn--ghost" onClick={backToIntro}>
            <ArrowLeft aria-hidden="true" />
            Back
          </button>
          <button type="button" className="ds-btn" onClick={inAR ? handleStartGame : handleStartAR}>
            {inAR ? <Gamepad2 aria-hidden="true" /> : <Box aria-hidden="true" />}
            {inAR ? 'Play the game' : 'Open AR view'}
          </button>
        </div>
        <div className={inAR ? 'ar-view-container' : 'game-container'}>
          {inAR ? <ARScene /> : <BugCatcherGame onExit={backToIntro} />}
        </div>
      </div>
    );
  }

  return (
    <main className="ar">
      <header className="ar-intro">
        <h1 className="ds-h1">AR portfolio</h1>
        <p className="ds-lede">
          See my projects as a 3D scene you can walk around, on your phone or in the browser. Built with Three.js and WebXR.
        </p>
        <div className="ar-intro__actions">
          <button type="button" className="ds-btn ds-btn--primary" onClick={handleStartAR}>
            <Box aria-hidden="true" />
            Open AR view
          </button>
          <button type="button" className="ds-btn" onClick={handleStartGame}>
            <Gamepad2 aria-hidden="true" />
            Play Bug Catcher
          </button>
        </div>
      </header>

      {showInstructions && (
        <section className="ds-card ar-phone" aria-labelledby="ar-phone-title">
          <div className="ar-phone__steps">
            <h2 id="ar-phone-title" className="ds-h3">Try it on your phone</h2>
            <ol>
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <figure className="ar-phone__qr">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeUrl} alt="QR code that opens the AR view on your phone" width={180} height={180} />
            ) : (
              <span className="ar-phone__qr-placeholder" aria-hidden="true" />
            )}
            <figcaption className="ds-meta">Works in any phone browser</figcaption>
          </figure>
        </section>
      )}

      <section className="ar-features" aria-labelledby="ar-features-title">
        <h2 id="ar-features-title" className="ds-h2">What&apos;s inside</h2>
        <dl className="ar-features__list">
          {features.map((feature) => (
            <div key={feature.title}>
              <dt>{feature.title}</dt>
              <dd>{feature.text}</dd>
            </div>
          ))}
        </dl>
        <p className="ds-meta">Three.js, AR.js, WebXR, React Three Fiber and Next.js</p>
      </section>
    </main>
  );
}
