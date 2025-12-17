export enum EnvironmentType {
  URBAN = 'URBAN',
  COUNTRY = 'COUNTRY',
  WINTER = 'WINTER',
}

export enum ActorCategory {
  Pedestrian = 0,
  People = 1,
  Bicycle = 2,
  Car = 3,
  Van = 4,
  Truck = 5,
  Tricycle = 6,
  AwningTricycle = 7,
  Bus = 8,
  Motor = 9,
}

export interface ActorConfig {
  id: number;
  category: ActorCategory;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  scale: [number, number, number];
  variant: number; // 0, 1, 2... for random variations
  modelPath?: string; // Path to .glb file if available
}

export interface WeatherSettings {
  timeOfDay: number; // 0-24
  azimuth: number; // 0-360
  cloudCover: number; // 0-1
  fogDensity: number; // 0-0.1
  fogColor: string; // hex
}

export interface SimulationState {
  environment: EnvironmentType;
  actorCounts: Record<ActorCategory, number>;
  showBoundingBoxes: boolean;
  isPlaying: boolean;
}