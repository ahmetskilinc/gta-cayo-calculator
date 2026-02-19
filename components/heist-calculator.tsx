"use client";

import { useState, useMemo } from "react";
import {
  PRIMARY_TARGETS,
  SECONDARY_LOOT,
  calculateHeist,
  formatMoney,
  getDefaultSplits,
  pileBagPercent,
  SPLIT_MIN,
  SPLIT_STEP,
  type HeistState,
} from "@/lib/heist-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function BreakdownRow({
  label,
  value,
  bold,
  muted,
  positive,
  negative,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-muted-foreground" : bold ? "font-medium" : ""}>{label}</span>
      <span
        className={[
          bold ? "font-medium" : "",
          muted ? "text-muted-foreground" : "",
          positive ? "text-green-600 dark:text-green-400" : "",
          negative ? "text-red-500 dark:text-red-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
  description,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(val) => onCheckedChange(val === true)} className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description && <span className="text-muted-foreground text-xs">{description}</span>}
      </div>
    </div>
  );
}

export function HeistCalculator() {
  const [state, setState] = useState<HeistState>(DEFAULT_STATE);

  const calc = useMemo(() => calculateHeist(state), [state]);

  const visibleTargets = PRIMARY_TARGETS.filter((t) => !t.firstTimeOnly || state.firstTime);

  function setLootStacks(id: string, value: number) {
    setState((prev) => ({
      ...prev,
      lootStacks: { ...prev.lootStacks, [id]: Math.max(0, value) },
    }));
  }

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

  function increaseSplit(idx: number) {
    const splits = [...state.playerSplits];
    splits[idx] = Math.min(100, splits[idx] + SPLIT_STEP);
    setState((p) => ({ ...p, playerSplits: splits }));
  }

  function decreaseSplit(idx: number) {
    const splits = [...state.playerSplits];
    if (splits[idx] <= SPLIT_MIN) return;
    splits[idx] -= SPLIT_STEP;
    setState((p) => ({ ...p, playerSplits: splits }));
  }

  const activeSplits = state.playerSplits.slice(0, state.playerCount);
  const totalSplit = activeSplits.reduce((a, b) => a + b, 0);
  const splitsOverflow = totalSplit > 100;
  const splitsUnder = totalSplit < 100;

  const selectedTarget = PRIMARY_TARGETS.find((t) => t.id === state.primaryTargetId);

  const bagFillPercent = (calc.bagUsedUnits / calc.bagCapacityUnits) * 100;
  const hasAnyLoot = Object.values(state.lootStacks).some((v) => v > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Heist Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Primary Target</Label>
              <Select value={state.primaryTargetId} onValueChange={handlePrimaryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibleTargets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center justify-between gap-6 w-full">
                        <span>{t.name}</span>
                        <span className="text-muted-foreground">{formatMoney(state.hardMode ? t.hardValue : t.standardValue)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTarget?.rare && <p className="text-muted-foreground text-xs">Panther Statue is only available during special event weeks.</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Player Count</Label>
              <Select value={String(state.playerCount)} onValueChange={handlePlayerCountChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n === 1 ? "1 Player (Solo)" : `${n} Players`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state.playerCount > 1 && (
              <div className="space-y-2">
                <Label>Player Cuts</Label>
                {state.playerSplits.slice(0, state.playerCount).map((split, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className="text-xs w-20 shrink-0">{idx === 0 ? "Player 1 (Host)" : `Player ${idx + 1}`}</span>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon-sm" onClick={() => decreaseSplit(idx)} disabled={split <= SPLIT_MIN} aria-label="Decrease cut">
                        −
                      </Button>
                      <span className="w-10 text-center text-xs font-medium tabular-nums">{split}%</span>
                      <Button variant="outline" size="icon-sm" onClick={() => increaseSplit(idx)} disabled={split >= 100} aria-label="Increase cut">
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-muted-foreground text-xs">
                    Min {SPLIT_MIN}% · {SPLIT_STEP}% steps
                  </p>
                  <span
                    className={[
                      "text-xs font-medium tabular-nums",
                      splitsOverflow ? "text-red-500 dark:text-red-400" : splitsUnder ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    Total: {totalSplit}%
                  </span>
                </div>
                {splitsOverflow && <p className="text-red-500 dark:text-red-400 text-xs">Splits exceed 100% — reduce cuts before calculating earnings.</p>}
                {splitsUnder && !splitsOverflow && <p className="text-yellow-600 dark:text-yellow-400 text-xs">{100 - totalSplit}% unallocated.</p>}
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <CheckboxField
                id="hard-mode"
                label="Hard Mode"
                checked={state.hardMode}
                onCheckedChange={(v) => setState((p) => ({ ...p, hardMode: v }))}
                description={`+${formatMoney((selectedTarget?.hardValue ?? 0) - (selectedTarget?.standardValue ?? 0))} on primary. Start within 48 min of last run.`}
              />
              <CheckboxField
                id="within-cooldown"
                label="Within 72h Cooldown"
                checked={state.withinCooldown}
                onCheckedChange={(v) => setState((p) => ({ ...p, withinCooldown: v }))}
                description={`Secondary loot ×${selectedTarget?.bonusMultiplier?.toFixed(2) ?? "1.00"} bonus based on primary target.`}
              />
              <CheckboxField
                id="first-time"
                label="First Time Run"
                checked={state.firstTime}
                onCheckedChange={(v) => {
                  setState((p) => ({
                    ...p,
                    firstTime: v,
                    primaryTargetId: !v && p.primaryTargetId === "madrazo" ? "pink-diamond" : p.primaryTargetId,
                  }));
                }}
                description="Unlocks Madrazo Files as primary target. Adds $25,000 setup cost."
              />
              <CheckboxField
                id="elite-challenge"
                label="Elite Challenge Completed"
                checked={state.eliteChallenge}
                onCheckedChange={(v) => setState((p) => ({ ...p, eliteChallenge: v }))}
                description={`+${formatMoney(state.hardMode ? 100_000 : 50_000)} bonus. Requires no restarts, full bag, undetected, under 15 min.`}
              />
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="office-safe">Office Safe Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">$</span>
                <Input
                  id="office-safe"
                  type="number"
                  min={0}
                  max={99_000}
                  value={state.officeSafe || ""}
                  placeholder="0"
                  onChange={(e) => {
                    const val = Math.min(99_000, Math.max(0, parseInt(e.target.value) || 0));
                    setState((p) => ({ ...p, officeSafe: val }));
                  }}
                  className="w-32"
                />
              </div>
              <p className="text-muted-foreground text-xs">Random amount found in El Rubio&apos;s office safe ($0–$99,000).</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Secondary Loot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bag fill (optimal)</span>
                <span className="text-muted-foreground tabular-nums">
                  {calc.bagsUsed.toFixed(2)} / {calc.bagsTotal}.00 bags
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full transition-all",
                    bagFillPercent > 99 ? "bg-primary" : bagFillPercent > 60 ? "bg-yellow-500 dark:bg-yellow-400" : "bg-primary",
                  ].join(" ")}
                  style={{ width: `${Math.min(bagFillPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {SECONDARY_LOOT.map((loot) => {
                const stacks = state.lootStacks[loot.id] ?? 0;
                const isDisabled = loot.teamOnly && state.playerCount === 1;
                const availableValue = stacks * loot.valuePerPile;
                const bagPct = pileBagPercent(loot)
                  .toFixed(2)
                  .replace(/\.?0+$/, "");

                return (
                  <div
                    key={loot.id}
                    className={["flex items-center justify-between gap-3 rounded-md px-3 py-2 ring-1 ring-foreground/10", isDisabled ? "opacity-40" : ""].join(
                      " ",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-xs">{loot.name}</span>
                        {loot.teamOnly && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Team only
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        {formatMoney(loot.valuePerPile)}/pile · {bagPct}% bag/pile · {loot.grabsPerPile} grabs/pile
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {stacks > 0 && <span className="text-xs text-muted-foreground whitespace-nowrap">{formatMoney(availableValue)}</span>}
                      <Input
                        type="number"
                        min={0}
                        value={stacks || ""}
                        placeholder="0"
                        disabled={isDisabled}
                        onChange={(e) => setLootStacks(loot.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        aria-label={`${loot.name} piles found`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimal Loot Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-xs">
            Enter piles found above. Collect in this order to maximise earnings - ranked by value per bag unit.
            {state.withinCooldown && calc.secondaryMultiplier > 1 && (
              <span className="ml-1 text-foreground font-medium">(×{calc.secondaryMultiplier.toFixed(2)} cooldown bonus applied)</span>
            )}
          </p>
          {hasAnyLoot && (
            <>
              <div className="space-y-1.5">
                {calc.optimalCollection.map((item, i) => (
                  <div key={item.lootId} className="flex items-center gap-3 rounded-md px-3 py-2 ring-1 ring-foreground/10">
                    <span className="text-muted-foreground text-xs w-4 shrink-0 tabular-nums">{i + 1}.</span>
                    <span className="font-medium text-xs flex-1">{item.name}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {item.bags.toFixed(2)} bag{item.bags !== 1 ? "s" : ""}
                    </span>
                    <span className="text-muted-foreground text-xs w-16 text-right">
                      {item.grabs} grab{item.grabs !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-medium w-20 text-right tabular-nums">{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  Bags total:{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {calc.bagsUsed.toFixed(2)} / {calc.bagsTotal}.00
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Secondary value: <span className="font-medium text-foreground">{formatMoney(calc.secondaryValue)}</span>
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <BreakdownRow
            label={state.hardMode ? `${selectedTarget?.name ?? "Primary Target"} (Hard Mode)` : (selectedTarget?.name ?? "Primary Target")}
            value={formatMoney(calc.primaryValue)}
          />
          {state.hardMode && calc.hardModeBonus > 0 && (
            <BreakdownRow
              label={`Hard mode (${formatMoney(selectedTarget?.standardValue ?? 0)} → ${formatMoney(selectedTarget?.hardValue ?? 0)})`}
              value={`+${formatMoney(calc.hardModeBonus)}`}
              muted
            />
          )}
          <BreakdownRow label="Secondary loot" value={formatMoney(calc.secondaryValue)} />
          <BreakdownRow label="Gross total" value={formatMoney(calc.grossTotal)} bold />

          <Separator className="my-1" />

          <BreakdownRow label="Fence fee (−10%)" value={`−${formatMoney(calc.fenceFee)}`} negative />
          <BreakdownRow label="Pavel's cut (−2%)" value={`−${formatMoney(calc.pavelCut)}`} negative />
          {state.firstTime && <BreakdownRow label="Setup cost (first time)" value={`−${formatMoney(calc.setupCost)}`} negative />}

          <Separator className="my-1" />

          <BreakdownRow label="After fees" value={formatMoney(calc.afterPavel - calc.setupCost)} bold />

          {state.eliteChallenge && (
            <BreakdownRow label={`Elite challenge bonus${state.hardMode ? " (Hard Mode)" : ""}`} value={`+${formatMoney(calc.eliteBonus)}`} positive />
          )}
          {calc.officeSafeAmount > 0 && <BreakdownRow label="Office safe" value={`+${formatMoney(calc.officeSafeAmount)}`} positive />}

          <Separator className="my-1" />

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-base font-semibold">Net Total</span>
            <span className="text-base font-semibold text-green-600 dark:text-green-400">{formatMoney(calc.netTotal)}</span>
          </div>

          {state.playerCount > 1 && (
            <div className="space-y-1 pt-1">
              {splitsOverflow ? (
                <p className="text-red-500 dark:text-red-400 text-xs">Fix player cuts above to see per-player earnings.</p>
              ) : (
                calc.perPlayerBreakdown.map((share, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground text-xs">
                      {i === 0 ? "Player 1 (Host)" : `Player ${i + 1}`}
                      <span className="ml-1 opacity-60">({share.split}%)</span>
                    </span>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">{formatMoney(share.amount)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
