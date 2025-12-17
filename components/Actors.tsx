import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { ACTOR_DEFINITIONS, WORLD_SIZE, ASSET_LIBRARY } from '../constants';
import { ActorCategory, ActorConfig } from '../types';

interface ActorProps {
  config: ActorConfig;
  showBoundingBox: boolean;
  environmentType: string;
}

// --- Component to handle External GLB/GLTF Models ---
const ExternalModel: React.FC<{ path: string; scale: [number, number, number]; color: string }> = ({ path, scale, color }) => {
  // Safe load: useGLTF will suspend, so this should be wrapped in Suspense in the parent if not preloaded.
  // In a real app, ensure paths are correct.
  const { scene } = useGLTF(path);
  
  // Clone the scene so multiple actors can use the same asset independently
  // We use the <Clone> component from drei which is a shortcut for useGraph/clone
  return (
    <group scale={scale}>
        <Clone object={scene} castShadow receiveShadow />
    </group>
  );
};

const Actor: React.FC<ActorProps> = ({ config, showBoundingBox, environmentType }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState(new THREE.Vector3(...config.position));
  const [velocity] = useState(new THREE.Vector3(...config.velocity));
  
  // Random wandering logic
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Move
    const speedMultiplier = environmentType === 'WINTER' ? 0.6 : 1.0; // Slower in snow
    const move = velocity.clone().multiplyScalar(delta * speedMultiplier);
    position.add(move);

    // Bounce off walls
    const bound = WORLD_SIZE / 2 - 2;
    if (position.x > bound || position.x < -bound) {
        velocity.x = -velocity.x;
        position.x = Math.max(-bound, Math.min(bound, position.x));
    }
    if (position.z > bound || position.z < -bound) {
        velocity.z = -velocity.z;
        position.z = Math.max(-bound, Math.min(bound, position.z));
    }

    // Follow terrain height roughly (simple approximation)
    let y = 0;
    if (environmentType === 'WINTER') {
       y += Math.sin(position.x * 0.1) * 2 + Math.cos(position.z * 0.1) * 2 + Math.random() * 0.01;
       // Offset for model pivot
       y += config.scale[1] / 2;
    } else if (environmentType === 'URBAN') {
       y = config.scale[1] / 2; // Flat
    } else {
       // Country slightly bumpy
       y = config.scale[1] / 2 + 0.1; 
    }

    meshRef.current.position.set(position.x, y, position.z);
    
    // Rotate to face movement direction
    if (velocity.lengthSq() > 0.1) {
        const targetRotation = Math.atan2(velocity.x, velocity.z);
        meshRef.current.rotation.y = targetRotation;
    }
  });

  const def = ACTOR_DEFINITIONS[config.category];

  // Logic to render either a Real Asset (if path exists) or a Procedural Fallback
  // If you fill ASSET_LIBRARY in constants.ts, this will try to load the model.
  const RenderedGeometry = useMemo(() => {
    
    // 1. IF A REAL MODEL PATH IS DEFINED, USE IT
    if (config.modelPath) {
        // We wrap in Error Boundary conceptually, but here we just return the component.
        // If file is missing, Three.js might warn.
        // We adjust scale slightly because GLB scales vary wildly.
        return <ExternalModel path={config.modelPath} scale={[1,1,1]} color={config.color} />;
    }

    // 2. FALLBACK: PROCEDURAL GEOMETRY WITH VARIATIONS
    // We use config.variant to change the shape slightly to prove "Multiple per category" works.
    
    const isHuman = config.category === ActorCategory.Pedestrian || config.category === ActorCategory.People;
    const isCycle = config.category === ActorCategory.Bicycle || config.category === ActorCategory.Motor || config.category === ActorCategory.Tricycle || config.category === ActorCategory.AwningTricycle;
    
    if (isHuman) {
        // Variation: Different colors or slightly different heights
        const variantHeight = config.variant % 2 === 0 ? 1 : 0.9;
        return (
            <mesh castShadow receiveShadow>
                <capsuleGeometry args={[config.scale[0], config.scale[1] * variantHeight, 4, 8]} />
                <meshStandardMaterial color={config.variant === 0 ? config.color : '#e2e8f0'} />
            </mesh>
        );
    } else if (isCycle) {
        return (
            <group>
                 <mesh castShadow receiveShadow position={[0, 0, 0]}>
                    <boxGeometry args={[config.scale[0], config.scale[1] * 0.5, config.scale[2]]} />
                    <meshStandardMaterial color={config.color} />
                </mesh>
                <mesh position={[0, -config.scale[1]*0.4, -config.scale[2]/2.5]} rotation={[0,0,Math.PI/2]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[0, -config.scale[1]*0.4, config.scale[2]/2.5]} rotation={[0,0,Math.PI/2]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>
        )
    } else {
        // VEHICLES: Implement 3 distinct variations
        
        // Variation 0: Standard Box (Sedan)
        if (config.variant === 0) {
            return (
                <group>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={config.scale} />
                        <meshStandardMaterial color={config.color} />
                    </mesh>
                    <mesh position={[0, config.scale[1]/4, config.scale[2]/2.1]}>
                        <boxGeometry args={[config.scale[0]*0.8, config.scale[1]/2, 0.1]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1}/>
                    </mesh>
                </group>
            );
        } 
        // Variation 1: Sporty (Flatter, different color accent)
        else if (config.variant === 1) {
             return (
                <group>
                    <mesh castShadow receiveShadow position={[0, -config.scale[1]*0.2, 0]}>
                        <boxGeometry args={[config.scale[0], config.scale[1]*0.6, config.scale[2]]} />
                        <meshStandardMaterial color="#fbbf24" /> {/* Yellow sports car */}
                    </mesh>
                    {/* Cabin */}
                    <mesh position={[0, config.scale[1]*0.2, -0.5]}>
                        <boxGeometry args={[config.scale[0]*0.8, config.scale[1]*0.5, config.scale[2]*0.5]} />
                        <meshStandardMaterial color="#111" metalness={0.8}/>
                    </mesh>
                </group>
            );
        }
        // Variation 2: Utility/Boxy (White van style)
        else {
             return (
                <group>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[config.scale[0], config.scale[1]*1.2, config.scale[2]]} />
                        <meshStandardMaterial color="#f8fafc" /> {/* White Utility */}
                    </mesh>
                    <mesh position={[0, 0, config.scale[2]/2.1]}>
                        <planeGeometry args={[config.scale[0]*0.8, config.scale[1]]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            );
        }
    }
  }, [config]);

  return (
    <group ref={meshRef}>
      {RenderedGeometry}
      {showBoundingBox && (
        <Html position={[0, config.scale[1] / 2, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
          <div className="relative group">
            <div 
              style={{
                width: `${Math.max(60, config.scale[0] * 30)}px`,
                height: `${Math.max(60, config.scale[1] * 40)}px`,
                border: `2px solid ${def.color}`,
                backgroundColor: `${def.color}22`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
              className="rounded-sm shadow-sm backdrop-blur-[1px]"
            >
              <div 
                 style={{ backgroundColor: def.color }}
                 className="text-[10px] font-bold text-white px-1 py-0.5 truncate w-full"
              >
                 {def.label} V:{config.variant} <span className="opacity-70">0.99</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const ActorManager: React.FC<{
  counts: Record<ActorCategory, number>;
  environmentType: string;
  showBoundingBoxes: boolean;
  customAssets?: Record<number, string[]>;
}> = ({ counts, environmentType, showBoundingBoxes, customAssets }) => {
  const actors = useMemo(() => {
    const list: ActorConfig[] = [];
    let idCounter = 0;

    Object.entries(counts).forEach(([catStr, count]) => {
      const category = parseInt(catStr) as ActorCategory;
      const def = ACTOR_DEFINITIONS[category];
      
      // Get available real models for this category:
      // Combine Static Library + Custom Uploaded Assets
      const staticModels = ASSET_LIBRARY[category] || [];
      const userModels = customAssets?.[category] || [];
      const availableModels = [...staticModels, ...userModels];

      for (let i = 0; i < (count as number); i++) {
        const x = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        const z = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        
        const vx = (Math.random() - 0.5) * def.speed;
        const vz = (Math.random() - 0.5) * def.speed;

        // Determine Variant and Model Path
        let variant = 0;
        let modelPath: string | undefined = undefined;

        if (availableModels.length > 0) {
            // Pick a model randomly from the combined list
            const idx = Math.floor(Math.random() * availableModels.length);
            modelPath = availableModels[idx];
            variant = idx;
        } else {
            // Fallback to procedural variations
            variant = Math.floor(Math.random() * 3);
        }

        list.push({
          id: idCounter++,
          category,
          position: [x, 0, z],
          velocity: [vx, 0, vz],
          color: def.color,
          scale: def.scale,
          variant,
          modelPath
        });
      }
    });
    return list;
  }, [counts, customAssets]); // Regenerate if customAssets change

  return (
    <>
      {actors.map((actor) => (
        <Actor 
            key={actor.id} 
            config={actor} 
            showBoundingBox={showBoundingBoxes} 
            environmentType={environmentType}
        />
      ))}
    </>
  );
};
