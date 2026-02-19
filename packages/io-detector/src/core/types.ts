/**
 * Types for Intersection Observer Detector Core
 */

export interface ObserverMetadata {
  id: string;
  instance: IntersectionObserver;
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
  isZombie: boolean;
  createdAt: number;
  options?: IntersectionObserverInit;
  stackTrace?: string;
}

export interface ObserverRegistry {
  observers: Map<string, ObserverMetadata>;
}

export interface UIConfig {
  collapsed: boolean;
  inspectionMode: 'none' | 'highlight' | 'inspect';
  selectedObserverId: string | null;
}

/**
 * Port for observer registry storage.
 * Dependency Inversion: Core logic depends on this abstraction,
 * concrete implementation (nanostores) is injected at composition root.
 */
export interface ObserverRegistryPort {
  set(id: string, metadata: ObserverMetadata): void;
  remove(id: string): void;
  getAll(): Record<string, ObserverMetadata>;
  markZombie(id: string): void;
}
