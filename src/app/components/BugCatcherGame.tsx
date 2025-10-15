'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './bug-catcher.css';

interface Bug {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'syntax' | 'logic' | 'runtime' | 'performance';
  caught: boolean;
}

const bugTypes = {
  syntax: { color: '#ff4444', label: 'Syntax Error', points: 10 },
  logic: { color: '#ffaa00', label: 'Logic Bug', points: 15 },
  runtime: { color: '#ff6b6b', label: 'Runtime Error', points: 20 },
  performance: { color: '#ffd700', label: 'Performance Issue', points: 25 },
};

// Animated Bug Component
function BugMesh({ bug, onClick }: { bug: Bug; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !bug.caught) {
      meshRef.current.rotation.x += 0.05;
      meshRef.current.rotation.y += 0.05;
      
      // Buzzing movement
      const time = state.clock.elapsedTime;
      meshRef.current.position.x += Math.sin(time * 2) * 0.01;
      meshRef.current.position.y += Math.cos(time * 3) * 0.01;
    }
  });

  if (bug.caught) return null;

  const bugColor = bugTypes[bug.type].color;

  return (
    <group position={bug.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Bug body */}
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={bugColor}
          emissive={bugColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Bug wings */}
      <mesh position={[-0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial
          color={bugColor}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial
          color={bugColor}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bug eyes */}
      <mesh position={[-0.1, 0.15, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.1, 0.15, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Bug label */}
      {hovered && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.2}
          color={bugColor}
          anchorX="center"
          anchorY="middle"
        >
          {bugTypes[bug.type].label}
        </Text>
      )}
    </group>
  );
}

// Particle effect for caught bugs
function CatchEffect({ position, color }: { position: THREE.Vector3; color: string }) {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, () => ({
      position: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ),
    }))
  );

  useFrame(() => {
    particles.forEach((p) => {
      p.position.add(p.velocity);
    });
  });

  return (
    <>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  );
}

// Game Scene
function GameScene({
  bugs,
  onBugCatch,
  effects,
}: {
  bugs: Bug[];
  onBugCatch: (bugId: number) => void;
  effects: Array<{ id: number; position: THREE.Vector3; color: string }>;
}) {
  const bugsRef = useRef<Bug[]>(bugs);

  useFrame(() => {
    bugsRef.current.forEach((bug) => {
      if (!bug.caught) {
        bug.position.add(bug.velocity);

        // Bounce off boundaries
        if (Math.abs(bug.position.x) > 8) {
          bug.velocity.x *= -1;
        }
        if (bug.position.y > 5 || bug.position.y < -3) {
          bug.velocity.y *= -1;
        }
        if (Math.abs(bug.position.z) > 8) {
          bug.velocity.z *= -1;
        }
      }
    });
  });

  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#667eea" />

      {/* Bugs */}
      {bugs.map((bug) => (
        <BugMesh key={bug.id} bug={bug} onClick={() => onBugCatch(bug.id)} />
      ))}

      {/* Catch effects */}
      {effects.map((effect) => (
        <CatchEffect key={effect.id} position={effect.position} color={effect.color} />
      ))}

      {/* Game boundary grid */}
      <gridHelper args={[20, 20, '#667eea', '#764ba2']} position={[0, -3, 0]} />
      
      {/* Score display in 3D space */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.8}
        color="#667eea"
        anchorX="center"
        anchorY="middle"
      >
        Catch the Bugs!
      </Text>
    </>
  );
}

// Main Bug Catcher Game Component
export default function BugCatcherGame({ onExit }: { onExit: () => void }) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [effects, setEffects] = useState<Array<{ id: number; position: THREE.Vector3; color: string }>>([]);
  const effectIdRef = useRef(0);

  // Initialize bugs
  const spawnBugs = (count: number) => {
    const newBugs: Bug[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 10
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      type: ['syntax', 'logic', 'runtime', 'performance'][Math.floor(Math.random() * 4)] as Bug['type'],
      caught: false,
    }));
    setBugs(newBugs);
  };

  // Start game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    spawnBugs(15);
  };

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  // Catch bug
  const handleBugCatch = (bugId: number) => {
    const bug = bugs.find((b) => b.id === bugId);
    if (!bug || bug.caught) return;

    // Add catch effect
    const effectId = effectIdRef.current++;
    setEffects((prev) => [
      ...prev,
      { id: effectId, position: bug.position.clone(), color: bugTypes[bug.type].color },
    ]);

    // Remove effect after animation
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== effectId));
    }, 500);

    // Update score
    setScore((prev) => prev + bugTypes[bug.type].points);

    // Mark bug as caught
    setBugs((prev) => prev.map((b) => (b.id === bugId ? { ...b, caught: true } : b)));

    // Spawn new bug
    if (gameState === 'playing') {
      setTimeout(() => {
        const newBug: Bug = {
          id: Date.now(),
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 10
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ),
          type: ['syntax', 'logic', 'runtime', 'performance'][
            Math.floor(Math.random() * 4)
          ] as Bug['type'],
          caught: false,
        };
        setBugs((prev) => [...prev.filter((b) => !b.caught), newBug]);
      }, 500);
    }
  };

  return (
    <div className="bug-catcher-container">
      {/* HUD */}
      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">Score:</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time:</span>
          <span className={`hud-value ${timeLeft <= 10 ? 'warning' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Game Canvas */}
      <Canvas className="game-canvas" shadows>
        <Suspense fallback={null}>
          <GameScene bugs={bugs} onBugCatch={handleBugCatch} effects={effects} />
        </Suspense>
      </Canvas>

      {/* Game States */}
      {gameState === 'ready' && (
        <div className="game-overlay">
          <div className="game-card">
            <h2>🐛 Catch the Bugs!</h2>
            <p className="game-description">
              Test your debugging skills! Click on bugs to catch them before time runs out.
              Different bug types award different points.
            </p>
            <div className="bug-types-legend">
              {Object.entries(bugTypes).map(([key, value]) => (
                <div key={key} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: value.color }}></span>
                  <span className="legend-label">{value.label}</span>
                  <span className="legend-points">+{value.points}</span>
                </div>
              ))}
            </div>
            <button className="btn-start-game" onClick={startGame}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <div className="game-overlay">
          <div className="game-card">
            <h2>🎯 Game Over!</h2>
            <div className="final-score">
              <span className="score-label">Final Score:</span>
              <span className="score-value">{score}</span>
            </div>
            <p className="score-message">
              {score >= 500
                ? '🏆 Amazing! You\'re a debugging master!'
                : score >= 300
                ? '🌟 Great job! Your debugging skills are impressive!'
                : score >= 150
                ? '👍 Good work! Keep practicing!'
                : '💪 Nice try! Practice makes perfect!'}
            </p>
            <div className="game-actions">
              <button className="btn-restart" onClick={startGame}>
                Play Again
              </button>
              <button className="btn-exit" onClick={onExit}>
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="game-instructions">
          <p>Click on bugs to catch them! Move your mouse to aim.</p>
        </div>
      )}
    </div>
  );
}

