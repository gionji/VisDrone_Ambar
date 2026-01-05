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
  const { scene } = useGLTF(path);
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
  
  // Simulated confidence score for YOLO look
  const confidence = useMemo(() => (0.85 + Math.random() * 0.14).toFixed(2), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speedMultiplier = environmentType === 'WINTER' ? 0.6 : 1.0;
    const move = velocity.clone().multiplyScalar(delta * speedMultiplier);
    position.add(move);

    const bound = WORLD_SIZE / 2 - 2;
    if (position.x > bound || position.x < -bound) {
        velocity.x = -velocity.x;
        position.x = Math.max(-bound, Math.min(bound, position.x));
    }
    if (position.z > bound || position.z < -bound) {
        velocity.z = -velocity.z;
        position.z = Math.max(-bound, Math.min(bound, position.z));
    }

    let y = 0;
    if (environmentType === 'WINTER') {
       y += Math.sin(position.x * 0.1) * 2 + Math.cos(position.z * 0.1) * 2;
       y += config.scale[1] / 2;
    } else if (environmentType === 'URBAN') {
       y = config.scale[1] / 2;
    } else {
       y = config.scale[1] / 2 + 0.1; 
    }

    meshRef.current.position.set(position.x, y, position.z);
    
    if (velocity.lengthSq() > 0.1) {
        const targetRotation = Math.atan2(velocity.x, velocity.z);
        meshRef.current.rotation.y = targetRotation;
    }
  });

  const def = ACTOR_DEFINITIONS[config.category];

  const RenderedGeometry = useMemo(() => {
    if (config.modelPath) {
        return <ExternalModel path={config.modelPath} scale={[1,1,1]} color={config.color} />;
    }

    const isHuman = config.category === ActorCategory.Pedestrian || config.category === ActorCategory.People;
    const isCycle = config.category === ActorCategory.Bicycle || config.category === ActorCategory.Motor || config.category === ActorCategory.Tricycle || config.category === ActorCategory.AwningTricycle;
    
    if (isHuman) {
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
        } else if (config.variant === 1) {
             return (
                <group>
                    <mesh castShadow receiveShadow position={[0, -config.scale[1]*0.2, 0]}>
                        <boxGeometry args={[config.scale[0], config.scale[1]*0.6, config.scale[2]]} />
                        <meshStandardMaterial color="#fbbf24" />
                    </mesh>
                    <mesh position={[0, config.scale[1]*0.2, -0.5]}>
                        <boxGeometry args={[config.scale[0]*0.8, config.scale[1]*0.5, config.scale[2]*0.5]} />
                        <meshStandardMaterial color="#111" metalness={0.8}/>
                    </mesh>
                </group>
            );
        } else {
             return (
                <group>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[config.scale[0], config.scale[1]*1.2, config.scale[2]]} />
                        <meshStandardMaterial color="#f8fafc" />
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

  // CSS Bounding Box calculation
  // distanceFactor = 20 means 1 unit in 3D = 20px in CSS
  const df = 25;
  const boxWidth = Math.max(config.scale[0], config.scale[2]) * df;
  const boxHeight = config.scale[1] * df;

  return (
    <group ref={meshRef}>
      {RenderedGeometry}
      {showBoundingBox && (
        <Html 
          position={[0, 0, 0]} 
          center 
          distanceFactor={df} 
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div 
            style={{
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              border: `2px solid ${def.color}`,
              backgroundColor: `${def.color}11`,
              position: 'relative',
              transition: 'all 0.1s ease-out'
            }}
            className="group"
          >
            {/* YOLO Label Tag */}
            <div 
              style={{ 
                backgroundColor: def.color,
                position: 'absolute',
                top: '-20px',
                left: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '1px 4px',
                whiteSpace: 'nowrap'
              }}
              className="text-[10px] font-mono font-bold text-white shadow-lg"
            >
              <span>{def.label.toUpperCase()}</span>
              <span className="opacity-80 text-[8px]">{confidence}</span>
            </div>

            {/* Corner Accents for extra YOLO flair */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: 'white' }} />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: 'white' }} />
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
      
      const staticModels = ASSET_LIBRARY[category] || [];
      const userModels = customAssets?.[category] || [];
      const availableModels = [...staticModels, ...userModels];

      for (let i = 0; i < (count as number); i++) {
        const x = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        const z = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        
        const vx = (Math.random() - 0.5) * def.speed;
        const vz = (Math.random() - 0.5) * def.speed;

        let variant = 0;
        let modelPath: string | undefined = undefined;

        if (availableModels.length > 0) {
            const idx = Math.floor(Math.random() * availableModels.length);
            modelPath = availableModels[idx];
            variant = idx;
        } else {
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
  }, [counts, customAssets]);

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
