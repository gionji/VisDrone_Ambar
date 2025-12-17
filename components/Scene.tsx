import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment as EnvironmentDrei, Sky } from '@react-three/drei';
import { EnvironmentType, ActorCategory } from '../types';
import { UrbanEnvironment, CountryEnvironment, WinterEnvironment } from './Environments';
import { ActorManager } from './Actors';

interface SceneProps {
  environment: EnvironmentType;
  actorCounts: Record<ActorCategory, number>;
  showBoundingBoxes: boolean;
}

export const Scene: React.FC<SceneProps> = ({ environment, actorCounts, showBoundingBoxes }) => {
  return (
    <div className="w-full h-full bg-black relative">
        <Canvas shadows camera={{ position: [30, 40, 50], fov: 45 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[50, 100, 50]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
          />

          {/* Environment Specifics */}
          <Suspense fallback={null}>
            {environment === EnvironmentType.URBAN && (
                <>
                    <UrbanEnvironment />
                    <Sky sunPosition={[100, 20, 100]} turbidity={10} rayleigh={0.5} />
                    <EnvironmentDrei preset="city" />
                </>
            )}
            {environment === EnvironmentType.COUNTRY && (
                <>
                    <CountryEnvironment />
                    <Sky sunPosition={[10, 10, 100]} />
                    <EnvironmentDrei preset="park" />
                </>
            )}
            {environment === EnvironmentType.WINTER && (
                <>
                    <WinterEnvironment />
                    <fog attach="fog" args={['#e2e8f0', 5, 80]} />
                    <Sky sunPosition={[0, 10, -100]} inclination={0.6} azimuth={0.1} />
                    <EnvironmentDrei preset="park" />
                </>
            )}
          </Suspense>

          {/* Actors */}
          <ActorManager 
            counts={actorCounts} 
            environmentType={environment} 
            showBoundingBoxes={showBoundingBoxes} 
          />

          {/* Controls */}
          <OrbitControls 
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under ground
            minDistance={10}
            maxDistance={120}
          />
        </Canvas>
        
        {/* Overlay Info */}
        <div className="absolute top-4 left-4 text-white/50 text-xs pointer-events-none select-none">
            <p>Left Click: Rotate</p>
            <p>Right Click: Pan</p>
            <p>Scroll: Zoom</p>
        </div>
    </div>
  );
};