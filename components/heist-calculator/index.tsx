"use client";

import { useState, useMemo } from "react";
import { PRIMARY_TARGETS, calculateHeist, getDefaultSplits, SPLIT_STEP, SPLIT_MIN, type HeistState } from "@/lib/heist-data";
import { HeistSetupCard } from "@/components/heist-calculator/cards/heist-setup-card";
import { SecondaryLootCard } from "@/components/heist-calculator/cards/secondary-loot-card";
import { OptimalLootGuide } from "@/components/heist-calculator/cards/optimal-loot-guide";
import { EarningsBreakdown } from "@/components/heist-calculator/cards/earnings-breakdown";

const DEFAULT_STATE: HeistState = {
  primaryTargetId: "pink-diamond",
  playerCount: 1,
  playerSplits: [100],
  hardMode: false,
  withinCooldown: false,
  firstTime: false,
  eliteChallenge: false,
  officeSafe: 0,
  lootStacks: {
    gold: 0,
    cocaine: 0,
    artwork: 0,
    weed: 0,
    cash: 0,
  },
};

export function HeistCalculator() {
  const [state, setState] = useState<HeistState>(DEFAULT_STATE);

  const calc = useMemo(() => calculateHeist(state), [state]);

  const visibleTargets = PRIMARY_TARGETS.filter((t) => !t.firstTimeOnly || state.firstTime);
  const selectedTarget = PRIMARY_TARGETS.find((t) => t.id === state.primaryTargetId);

  const activeSplits = state.playerSplits.slice(0, state.playerCount);
  const totalSplit = activeSplits.reduce((a, b) => a + b, 0);
  const splitsOverflow = totalSplit > 100;
  const splitsUnder = totalSplit < 100;

  const bagFillPercent = (calc.bagUsedUnits / calc.bagCapacityUnits) * 100;
  const hasAnyLoot = Object.values(state.lootStacks).some((v) => v > 0);

  function handlePrimaryChange(id: string) {
    setState((prev) => ({ ...prev, primaryTargetId: id }));
  }

  function handlePlayerCountChange(val: string) {
    const count = parseInt(val);
    setState((prev) => ({
      ...prev,
      playerCount: count,
      playerSplits: getDefaultSplits(count),
      lootStacks: count === 1 ? { ...prev.lootStacks, gold: 0 } : prev.lootStacks,
    }));
  }

  function handleIncreaseSplit(idx: number) {
    const splits = [...state.playerSplits];
    splits[idx] = Math.min(100, splits[idx] + SPLIT_STEP);
    setState((p) => ({ ...p, playerSplits: splits }));
  }

  function handleDecreaseSplit(idx: number) {
    const splits = [...state.playerSplits];
    if (splits[idx] <= SPLIT_MIN) return;
    splits[idx] -= SPLIT_STEP;
    setState((p) => ({ ...p, playerSplits: splits }));
  }

  function handleFirstTimeChange(v: boolean) {
    setState((p) => ({
      ...p,
      firstTime: v,
      primaryTargetId: !v && p.primaryTargetId === "madrazo" ? "pink-diamond" : p.primaryTargetId,
    }));
  }

  function handleChange(patch: Partial<HeistState>) {
    setState((p) => ({ ...p, ...patch }));
  }

  function handleLootChange(id: string, value: number) {
    setState((prev) => ({
      ...prev,
      lootStacks: { ...prev.lootStacks, [id]: Math.max(0, value) },
    }));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4 pt-18">
      <div className="grid gap-4 md:grid-cols-2">
        <HeistSetupCard
          state={state}
          visibleTargets={visibleTargets}
          selectedTarget={selectedTarget}
          totalSplit={totalSplit}
          splitsOverflow={splitsOverflow}
          splitsUnder={splitsUnder}
          onPrimaryChange={handlePrimaryChange}
          onPlayerCountChange={handlePlayerCountChange}
          onIncreaseSplit={handleIncreaseSplit}
          onDecreaseSplit={handleDecreaseSplit}
          onChange={handleChange}
          onFirstTimeChange={handleFirstTimeChange}
        />
        <SecondaryLootCard
          lootStacks={state.lootStacks}
          playerCount={state.playerCount}
          bagsUsed={calc.bagsUsed}
          bagsTotal={calc.bagsTotal}
          bagFillPercent={bagFillPercent}
          onLootChange={handleLootChange}
        />
      </div>
      <OptimalLootGuide calc={calc} withinCooldown={state.withinCooldown} hasAnyLoot={hasAnyLoot} />
      <EarningsBreakdown state={state} calc={calc} selectedTarget={selectedTarget} splitsOverflow={splitsOverflow} />
    </div>
  );
}
