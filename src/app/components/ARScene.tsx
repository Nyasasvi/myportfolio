'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Sphere, 
  Box, 
  PerspectiveCamera, 
  Html,
  useGLTF,
  useTexture,
  Environment,
  ContactShadows,
  Float,
  MeshTransmissionMaterial,
  MeshWobbleMaterial,
  MeshDistortMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import './ar-scene.css';

// Extend Three.js with custom materials
extend({ MeshTransmissionMaterial, MeshWobbleMaterial, MeshDistortMaterial });

// Photorealistic Human Avatar with advanced 3D modeling
function RealisticHumanAvatar({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const hairRef = useRef<THREE.Mesh>(null);
  const beardRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [idleAnimation, setIdleAnimation] = useState(0);

  // Ultra-realistic skin material with advanced PBR
  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xfdbcb4),
    roughness: 0.6,
    metalness: 0.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.03,
    transmission: 0.2,
    thickness: 1.0,
    ior: 1.4,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xfff0e6),
    sheenRoughness: 0.5,
    emissive: new THREE.Color(0x2a1a1a),
    emissiveIntensity: 0.03,
    normalScale: new THREE.Vector2(1, 1),
  });

  // Hair material - grey hair like in the reference
  const hairMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x8b8680),
    roughness: 0.95,
    metalness: 0.0,
    sheen: 0.1,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.8,
  });

  // Beard material - dark grey beard
  const beardMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x4a4a4a),
    roughness: 0.9,
    metalness: 0.0,
    sheen: 0.1,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.9,
  });

  // Eye material with realistic iris
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x4a5d23),
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.2,
    thickness: 0.5,
  });

  // Pupil material
  const pupilMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x000000),
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.03;
      // Gentle swaying
      groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.05;
    }
    
    if (headRef.current) {
      // Natural head movement
      headRef.current.rotation.y = Math.sin(time * 0.6) * 0.02;
      headRef.current.rotation.x = Math.sin(time * 0.8) * 0.01;
    }

    // Breathing animation
    setBreathPhase(Math.sin(time * 2) * 0.015);
    
    // Idle animation for natural movement
    setIdleAnimation(time);
    
    // Blinking animation
    setBlinkTimer(prev => {
      if (prev > 3 + Math.random() * 2) {
        return 0;
      }
      return prev + 0.016;
    });

    // Eye movement
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeMovement = Math.sin(time * 1.5) * 0.05;
      leftEyeRef.current.rotation.y = eyeMovement;
      rightEyeRef.current.rotation.y = eyeMovement;
    }
  });

  const blinkScale = blinkTimer > 3 && blinkTimer < 3.1 ? 0.1 : 1;

  return (
    <group ref={groupRef} position={position}>
      {/* Photorealistic Head with anatomically correct features */}
      <group position={[0, 1.7, 0]}>
        {/* Main skull structure - anatomically correct */}
        <mesh
          ref={headRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.5, 128, 128]} />
          <primitive object={skinMaterial} />
        </mesh>
        
        {/* Forehead */}
        <mesh position={[0, 0.3, 0.35]}>
          <sphereGeometry args={[0.48, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
          <primitive object={skinMaterial} />
        </mesh>
        
        {/* Cheekbones */}
        <mesh position={[-0.3, -0.1, 0.25]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <primitive object={skinMaterial} />
        </mesh>
        <mesh position={[0.3, -0.1, 0.25]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <primitive object={skinMaterial} />
        </mesh>
        
        {/* Realistic Grey Hair with volume */}
        <mesh ref={hairRef} position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.55, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
          <primitive object={hairMaterial} />
        </mesh>
        
        {/* Hair strands for realistic texture */}
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh key={i} position={[
            Math.cos((i / 50) * Math.PI * 2) * (0.45 + Math.random() * 0.1),
            0.25 + Math.random() * 0.15,
            Math.sin((i / 50) * Math.PI * 2) * (0.45 + Math.random() * 0.1)
          ]} rotation={[
            Math.random() * 0.3 - 0.15,
            Math.random() * 0.3 - 0.15,
            Math.random() * 0.3 - 0.15
          ]}>
            <cylinderGeometry args={[0.005 + Math.random() * 0.005, 0.003, 0.1 + Math.random() * 0.1, 6]} />
            <primitive object={hairMaterial} />
          </mesh>
        ))}
        
        {/* Realistic Eyes with proper anatomy */}
        <group position={[-0.15, 0.1, 0.4]} scale={[1, blinkScale, 1]}>
          {/* Eye socket */}
          <mesh ref={leftEyeRef}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshPhysicalMaterial 
              color={0xffffff} 
              roughness={0.1} 
              metalness={0.0}
              transmission={0.1}
              thickness={0.5}
            />
          </mesh>
          {/* Iris */}
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.03, 32, 32]} />
            <meshPhysicalMaterial 
              color={0x4a5d23} 
              roughness={0.1} 
              metalness={0.0}
            />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.015, 32, 32]} />
            <primitive object={pupilMaterial} />
          </mesh>
          {/* Eye highlight */}
          <mesh position={[-0.008, 0.008, 0.065]}>
            <sphereGeometry args={[0.005, 16, 16]} />
            <meshBasicMaterial color={0xffffff} />
          </mesh>
          {/* Eyelashes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.07,
              Math.sin((i / 8) * Math.PI * 2) * 0.07,
              0.05
            ]} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
              <cylinderGeometry args={[0.002, 0.001, 0.02, 4]} />
              <meshBasicMaterial color={0x2c1810} />
            </mesh>
          ))}
        </group>
        
        <group position={[0.15, 0.1, 0.4]} scale={[1, blinkScale, 1]}>
          {/* Right eye - same structure */}
          <mesh ref={rightEyeRef}>
            <sphereGeometry args={[0.08, 32, 32]} />
            <meshPhysicalMaterial 
              color={0xffffff} 
              roughness={0.1} 
              metalness={0.0}
              transmission={0.1}
              thickness={0.5}
            />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.03, 32, 32]} />
            <meshPhysicalMaterial 
              color={0x4a5d23} 
              roughness={0.1} 
              metalness={0.0}
            />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.015, 32, 32]} />
            <primitive object={pupilMaterial} />
          </mesh>
          <mesh position={[-0.008, 0.008, 0.065]}>
            <sphereGeometry args={[0.005, 16, 16]} />
            <meshBasicMaterial color={0xffffff} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.07,
              Math.sin((i / 8) * Math.PI * 2) * 0.07,
              0.05
            ]} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
              <cylinderGeometry args={[0.002, 0.001, 0.02, 4]} />
              <meshBasicMaterial color={0x2c1810} />
            </mesh>
          ))}
        </group>
        
        {/* Eyebrows */}
        <mesh position={[-0.15, 0.25, 0.38]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <primitive object={hairMaterial} />
        </mesh>
        <mesh position={[0.15, 0.25, 0.38]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <primitive object={hairMaterial} />
        </mesh>
        
        {/* Realistic Nose */}
        <mesh position={[0, -0.05, 0.45]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <primitive object={skinMaterial} />
        </mesh>
        {/* Nose bridge */}
        <mesh position={[0, 0.05, 0.42]}>
          <cylinderGeometry args={[0.03, 0.02, 0.15, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        
        {/* Nostrils */}
        <mesh position={[0.02, -0.05, 0.47]}>
          <sphereGeometry args={[0.015, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshBasicMaterial color={0x2a1a1a} />
        </mesh>
        <mesh position={[-0.02, -0.05, 0.47]}>
          <sphereGeometry args={[0.015, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshBasicMaterial color={0x2a1a1a} />
        </mesh>
        
        {/* Realistic Mouth with smile */}
        <mesh position={[0, -0.2, 0.4]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 32, 16, 0, Math.PI, 0, Math.PI * 0.6]} />
          <meshPhysicalMaterial 
            color={0xd4685d} 
            roughness={0.8} 
            metalness={0.0}
            emissive={new THREE.Color(0x1a0a0a)}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Teeth - more realistic */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[
            (i - 3.5) * 0.015,
            -0.18,
            0.405
          ]}>
            <boxGeometry args={[0.012, 0.02, 0.008]} />
            <meshPhysicalMaterial 
              color={0xffffff} 
              roughness={0.2} 
              metalness={0.0}
              transmission={0.1}
              thickness={0.5}
            />
          </mesh>
        ))}
        
        {/* Detailed Beard with realistic volume */}
        <mesh ref={beardRef} position={[0, -0.2, 0.38]}>
          <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <primitive object={beardMaterial} />
        </mesh>
        
        {/* Beard strands for realistic texture */}
        {Array.from({ length: 100 }).map((_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 0.5,
            -0.15 + Math.random() * 0.2,
            0.35 + Math.random() * 0.1
          ]} rotation={[
            Math.random() * 0.4 - 0.2,
            Math.random() * 0.4 - 0.2,
            Math.random() * 0.4 - 0.2
          ]}>
            <cylinderGeometry args={[
              0.003 + Math.random() * 0.003, 
              0.002, 
              0.05 + Math.random() * 0.1, 
              6
            ]} />
            <primitive object={beardMaterial} />
          </mesh>
        ))}
        
        {/* Mustache */}
        <mesh position={[0, -0.1, 0.45]}>
          <sphereGeometry args={[0.1, 32, 16, 0, Math.PI, 0, Math.PI * 0.4]} />
          <primitive object={beardMaterial} />
        </mesh>
        
        {/* Mustache strands */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 0.15,
            -0.08 + Math.random() * 0.05,
            0.44 + Math.random() * 0.02
          ]} rotation={[0, 0, Math.random() * 0.2 - 0.1]}>
            <cylinderGeometry args={[0.002, 0.001, 0.03, 4]} />
            <primitive object={beardMaterial} />
          </mesh>
        ))}
      </group>
      
      {/* Realistic Body with Calvin Klein hoodie */}
      <group position={[0, 0.5, 0]}>
        {/* Torso */}
        <mesh ref={bodyRef} position={[0, breathPhase, 0]}>
          <capsuleGeometry args={[0.35, 1.2, 4, 8]} />
          <primitive object={skinMaterial} />
        </mesh>
        
        {/* Grey Hoodie */}
        <mesh position={[0, breathPhase, 0]}>
          <capsuleGeometry args={[0.38, 1.15, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        
        {/* Hood */}
        <mesh position={[0, 1.3 + breathPhase, 0]}>
          <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        
        {/* CK Logo on hoodie */}
        <mesh position={[0, 0.8 + breathPhase, 0.38]}>
          <planeGeometry args={[0.15, 0.05]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
        
        {/* Calvin Klein text */}
        <mesh position={[0, 0.7 + breathPhase, 0.38]}>
          <planeGeometry args={[0.12, 0.03]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
        
        {/* Hoodie pocket */}
        <mesh position={[0, 0.6 + breathPhase, 0.37]}>
          <planeGeometry args={[0.2, 0.15]} />
          <meshStandardMaterial color={0x606060} roughness={0.8} />
        </mesh>
        
        {/* Drawstrings */}
        <mesh position={[-0.1, 1.4 + breathPhase, 0.25]}>
          <cylinderGeometry args={[0.003, 0.003, 0.3, 8]} />
          <meshStandardMaterial color={0x404040} />
        </mesh>
        <mesh position={[0.1, 1.4 + breathPhase, 0.25]}>
          <cylinderGeometry args={[0.003, 0.003, 0.3, 8]} />
          <meshStandardMaterial color={0x404040} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.1 + breathPhase, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
      </group>

      {/* Realistic Arms with waving gesture */}
      <group position={[-0.55, 0.8 + breathPhase, 0]}>
        {/* Left Upper Arm - hoodie sleeve */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.sin(Date.now() * 0.001) * 0.1]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Left Lower Arm */}
        <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.sin(Date.now() * 0.0015) * 0.2]}>
          <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
          <primitive object={skinMaterial} />
        </mesh>
        {/* Left Hand */}
        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
      </group>
      
      <group position={[0.55, 0.8 + breathPhase, 0]}>
        {/* Right Upper Arm - hoodie sleeve with waving gesture */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.sin(Date.now() * 0.001) * 0.1]}>
          <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Right Lower Arm - raised for waving */}
        <mesh position={[0.1, -0.3, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
          <primitive object={skinMaterial} />
        </mesh>
        {/* Right Hand - waving */}
        <mesh position={[0.2, -0.5, 0.4]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <primitive object={skinMaterial} />
        </mesh>
        {/* Hand palm - open for waving */}
        <mesh position={[0.25, -0.5, 0.4]} rotation={[0, 0, Math.PI / 6]}>
          <planeGeometry args={[0.12, 0.08]} />
          <primitive object={skinMaterial} />
        </mesh>
      </group>

      {/* Realistic Legs with baggy grey pants */}
      <group position={[-0.2, -0.4, 0]}>
        {/* Left Upper Leg - baggy pants */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.sin(Date.now() * 0.002) * 0.05]}>
          <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Left Lower Leg - baggy pants */}
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Left Sneaker */}
        <mesh position={[0, -0.8, 0.1]} rotation={[Math.PI / 12, 0, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshStandardMaterial color={0xffffff} roughness={0.3} />
        </mesh>
        {/* Left Sneaker sole */}
        <mesh position={[0, -0.85, 0.15]} rotation={[Math.PI / 12, 0, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.32]} />
          <meshStandardMaterial color={0xffffff} roughness={0.2} />
        </mesh>
        {/* Left Sneaker laces */}
        <mesh position={[0, -0.75, 0.15]} rotation={[Math.PI / 12, 0, 0]}>
          <planeGeometry args={[0.15, 0.06]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
      </group>
      
      <group position={[0.2, -0.4, 0]}>
        {/* Right Upper Leg - baggy pants */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.sin(Date.now() * 0.002) * 0.05]}>
          <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Right Lower Leg - baggy pants */}
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.13, 0.5, 4, 8]} />
          <meshStandardMaterial color={0x808080} roughness={0.7} />
        </mesh>
        {/* Right Sneaker */}
        <mesh position={[0, -0.8, 0.1]} rotation={[Math.PI / 12, 0, 0]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshStandardMaterial color={0xffffff} roughness={0.3} />
        </mesh>
        {/* Right Sneaker sole */}
        <mesh position={[0, -0.85, 0.15]} rotation={[Math.PI / 12, 0, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.32]} />
          <meshStandardMaterial color={0xffffff} roughness={0.2} />
        </mesh>
        {/* Right Sneaker laces */}
        <mesh position={[0, -0.75, 0.15]} rotation={[Math.PI / 12, 0, 0]}>
          <planeGeometry args={[0.15, 0.06]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
      </group>

      {/* Enhanced hologram effects with better visibility */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 4, 64, 1, true]} />
        <meshBasicMaterial
          color="#667eea"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Additional glow ring for character prominence */}
      <mesh position={[0, 0.5, 0]}>
        <ringGeometry args={[1.8, 2.2, 64]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Pulsing energy field around character */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial
          color="#667eea"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Dynamic scanning lines */}
      <mesh position={[0, 0.5 + Math.sin(Date.now() * 0.005) * 2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[4, 0.03]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.5 + Math.sin(Date.now() * 0.005) * 2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[4, 0.03]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enhanced floating particles around avatar */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[
            Math.cos((i / 30) * Math.PI * 2) * (3 + Math.sin(Date.now() * 0.001 + i) * 0.8),
            Math.sin(Date.now() * 0.002 + i) * 1.5 + 1,
            Math.sin((i / 30) * Math.PI * 2) * (3 + Math.cos(Date.now() * 0.001 + i) * 0.8)
          ]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? "#667eea" : i % 3 === 1 ? "#00ff88" : "#f093fb"} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
        </Float>
      ))}

      {/* Floating intro panel with same design as other panels */}
      <FloatingIntroPanel />
    </group>
  );
}

// Floating Intro Panel Component
function FloatingIntroPanel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.x = Math.sin(t * 0.3) * 2;
      meshRef.current.position.y = 3 + Math.cos(t * 0.4) * 0.5;
      meshRef.current.position.z = Math.sin(t * 0.2) * 1;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, 3, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[3, 2]} />
      <meshStandardMaterial
        color={hovered ? '#764ba2' : '#667eea'}
        emissive={hovered ? '#764ba2' : '#667eea'}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        transparent
        opacity={0.9}
      />
      <Html position={[0, 0, 0.1]} transform>
        <div className={`project-panel ${hovered ? 'hovered' : ''}`}>
          <h3>Hi! I'm Yasasvi</h3>
          <p>Full Stack Developer & AI Enthusiast</p>
          <div className="status-indicators">
            <span className="status-dot online"></span>
            <span>Available for opportunities</span>
          </div>
          <div className="skills-preview">
            <span className="skill-tag">React</span>
            <span className="skill-tag">AI/ML</span>
            <span className="skill-tag">Web3</span>
          </div>
        </div>
      </Html>
    </mesh>
  );
}

// Floating Code Snippet Component
function FloatingCode({ code, position, index }: { code: string; position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + index * 2;
      meshRef.current.position.x = position[0] + Math.sin(t * 0.5) * 2;
      meshRef.current.position.y = position[1] + Math.cos(t * 0.7) * 1.5;
      meshRef.current.position.z = position[2] + Math.sin(t * 0.3) * 1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.6, 0.05]} />
      <meshStandardMaterial
        color="#f093fb"
        emissive="#f5576c"
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
      <Html position={[0, 0, 0.05]} transform>
        <div className="code-snippet">
          <code>{code}</code>
        </div>
      </Html>
    </mesh>
  );
}

// 3D Architecture Diagram Component
function ArchitectureDiagram({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setRotationSpeed(0.02)}
      onPointerOut={() => setRotationSpeed(0.005)}
    >
      {/* Frontend Layer */}
      <Box args={[2, 0.3, 2]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#61dafb" emissive="#61dafb" emissiveIntensity={0.3} />
      </Box>
      <Html position={[0, 2, 1.2]} center>
        <div className="arch-label">Frontend</div>
      </Html>

      {/* API Layer */}
      <Box args={[2, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#68a063" emissive="#68a063" emissiveIntensity={0.3} />
      </Box>
      <Html position={[0, 1, 1.2]} center>
        <div className="arch-label">API</div>
      </Html>

      {/* Backend Layer */}
      <Box args={[2, 0.3, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f093fb" emissive="#f093fb" emissiveIntensity={0.3} />
      </Box>
      <Html position={[0, 0, 1.2]} center>
        <div className="arch-label">Backend</div>
      </Html>

      {/* Database Layer */}
      <Box args={[2, 0.3, 2]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#ffa500" emissive="#ffa500" emissiveIntensity={0.3} />
      </Box>
      <Html position={[0, -1, 1.2]} center>
        <div className="arch-label">Database</div>
      </Html>

      {/* Connecting lines */}
      {[1.5, 0.5, -0.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
          <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Project Navigation Panel
function ProjectPanel({ project, position, onClick }: { project: any; position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial
          color={hovered ? '#764ba2' : '#667eea'}
          emissive={hovered ? '#764ba2' : '#667eea'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Html position={[0, 0, 0.1]} transform>
        <div className={`project-panel ${hovered ? 'hovered' : ''}`}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="tech-tags">
            {project.tech.map((t: string, i: number) => (
              <span key={i} className="tech-tag">{t}</span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Main AR Scene with enhanced environment
function Scene() {
  const [selectedProject, setSelectedProject] = useState(0);

  const projects = [
    {
      title: 'AI Resume Editor',
      description: 'AI-powered resume optimization with GPT-4',
      tech: ['React', 'Python', 'OpenAI', 'FastAPI'],
    },
    {
      title: 'Diet AI Agent',
      description: 'Personalized nutrition planning with ML',
      tech: ['Next.js', 'TensorFlow', 'Firebase', 'OpenCV'],
    },
    {
      title: 'AR Portfolio',
      description: 'Immersive 3D portfolio experience',
      tech: ['Three.js', 'WebXR', 'React', 'AR.js'],
    },
  ];

  const codeSnippets = [
    'const AI = () => {\n  return magic;\n}',
    'def solve(problem):\n  return solution',
    'async function build(){\n  await dream();\n}',
    'class Developer {\n  code();\n}',
    'const future = {\n  isNow: true\n}',
    'AI.learn() && \nHuman.inspire()',
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 6]} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxDistance={12}
        minDistance={3}
        enableDamping={true}
        dampingFactor={0.05}
        target={[0, 1, 0]}
      />

      {/* Enhanced Lighting Setup for better character visibility */}
      <ambientLight intensity={0.4} color="#f0f4ff" />
      
      {/* Main directional light - stronger for character */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.8} 
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Enhanced fill lights for realistic skin rendering */}
      <pointLight position={[-5, 3, 5]} intensity={1.0} color="#f0f4ff" />
      <pointLight position={[5, 3, -5]} intensity={0.8} color="#667eea" />
      
      {/* Character-focused rim light */}
      <spotLight 
        position={[0, 8, -8]} 
        angle={0.6} 
        penumbra={1} 
        intensity={2.0} 
        color="#f093fb"
        castShadow
      />
      
      {/* Additional character lighting */}
      <pointLight position={[0, 5, 3]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#ffeb3b" />

      {/* Environment for realistic reflections */}
      <Environment preset="studio" />
      
      {/* Contact shadows for grounding */}
      <ContactShadows 
        position={[0, -1.8, 0]} 
        opacity={0.3} 
        scale={10} 
        blur={2} 
        far={5} 
        resolution={256} 
        color="#000000" 
      />

      {/* Realistic Human Avatar - Enhanced and more prominent */}
      <RealisticHumanAvatar position={[0, 0, 0]} />

      {/* Enhanced Floating Code Snippets - Repositioned to not overlap character */}
      {codeSnippets.map((code, i) => (
        <FloatingCode
          key={i}
          code={code}
          position={[
            Math.cos((i * Math.PI * 2) / codeSnippets.length) * 8,
            i * 0.4 + 2,
            Math.sin((i * Math.PI * 2) / codeSnippets.length) * 8,
          ]}
          index={i}
        />
      ))}

      {/* Enhanced Architecture Diagram - Moved further away */}
      <ArchitectureDiagram position={[9, 0, -6]} />

      {/* Project Panels with better positioning - Further from character */}
      {projects.map((project, i) => (
        <ProjectPanel
          key={i}
          project={project}
          position={[
            Math.cos(((i * Math.PI * 2) / projects.length) + Math.PI / 2) * 10,
            -1 + i * 0.3,
            Math.sin(((i * Math.PI * 2) / projects.length) + Math.PI / 2) * 10,
          ]}
          onClick={() => setSelectedProject(i)}
        />
      ))}

      {/* Enhanced Grid floor with glow effect */}
      <gridHelper 
        args={[25, 25, '#667eea', '#764ba2']} 
        position={[0, -1.8, 0]} 
        material-transparent 
        material-opacity={0.3}
      />
      
      {/* Floating tech orbs around the scene */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Float key={`orb-${i}`} speed={2 + i * 0.1} rotationIntensity={1} floatIntensity={1}>
          <mesh position={[
            Math.cos((i / 12) * Math.PI * 2) * 8,
            Math.sin(Date.now() * 0.002 + i) * 2 + 2,
            Math.sin((i / 12) * Math.PI * 2) * 8,
          ]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#667eea" : i % 3 === 1 ? "#764ba2" : "#f093fb"}
              emissive={i % 3 === 0 ? "#667eea" : i % 3 === 1 ? "#764ba2" : "#f093fb"}
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Main AR Scene Component
export default function ARScene() {
  const [isWebXRSupported, setIsWebXRSupported] = useState(true);
  const [gestureHint, setGestureHint] = useState(true);

  useEffect(() => {
    // Check for WebXR support
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRSupported(supported);
      });
    }

    // Hide gesture hint after 5 seconds
    const timer = setTimeout(() => setGestureHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ar-scene-container">
      {gestureHint && (
        <div className="gesture-hint">
          <p>👆 Drag to rotate • 🤏 Pinch to zoom • 👋 Tap objects to interact</p>
        </div>
      )}

      <Canvas
        className="ar-canvas"
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
          logarithmicDepthBuffer: true
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <div className="ar-info">
        <div className="ar-status">
          <span className={`status-dot ${isWebXRSupported ? 'active' : 'inactive'}`}></span>
          <span>{isWebXRSupported ? 'WebXR Ready' : 'Fallback Mode'}</span>
        </div>
      </div>
    </div>
  );
}

