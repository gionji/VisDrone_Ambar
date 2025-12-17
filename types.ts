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
}

export interface SimulationState {
  environment: EnvironmentType;
  actorCounts: Record<ActorCategory, number>;
  showBoundingBoxes: boolean;
  isPlaying: boolean;
}