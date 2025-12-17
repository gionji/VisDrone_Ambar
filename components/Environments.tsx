import React, { useMemo } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE } from '../constants';

// --- Urban Environment ---
export const UrbanEnvironment: React.FC = () => {
  const buildings = useMemo(() => {
    const items = [];
    const blockSize = 15;
    const streetWidth = 10;
    const halfWorld = WORLD_SIZE / 2;

    for (let x = -halfWorld; x < halfWorld; x += blockSize + streetWidth) {
      for (let z = -halfWorld; z < halfWorld; z += blockSize + streetWidth) {
        if (Math.random() > 0.2) { // Chance for a park/empty lot
          const height = Math.random() * 15 + 5;
          items.push({
            position: [x + blockSize / 2, height / 2, z + blockSize / 2] as [number, number, number],
            scale: [blockSize, height, blockSize] as [number, number, number],
            color: Math.random() > 0.5 ? '#64748b' : '#475569', // Slate colors
          });
        }
      }
    }
    return items;
  }, []);

  return (
    <group>
      {/* Ground (Asphalt) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE * 1.5, WORLD_SIZE * 1.5]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      
      {/* Grid Lines (Road Markings) */}
      <gridHelper args={[WORLD_SIZE * 1.5, 20, 0xffffff, 0xffffff]} position={[0, 0.1, 0]} />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh position={b.position} castShadow receiveShadow>
            <boxGeometry args={b.scale} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          {/* Windows / Lights simulation */}
          <mesh position={[b.position[0], b.position[1], b.position[2] + b.scale[2]/2 + 0.1]}>
             <planeGeometry args={[b.scale[0] * 0.8, b.scale[1] * 0.8]} />
             <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Street Lights */}
      <pointLight position={[0, 20, 0]} intensity={1} distance={50} decay={2} color="#fbbf24" />
      <pointLight position={[30, 20, 30]} intensity={1} distance={50} decay={2} color="#fbbf24" />
      <pointLight position={[-30, 20, -30]} intensity={1} distance={50} decay={2} color="#fbbf24" />
    </group>
  );
};

// --- Country Environment ---
export const CountryEnvironment: React.FC = () => {
  const trees = useMemo(() => {
    const items = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * WORLD_SIZE;
      const z = (Math.random() - 0.5) * WORLD_SIZE;
      // Keep center somewhat clear
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
      
      items.push({
        position: [x, 0, z] as [number, number, number],
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return items;
  }, []);

  const houses = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 20;
      items.push({
        position: [Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius] as [number, number, number],
        rotation: [0, -angle, 0] as [number, number, number],
      });
    }
    return items;
  }, []);

  return (
    <group>
       {/* Ground (Grass) */}
       <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE * 1.5, WORLD_SIZE * 1.5]} />
        <meshStandardMaterial color="#3f6212" roughness={1} />
      </mesh>

      {/* Irregular Road (Curved Path via Torus segments or simple primitives) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
         <ringGeometry args={[15, 22, 32]} />
         <meshStandardMaterial color="#78350f" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0.06, 20]}>
         <ringGeometry args={[5, 10, 32]} />
         <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* Trees */}
      {trees.map((t, i) => (
        <group key={i} position={t.position} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 2]} />
            <meshStandardMaterial color="#3f2c22" />
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.5, 4, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      ))}

      {/* Cottages */}
      {houses.map((h, i) => (
         <group key={`house-${i}`} position={h.position} rotation={h.rotation as any}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4, 3, 4]} />
              <meshStandardMaterial color="#fef3c7" />
            </mesh>
            <mesh position={[0, 2.5, 0]} castShadow>
               <coneGeometry args={[3.5, 2, 4]} rotation={[0, Math.PI/4, 0]}/>
               <meshStandardMaterial color="#991b1b" />
            </mesh>
         </group>
      ))}
    </group>
  );
};

// --- Winter Environment ---
export const WinterEnvironment: React.FC = () => {
  // Create undulating terrain geometry
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE * 1.5, WORLD_SIZE * 1.5, 64, 64);
    const posAttribute = geo.attributes.position;
    
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i); // This is Z in world space before rotation
      
      // Simple wave function for hills
      const zHeight = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.1) * 2 + Math.random() * 0.5;
      
      posAttribute.setZ(i, zHeight);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  const trees = useMemo(() => {
      const items = [];
      for(let i=0; i<30; i++) {
          const x = (Math.random() - 0.5) * WORLD_SIZE;
          const z = (Math.random() - 0.5) * WORLD_SIZE;
          const height = Math.sin(x * 0.1) * 2 + Math.cos(z * 0.1) * 2; // Match terrain roughly
          items.push([x, height, z]);
      }
      return items;
  }, []);

  return (
    <group>
      <mesh geometry={terrainGeometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Snow Covered Trees */}
      {trees.map((pos, i) => (
          <group key={i} position={[pos[0], pos[1], pos[2]]}>
             <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.2, 2]} />
                <meshStandardMaterial color="#473223" />
             </mesh>
             <mesh position={[0, 2.5, 0]} castShadow>
                <coneGeometry args={[1, 3, 8]} />
                <meshStandardMaterial color="#e2e8f0" />
             </mesh>
          </group>
      ))}

      {/* Ambient particles (Snow) - Simple implementation with small white spheres */}
      {Array.from({length: 50}).map((_, i) => (
          <mesh key={`snow-${i}`} position={[
              (Math.random() - 0.5) * WORLD_SIZE, 
              5 + Math.random() * 10, 
              (Math.random() - 0.5) * WORLD_SIZE
            ]}>
              <sphereGeometry args={[0.1, 4, 4]} />
              <meshBasicMaterial color="white" />
          </mesh>
      ))}
    </group>
  );
};