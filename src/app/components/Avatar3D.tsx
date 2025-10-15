'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedSphereProps {
  imageUrl: string;
}

function AnimatedSphere({ imageUrl }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.2}>
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.4}
            metalness={0.1}
            envMapIntensity={0.5}
          />
        ) : (
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
          />
        )}
      </Sphere>
    </Float>
  );
}

function Scene({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      <AnimatedSphere imageUrl={imageUrl} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

interface Avatar3DProps {
  imageUrl?: string;
  size?: number;
}

export default function Avatar3D({ imageUrl = '/images/profilePic.png', size = 300 }: Avatar3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: size, height: size, background: 'transparent' }} />
    );
  }

  return (
    <div style={{ width: size, height: size, cursor: 'grab' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Scene imageUrl={imageUrl} />
      </Canvas>
    </div>
  );
}

