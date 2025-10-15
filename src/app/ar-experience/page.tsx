'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as QRCode from 'qrcode';
import './ar-experience.css';

// Dynamically import AR components to avoid SSR issues
const ARScene = dynamic(() => import('../components/ARScene'), { ssr: false });
const BugCatcherGame = dynamic(() => import('../components/BugCatcherGame'), { ssr: false });

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

  return (
    <div className="ar-experience-container">
      {/* Header */}
      <header className="ar-header">
        <h1 className="ar-title">🚀 Next-Gen AR Portfolio</h1>
        <p className="ar-subtitle">Experience the future of interactive portfolios with photorealistic 3D avatars</p>
        <div className="tech-badges">
          <span className="tech-badge">Photorealistic Avatar</span>
          <span className="tech-badge">Real-time Animations</span>
          <span className="tech-badge">WebXR Ready</span>
        </div>
      </header>

      {/* Main Content */}
      {activeMode === 'intro' && (
        <div className="intro-section">
          {showInstructions && (
            <div className="instructions-card">
              <h2>🚀 Welcome to AR Mode</h2>
              <div className="instructions-content">
                <div className="instruction-item">
                  <span className="instruction-icon">📱</span>
                  <p>Scan the QR code with your smartphone camera</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <p>Point your camera at a flat surface</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">👋</span>
                  <p>Use gestures to navigate through projects</p>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎮</span>
                  <p>Play interactive games and explore 3D content</p>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="qr-code-section">
                  <h3>Scan to Start AR Experience</h3>
                  <img src={qrCodeUrl} alt="QR Code for AR Experience" className="qr-code" />
                  <p className="qr-hint">Works on any smartphone - no app needed!</p>
                </div>
              )}

              <div className="action-buttons">
                <button className="btn-primary" onClick={handleStartAR}>
                  🌐 Launch AR View
                </button>
                <button className="btn-secondary" onClick={handleStartGame}>
                  🎮 Play Bug Catcher Game
                </button>
              </div>
            </div>
          )}

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Photorealistic Avatar</h3>
              <p>Meet my ultra-realistic 3D avatar with natural facial expressions, blinking, and breathing animations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Advanced Materials</h3>
              <p>Experience realistic skin textures, subsurface scattering, and physically-based rendering</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👆</div>
              <h3>Gesture Control</h3>
              <p>Navigate through projects with intuitive hand gestures and real-time interaction</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💻</div>
              <h3>Floating Code</h3>
              <p>Watch code snippets and tech stacks orbit around in 3D space with smooth animations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏗️</div>
              <h3>3D Architecture</h3>
              <p>Explore interactive diagrams of system architectures with realistic lighting and shadows</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🐛</div>
              <h3>Catch the Bugs</h3>
              <p>Test your reflexes in a fun bug-catching game showcasing debugging skills</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>WebXR Ready</h3>
              <p>Fully optimized for smartphones and AR headsets using cutting-edge WebXR technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Real-time Physics</h3>
              <p>Experience realistic physics simulation with floating particles and dynamic interactions</p>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'ar' && (
        <div className="ar-view-container">
          <div className="ar-controls">
            <button className="btn-back" onClick={() => setActiveMode('intro')}>
              ← Back
            </button>
            <button className="btn-game" onClick={handleStartGame}>
              🎮 Play Game
            </button>
          </div>
          <ARScene />
        </div>
      )}

      {activeMode === 'game' && (
        <div className="game-container">
          <div className="game-controls">
            <button className="btn-back" onClick={() => setActiveMode('intro')}>
              ← Back
            </button>
            <button className="btn-ar" onClick={handleStartAR}>
              🌐 AR View
            </button>
          </div>
          <BugCatcherGame onExit={() => setActiveMode('intro')} />
        </div>
      )}

      {/* Tech Stack Footer */}
      <footer className="ar-footer">
        <div className="tech-stack">
          <span className="tech-badge">Three.js</span>
          <span className="tech-badge">AR.js</span>
          <span className="tech-badge">WebXR</span>
          <span className="tech-badge">React Three Fiber</span>
          <span className="tech-badge">Next.js</span>
        </div>
      </footer>
    </div>
  );
}

