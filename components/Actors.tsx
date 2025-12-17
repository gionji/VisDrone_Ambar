import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ACTOR_DEFINITIONS, WORLD_SIZE } from '../constants';
import { ActorCategory, ActorConfig } from '../types';

interface ActorProps {
  config: ActorConfig;
  showBoundingBox: boolean;
  environmentType: string;
}

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
    let y = config.scale[1] / 2;
    if (environmentType === 'WINTER') {
       y += Math.sin(position.x * 0.1) * 2 + Math.cos(position.z * 0.1) * 2 + Math.random() * 0.01;
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

  // Visual Geometry based on type
  const Geometry = useMemo(() => {
    const isHuman = config.category === ActorCategory.Pedestrian || config.category === ActorCategory.People;
    const isCycle = config.category === ActorCategory.Bicycle || config.category === ActorCategory.Motor || config.category === ActorCategory.Tricycle || config.category === ActorCategory.AwningTricycle;
    
    if (isHuman) {
        return (
            <mesh castShadow receiveShadow>
                <capsuleGeometry args={[config.scale[0], config.scale[1], 4, 8]} />
                <meshStandardMaterial color={config.color} />
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
        // Vehicles
        return (
            <group>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={config.scale} />
                    <meshStandardMaterial color={config.color} />
                </mesh>
                {/* Windshield */}
                 <mesh position={[0, config.scale[1]/4, config.scale[2]/2.1]}>
                    <boxGeometry args={[config.scale[0]*0.8, config.scale[1]/2, 0.1]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1}/>
                </mesh>
            </group>
        );
    }
  }, [config]);

  return (
    <group ref={meshRef}>
      {Geometry}
      {showBoundingBox && (
        <Html position={[0, config.scale[1] / 2, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
          <div className="relative group">
            {/* The Bounding Box Visual */}
            <div 
              style={{
                width: `${Math.max(60, config.scale[0] * 30)}px`,
                height: `${Math.max(60, config.scale[1] * 40)}px`,
                border: `2px solid ${def.color}`,
                backgroundColor: `${def.color}22`, // transparent fill
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
              className="rounded-sm shadow-sm backdrop-blur-[1px]"
            >
              {/* Label Header */}
              <div 
                 style={{ backgroundColor: def.color }}
                 className="text-[10px] font-bold text-white px-1 py-0.5 truncate w-full"
              >
                 {def.label} <span className="opacity-70">0.99</span>
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
}> = ({ counts, environmentType, showBoundingBoxes }) => {
  const actors = useMemo(() => {
    const list: ActorConfig[] = [];
    let idCounter = 0;

    Object.entries(counts).forEach(([catStr, count]) => {
      const category = parseInt(catStr) as ActorCategory;
      const def = ACTOR_DEFINITIONS[category];
      
      for (let i = 0; i < (count as number); i++) {
        const x = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        const z = (Math.random() - 0.5) * (WORLD_SIZE - 5);
        
        // Random velocity
        const vx = (Math.random() - 0.5) * def.speed;
        const vz = (Math.random() - 0.5) * def.speed;

        list.push({
          id: idCounter++,
          category,
          position: [x, 0, z], // Y is handled in Actor component
          velocity: [vx, 0, vz],
          color: def.color,
          scale: def.scale,
        });
      }
    });
    return list;
  }, [counts]); // Re-generate when counts change

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
