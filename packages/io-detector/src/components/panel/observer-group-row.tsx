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
import { InstanceRow } from '.';

interface ObserverGroupRowProps {
  group: ObserverGroup;
}

export function ObserverGroupRow({ group }: ObserverGroupRowProps): ReactNode {
  const uiConfig = useStore($uiConfig);
  const ratios = useStore($intersectionRatios);

  const isExpanded = uiConfig.expandedGroups.has(group.fingerprint);

  function toggleExpand(): void {
    const newSet = new Set(uiConfig.expandedGroups);
    if (isExpanded) {
      newSet.delete(group.fingerprint);
    } else {
      newSet.add(group.fingerprint);
    }
    $uiConfig.set({ ...uiConfig, expandedGroups: newSet });
  }

  const zombieCount = group.members.filter((m) => m.isZombie).length;

  return (
    <div
      className={`io-group-row${zombieCount > 0 ? ' io-group-row--zombie' : ''}`}
    >
      {/* Header */}
      <button className="io-group-row__header" onClick={toggleExpand}>
        <span className="io-group-row__chevron">{isExpanded ? '▾' : '▸'}</span>
        <span className="io-group-row__name">{group.displayName}</span>
        <span className="io-group-row__count">{group.members.length}</span>
        {zombieCount > 0 && (
          <span className="io-group-row__zombie-badge" aria-label="Zombie">
            💀×{zombieCount}
          </span>
        )}
      </button>

      {/* Instance list */}
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
