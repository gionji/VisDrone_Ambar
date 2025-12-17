import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment as EnvironmentDrei, Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { EnvironmentType, ActorCategory, WeatherSettings } from '../types';
import { UrbanEnvironment, CountryEnvironment, WinterEnvironment } from './Environments';
import { ActorManager } from './Actors';

interface SceneProps {
  environment: EnvironmentType;
  actorCounts: Record<ActorCategory, number>;
  showBoundingBoxes: boolean;
  weather: WeatherSettings;
  seed: number;
}

export const Scene: React.FC<SceneProps> = ({ environment, actorCounts, showBoundingBoxes, weather, seed }) => {
  
  // Calculate Sun Position based on Time of Day (0-24) and Azimuth (0-360)
  const sunPosition = useMemo(() => {
    const azimuthRad = (weather.azimuth * Math.PI) / 180;
    const r = 100;
    const y = Math.sin((weather.timeOfDay - 6) / 12 * Math.PI) * r;
    const groundProjectedR = Math.cos((weather.timeOfDay - 6) / 12 * Math.PI) * r;
    
    const x = groundProjectedR * Math.sin(azimuthRad);
    const z = groundProjectedR * Math.cos(azimuthRad);

    return new THREE.Vector3(x, Math.max(y, -10), z);
  }, [weather.timeOfDay, weather.azimuth]);

  // Determine light intensity based on time of day
  const lightIntensity = useMemo(() => {
      const rawIntensity = Math.sin(((weather.timeOfDay - 6) / 24) * Math.PI * 2);
      return Math.max(0.1, rawIntensity * 1.5);
  }, [weather.timeOfDay]);

  return (
    <div className="w-full h-full bg-black relative">
        <Canvas shadows camera={{ position: [30, 40, 50], fov: 45 }}>
          
          {/* Dynamic Global Fog */}
          <fog attach="fog" args={[weather.fogColor, 10, 100 / (weather.fogDensity + 0.001)]} />
          <color attach="background" args={[weather.fogColor]} />

          {/* Dynamic Lighting */}
          <ambientLight intensity={lightIntensity * 0.3} color={weather.fogColor} />
          <directionalLight 
            position={sunPosition} 
            intensity={lightIntensity} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
            shadow-camera-left={-80}
            shadow-camera-right={80}
            shadow-camera-top={80}
            shadow-camera-bottom={-80}
          />

          {/* Dynamic Sky */}
          <Sky 
            sunPosition={sunPosition} 
            turbidity={10} 
            rayleigh={0.5 + weather.fogDensity * 2} 
            mieCoefficient={0.005 + weather.fogDensity * 0.05}
            mieDirectionalG={0.8}
          />

          {/* Clouds */}
          {weather.cloudCover > 0 && (
             <Cloud 
                opacity={weather.cloudCover} 
                speed={0.2} 
                width={100} 
                depth={1.5} 
                segments={20} 
                position={[0, 40, 0]}
                color={weather.timeOfDay < 6 || weather.timeOfDay > 18 ? "#334155" : "#ffffff"}
             />
          )}

          {/* Environment Specifics - Key forces regeneration */}
          <Suspense fallback={null}>
            <EnvironmentDrei preset={environment === EnvironmentType.URBAN ? "city" : "park"} background={false} />

            <group key={`${environment}-${seed}`}>
                {environment === EnvironmentType.URBAN && <UrbanEnvironment />}
                {environment === EnvironmentType.COUNTRY && <CountryEnvironment />}
                {environment === EnvironmentType.WINTER && <WinterEnvironment />}
            </group>
          </Suspense>

          {/* Actors */}
          <ActorManager 
            counts={actorCounts} 
            environmentType={environment} 
            showBoundingBoxes={showBoundingBoxes} 
          />

          {/* Controls */}
          <OrbitControls 
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={10}
            maxDistance={150}
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
