'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as QRCode from 'qrcode';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import './ar-experience.css';

// Dynamically import the 3D pieces to avoid SSR issues
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
  'The page opens in your phone’s browser, with the 3D scene right under the title.',
  'Swipe sideways to spin the ring, and tap a card to bring it to the front.',
  'Or play Bug Catcher from the button under the title.',
];

export default function ARExperience() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // The QR opens this same page on a phone
    QRCode.toDataURL(`${window.location.origin}/ar-experience`, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then(setQrCodeUrl)
      .catch((err) => console.error('Error generating QR code:', err));

    if (new URLSearchParams(window.location.search).get('mode') === 'game') setPlaying(true);
  }, []);

  return (
    <>
      {playing && (
        <div className="ar-stage">
          <div className="ar-stage__bar">
            <button type="button" className="ds-btn ds-btn--ghost" onClick={() => setPlaying(false)}>
              <ArrowLeft aria-hidden="true" />
              Back to the 3D scene
            </button>
          </div>
          <div className="game-container">
            <BugCatcherGame onExit={() => setPlaying(false)} />
          </div>
        </div>
      )}

      {/* Stays mounted while the game runs, so nothing has to load or fade in again on the way back */}
      <main className="ar" hidden={playing}>
        <header className="ar-intro">
          <h1 className="ds-h1" data-reveal="now">AR portfolio</h1>
          <p className="ds-lede" data-reveal="now" style={{ '--i': 1 } as React.CSSProperties}>
            Me in the middle of a 3D scene, with my work orbiting around me. Spin the ring, tap a card to bring it forward, and follow it to the project or the story behind it.
          </p>
          <div className="ar-intro__actions" data-reveal="now" style={{ '--i': 2 } as React.CSSProperties}>
            <button type="button" className="ds-btn" onClick={() => setPlaying(true)}>
              <Gamepad2 aria-hidden="true" />
              Play Bug Catcher
            </button>
          </div>
        </header>

        <div data-reveal="now" style={{ '--i': 3 } as React.CSSProperties}>
          <ARScene />
        </div>

        <section className="ar-phone" aria-labelledby="ar-phone-title" data-reveal>
          <div className="ar-phone__steps">
            <h2 id="ar-phone-title" className="ds-h3">Try it on your phone</h2>
            <ol>
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="ar-phone__qr">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeUrl} alt="QR code that opens this page on your phone" width={180} height={180} />
            ) : (
              <span className="ar-phone__qr-placeholder" aria-hidden="true" />
            )}
          </div>
        </section>

        <p className="ds-meta">Built with Three.js, React Three Fiber and Next.js. Bug Catcher is a quick reflex game about squashing bugs before they ship.</p>
      </main>
    </>
  );
}
