import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Text, MeshWobbleMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function Studio3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Positions for lines and objects
  const points = useMemo(() => [
    new THREE.Vector3(-3, 2, 0),
    new THREE.Vector3(3, -2, 0),
    new THREE.Vector3(2, 3, -2),
    new THREE.Vector3(-2, -3, 2),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(0, -4, 0),
  ], []);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />

      {/* AI Center Symbol */}
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <Text
          position={[0, 0, 0]}
          fontSize={1.5}
          color="#3b82f6"
          font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jTrywnAR4_X_aB6.woff"
          anchorX="center"
          anchorY="middle"
        >
          AI
        </Text>
        <mesh position={[0, 0, -0.2]}>
          <torusGeometry args={[1.2, 0.02, 16, 100]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={5} />
        </mesh>
      </Float>

      {/* YouTube - Moved out of center */}
      <Float speed={2} position={[-4, 2, 1]} rotationIntensity={2}>
        <group scale={0.5}>
          <mesh>
            <boxGeometry args={[4, 2.5, 0.5]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0, 0.3]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.8, 1, 3]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      </Float>

      {/* Flying Apps / Social Media Blocks */}
      <Float speed={3} position={[4, -1, 2]} rotationIntensity={1}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
        </mesh>
      </Float>
      
      <Float speed={4} position={[-2, -3, -2]} rotationIntensity={2}>
        <mesh>
          <octahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </Float>

      <Float speed={2.5} position={[2, 3, -1]} rotationIntensity={0.5}>
        <mesh>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </Float>

      {/* Empty Space Blocks (Wireframes) */}
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="white" wireframe opacity={0.1} transparent />
        </mesh>
      ))}

      {/* Connection Lines (Everything Ligado) */}
      <Line
        points={points}
        color="white"
        lineWidth={0.5}
        transparent
        opacity={0.1}
      />

      <Line
        points={[points[0], points[2], points[4], points[0]]}
        color="#3b82f6"
        lineWidth={1}
        dashed
        opacity={0.2}
      />

      {/* Decorative particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Float key={i} speed={Math.random() * 2} position={[
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10
        ]}>
          <mesh>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color={i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#3b82f6" : "#ec4899"} emissiveIntensity={2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
