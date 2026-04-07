/**
 * FEAT-003 — Three-Tier Safety System
 *
 * Scans non-zombie observer count and determines which safety tier applies.
 * Protects the host application from rendering overhead by auto-scaling
 * visual fidelity (or disabling visuals entirely) based on observer volume.
 *
 * @see feat-003.md § d. The "Three-Tier Safety System"
 */
import type { ObserverMetadata, SafetyTier, SafetyTierState } from './types';

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

/** Tier 1 upper-bound (inclusive). */
const TIER_1_MAX = 30;
/** Tier 2 upper-bound (inclusive). */
const TIER_2_MAX = 50;

// ---------------------------------------------------------------------------
// determineSafetyTier
// ---------------------------------------------------------------------------

/**
 * Determine the current safety tier from the active (non-zombie) observer count.
 *
 * @param _observers  - Current observer registry snapshot.
 * @param _userToggle - User's manual visual toggle. `null` = no override yet.
 */
export function determineSafetyTier(
  observers: Record<string, ObserverMetadata>,
  userToggle: boolean | null,
): SafetyTierState {
  const liveCount = Object.values(observers).filter((o) => !o.isZombie).length;

  let tier: SafetyTier;
  let statusMessage: string;
  let areVisualsEnabled: boolean;

  if (liveCount <= TIER_1_MAX) {
    tier = 1;
    statusMessage = '🟢 System Active';
    areVisualsEnabled = true;
  } else if (liveCount <= TIER_2_MAX) {
    tier = 2;
    statusMessage = `⚠️ Visual Limit Reached (30/${liveCount} shown)`;
    areVisualsEnabled = true;
  } else {
    tier = 3;
    statusMessage = '⚠️ High Load (50+). Visuals disabled.';
    areVisualsEnabled = false;
  }

  // User toggle override — survives tier transitions (Hysteresis).
  // null = no preference yet → follow tier default.
  if (userToggle !== null) {
    areVisualsEnabled = userToggle;
  }

  return { tier, totalObservers: liveCount, statusMessage, areVisualsEnabled };
}
