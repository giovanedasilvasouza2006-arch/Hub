import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  weight?: number;
  height?: number;
  bodyFat?: number;
}

interface BodyModelProps {
  weight: number;
  height: number;
  bodyFat: number;
  position: [number, number, number];
  skinColor: string;
  shirtColor: string;
  jeansColor: string;
  hairColor: string;
  label: string;
}

function BodyModel({ 
  weight, 
  height, 
  bodyFat, 
  position, 
  skinColor, 
  shirtColor, 
  jeansColor, 
  hairColor,
  label 
}: BodyModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate scales based on metrics with safety fallbacks
  const safeHeight = Math.max(height || 175, 50); // Min 50cm
  const safeWeight = Math.max(weight || 75, 20); // Min 20kg
  
  const heightScale = safeHeight / 175;
  const bmi = safeWeight / ((safeHeight / 100) ** 2);
  const bodyThickness = Math.min(Math.max(bmi / 24, 0.5), 2.5); // Clamp scale between 0.5 and 2.5
  
  const fatFactor = 1 + (bodyFat - 15) / 50;
  const hipWidthFactor = 1.1;

  // Inverse scales for head/hands/feet to keep them proportional
  const invWidth = 1 / bodyThickness;
  const invHeight = 1 / heightScale;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5 + position[0]) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[bodyThickness, heightScale, bodyThickness]}>
      {/* Label for the model */}
      <mesh position={[0, 2.8, 0]} scale={[invWidth, invHeight, invWidth]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color={skinColor} transparent opacity={0} />
      </mesh>

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        {/* Head */}
        <mesh position={[0, 2.3, 0]} scale={[invWidth, invHeight, invWidth]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color={skinColor} metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.4, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Upper Torso / Chest */}
        <RoundedBox args={[1.7, 1.2, 0.9]} radius={0.4} smoothness={4} position={[0, 1.1, 0]} scale={[1, 1, fatFactor * 0.95]}>
           <meshStandardMaterial color={shirtColor} metalness={0.2} roughness={0.8} />
        </RoundedBox>

        {/* Middle Torso */}
        <RoundedBox args={[0.91 * fatFactor, 0.8, 0.75 * fatFactor]} radius={0.3} smoothness={4} position={[0, 0.2, 0]}>
           <meshStandardMaterial color={shirtColor} metalness={0.2} roughness={0.8} />
        </RoundedBox>

        {/* Lower Torso / Hips */}
        <RoundedBox args={[1.05 * fatFactor * hipWidthFactor, 1.0, 0.85 * fatFactor]} radius={0.4} smoothness={4} position={[0, -0.6, 0]}>
           <meshStandardMaterial color={jeansColor} metalness={0.1} roughness={0.9} />
        </RoundedBox>

        {/* Glutes */}
        <group position={[0, -0.8, -0.2]}>
          <RoundedBox args={[0.75 * hipWidthFactor, 0.8, 0.5 * fatFactor]} position={[0.38 * hipWidthFactor, 0, 0]} radius={0.3}>
            <meshStandardMaterial color={jeansColor} metalness={0.1} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.75 * hipWidthFactor, 0.8, 0.5 * fatFactor]} position={[-0.38 * hipWidthFactor, 0, 0]} radius={0.3}>
            <meshStandardMaterial color={jeansColor} metalness={0.1} roughness={0.9} />
          </RoundedBox>
        </group>

        {/* Arms - Adjusted position and added rotation to separate from body */}
        <group position={[1.1, 0.5, 0]} rotation={[0, 0, -0.15]}>
          <RoundedBox args={[0.35, 2.4, 0.35]} radius={0.15}>
            <meshStandardMaterial color={skinColor} />
          </RoundedBox>
          {/* Hand */}
          <RoundedBox args={[0.35, 0.4, 0.15]} position={[0, -1.4, 0]} radius={0.1} scale={[invWidth, invHeight, invWidth]}>
            <meshStandardMaterial color={skinColor} />
          </RoundedBox>
        </group>

        <group position={[-1.1, 0.5, 0]} rotation={[0, 0, 0.15]}>
          <RoundedBox args={[0.35, 2.4, 0.35]} radius={0.15}>
            <meshStandardMaterial color={skinColor} />
          </RoundedBox>
          {/* Hand */}
          <RoundedBox args={[0.35, 0.4, 0.15]} position={[0, -1.4, 0]} radius={0.1} scale={[invWidth, invHeight, invWidth]}>
            <meshStandardMaterial color={skinColor} />
          </RoundedBox>
        </group>

        {/* Legs */}
        <RoundedBox args={[0.6, 1.8, 0.6]} position={[0.45, -1.9, 0]} radius={0.25}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>
        <RoundedBox args={[0.6, 1.8, 0.6]} position={[-0.45, -1.9, 0]} radius={0.25}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>

        {/* Shins */}
        <RoundedBox args={[0.45, 1.8, 0.45]} position={[0.45, -3.6, 0]} radius={0.2}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>
        <RoundedBox args={[0.45, 1.8, 0.45]} position={[-0.45, -3.6, 0]} radius={0.2}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>

        {/* Feet */}
        <RoundedBox args={[0.5, 0.2, 0.9]} position={[0.45, -4.5, 0.2]} radius={0.1} scale={[invWidth, invHeight, invWidth]}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>
        <RoundedBox args={[0.5, 0.2, 0.9]} position={[-0.45, -4.5, 0.2]} radius={0.1} scale={[invWidth, invHeight, invWidth]}>
          <meshStandardMaterial color={jeansColor} />
        </RoundedBox>
      </Float>
    </group>
  );
}

export default function Scene3D({ weight = 75, height = 175, bodyFat = 15 }: Scene3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-10, 10, -10]} intensity={2} color="#ffffff" />
      
      <group ref={groupRef} position={[0, -0.2, 0]}>
        {/* CURRENT BODY - Blue theme */}
        <BodyModel 
          weight={weight} 
          height={height} 
          bodyFat={bodyFat} 
          position={[-2.5, 0.5, 0]}
          skinColor="#3b82f6"
          shirtColor="#1e40af"
          jeansColor="#1e3a8a"
          hairColor="#172554"
          label="ATUAL"
        />

        {/* TARGET BODY - Gold/Amber theme */}
        <BodyModel 
          weight={85} 
          height={height} 
          bodyFat={13} 
          position={[2.5, 0.5, 0]}
          skinColor="#fbbf24"
          shirtColor="#92400e"
          jeansColor="#451a03"
          hairColor="#271100"
          label="META"
        />
      </group>

      {/* Ground Reflection Grid */}
      <gridHelper args={[20, 20, '#cbd5e1', '#f1f5f9']} position={[0, -4, 0]} />
    </>
  );
}

