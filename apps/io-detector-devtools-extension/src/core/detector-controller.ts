import type { DetectorStatus } from '../domain/detector-status';
import {
  destroyDetector,
  isDetectorActive,
} from '../integration/chrome-scripting';
import { reloadWithEarlyPatch } from '../integration/chrome-devtools';

export const enabledMessage =
  'Reloading page to patch IntersectionObserver early…';

export async function getDetectorStatus(
  tabId: number,
): Promise<DetectorStatus> {
  const active = await isDetectorActive(tabId);

  return active ? 'active' : 'inactive';
}

export async function enableDetector(): Promise<void> {
  await reloadWithEarlyPatch();
}

export async function disableDetector(tabId: number): Promise<void> {
  await destroyDetector(tabId);
}
