/**
 * Zombie Detection Module
 * Polls observer registry to detect "zombie" observers - those observing
 * elements that have been removed from DOM (memory leaks)
 */
import type { ObserverMetadata, ObserverRegistryPort } from './types';

let pollingIntervalId: ReturnType<typeof setInterval> | null = null;
let registryPort: ObserverRegistryPort | null = null;
const POLLING_INTERVAL_MS = 2000;

/**
 * Check all observed targets for zombie state
 */
function checkForZombies(): void {
  if (!registryPort) return;

  const observers = registryPort.getAll();

  (Object.values(observers) as ObserverMetadata[]).forEach((metadata) => {
    if (metadata.isZombie) return; // Already marked

    // Check if ALL targets are disconnected (zombie condition)
    if (metadata.targets.size > 0) {
      let hasConnectedTarget = false;

      metadata.targets.forEach((target: Element) => {
        if (target.isConnected) {
          hasConnectedTarget = true;
        }
      });

      // Mark as zombie if no targets are connected to DOM
      if (!hasConnectedTarget) {
        registryPort!.markZombie(metadata.id);
        console.warn(
          `[IODetector] Zombie Observer detected! ID: ${metadata.id}`,
          '\nObserver has targets that are no longer in DOM.',
          '\nStack trace:',
          metadata.stackTrace,
        );
      }
    }
  });
}

/**
 * Start zombie detection polling loop
 * @param registry - Injected storage port (Dependency Inversion)
 */
export function startZombiePolling(registry: ObserverRegistryPort): void {
  if (pollingIntervalId !== null) {
    console.warn('[IODetector] Zombie polling already active.');
    return;
  }

  registryPort = registry;

  // Use requestIdleCallback if available, fallback to setInterval
  if (typeof requestIdleCallback !== 'undefined') {
    const scheduleCheck = (): void => {
      requestIdleCallback(() => {
        checkForZombies();
        pollingIntervalId = setTimeout(
          scheduleCheck,
          POLLING_INTERVAL_MS,
        ) as unknown as ReturnType<typeof setInterval>;
      });
    };
    scheduleCheck();
  } else {
    pollingIntervalId = setInterval(checkForZombies, POLLING_INTERVAL_MS);
  }

  console.debug('[IODetector] Zombie polling started.');
}

/**
 * Stop zombie detection polling loop
 */
export function stopZombiePolling(): void {
  if (pollingIntervalId === null) return;

  if (typeof requestIdleCallback !== 'undefined') {
    clearTimeout(pollingIntervalId as unknown as number);
  } else {
    clearInterval(pollingIntervalId);
  }

  pollingIntervalId = null;
  registryPort = null;
  console.debug('[IODetector] Zombie polling stopped.');
}
