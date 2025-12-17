import { ActorCategory } from './types';

export const ACTOR_DEFINITIONS: Record<ActorCategory, { label: string; color: string; scale: [number, number, number]; speed: number }> = {
  [ActorCategory.Pedestrian]: { label: 'Pedestrian', color: '#3b82f6', scale: [0.5, 1.7, 0.5], speed: 1.5 },
  [ActorCategory.People]: { label: 'People', color: '#60a5fa', scale: [0.5, 1.7, 0.5], speed: 1.2 },
  [ActorCategory.Bicycle]: { label: 'Bicycle', color: '#22c55e', scale: [0.6, 1.5, 1.5], speed: 4.0 },
  [ActorCategory.Car]: { label: 'Car', color: '#ef4444', scale: [2, 1.5, 4.5], speed: 10.0 },
  [ActorCategory.Van]: { label: 'Van', color: '#f97316', scale: [2.2, 2.0, 5.0], speed: 9.0 },
  [ActorCategory.Truck]: { label: 'Truck', color: '#a855f7', scale: [2.5, 3.0, 7.0], speed: 7.0 },
  [ActorCategory.Tricycle]: { label: 'Tricycle', color: '#eab308', scale: [1.0, 1.5, 2.0], speed: 3.5 },
  [ActorCategory.AwningTricycle]: { label: 'Awning Tri', color: '#fbbf24', scale: [1.2, 1.8, 2.2], speed: 3.5 },
  [ActorCategory.Bus]: { label: 'Bus', color: '#ec4899', scale: [3.0, 3.5, 10.0], speed: 6.0 },
  [ActorCategory.Motor]: { label: 'Motor', color: '#14b8a6', scale: [0.8, 1.5, 2.0], speed: 8.0 },
};

export const WORLD_SIZE = 100;
