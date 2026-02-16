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
