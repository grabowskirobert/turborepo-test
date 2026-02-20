/**
 * FEAT-002 — ObserverGroupRow
 *
 * Collapsible row representing one observer group (shared fingerprint).
 * Header shows group name, member count, zombie indicator.
 * When expanded, renders one <InstanceRow> per (member × target) pair.
 *
 * @see feat-002.md § B. Smart Naming & Aggregation
 * @see feat-002.md § E. Zombie Hunter Integration
 */
import type { ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import type { ObserverGroup } from '@/core';
import { $uiConfig, $intersectionRatios } from '@/stores';
import { InstanceRow } from './InstanceRow';

interface ObserverGroupRowProps {
  group: ObserverGroup;
}

/**
 * TODO(feat-002): implement
 *   - Toggle expanded/collapsed via $uiConfig.expandedGroups (Set mutation)
 *   - Header: chevron icon + group.displayName + member count badge
 *   - Zombie header: 💀 icon, red-tinted background
 *   - When expanded: iterate group.members → iterate member.targets
 *     → render <InstanceRow> with ratio from $intersectionRatios
 *     key: "${member.id}::${targetIndex}"
 */
export function ObserverGroupRow({ group }: ObserverGroupRowProps): ReactNode {
  const uiConfig = useStore($uiConfig);
  const ratios = useStore($intersectionRatios);

  const isExpanded = uiConfig.expandedGroups.has(group.fingerprint);

  function toggleExpand(): void {
    // TODO(feat-002): implement — immutable Set update in $uiConfig
    void isExpanded;
  }

  return (
    <div
      className={`io-group-row${group.isZombie ? ' io-group-row--zombie' : ''}`}
    >
      {/* Header */}
      <button className="io-group-row__header" onClick={toggleExpand}>
        <span className="io-group-row__chevron">{isExpanded ? '▾' : '▸'}</span>
        {group.isZombie && <span aria-label="Zombie">💀</span>}
        <span className="io-group-row__name">{group.displayName}</span>
        <span className="io-group-row__count">{group.members.length}</span>
      </button>

      {/* Instance list — TODO(feat-002): implement full member×target iteration */}
      {isExpanded && (
        <div className="io-group-row__instances">
          {group.members.map((member) =>
            Array.from(member.targets).map((target, idx) => (
              <InstanceRow
                key={`${member.id}::${idx}`}
                observer={member}
                target={target}
                targetIndex={idx}
                ratio={ratios[`${member.id}::${idx}`] ?? 0}
              />
            )),
          )}
        </div>
      )}
    </div>
  );
}
