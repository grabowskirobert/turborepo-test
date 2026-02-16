/**
 * @repo/io-detector
 *
 * Intersection Observer Detector - Developer Experience Tool
 *
 * Makes the invisible visible: debugger for IntersectionObserver API
 * that overlays rootMargin zones, monitors visibility metrics, and
 * catches memory leaks ("Zombie Observers").
 *
 * @packageDocumentation
 */

// Main Component - Public API
export { IODetector } from './IODetector';

// Re-export stores for advanced usage
export { $observers, $uiConfig } from './stores';

// Re-export types
export type { ObserverMetadata, UIConfig } from './core/types';
