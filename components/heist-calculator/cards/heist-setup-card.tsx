"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatMoney, type HeistState, type PrimaryTarget } from "@/lib/heist-data";
import { CheckboxField } from "@/components/heist-calculator/shared/checkbox-field";
import { PlayerSplits } from "@/components/heist-calculator/cards/player-splits";

type HeistSetupCardProps = {
  state: HeistState;
  visibleTargets: PrimaryTarget[];
  selectedTarget: PrimaryTarget | undefined;
  totalSplit: number;
  splitsOverflow: boolean;
  splitsUnder: boolean;
  onPrimaryChange: (id: string) => void;
  onPlayerCountChange: (val: string) => void;
  onIncreaseSplit: (idx: number) => void;
  onDecreaseSplit: (idx: number) => void;
  onChange: (patch: Partial<HeistState>) => void;
  onFirstTimeChange: (v: boolean) => void;
};

export function HeistSetupCard({
  state,
  visibleTargets,
  selectedTarget,
  totalSplit,
  splitsOverflow,
  splitsUnder,
  onPrimaryChange,
  onPlayerCountChange,
  onIncreaseSplit,
  onDecreaseSplit,
  onChange,
  onFirstTimeChange,
}: HeistSetupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Heist Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Primary Target</Label>
          <Select value={state.primaryTargetId} onValueChange={onPrimaryChange}>
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
          <Select value={String(state.playerCount)} onValueChange={onPlayerCountChange}>
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
          <PlayerSplits
            playerCount={state.playerCount}
            playerSplits={state.playerSplits}
            totalSplit={totalSplit}
            splitsOverflow={splitsOverflow}
            splitsUnder={splitsUnder}
            onIncrease={onIncreaseSplit}
            onDecrease={onDecreaseSplit}
          />
        )}

        <Separator />

        <div className="space-y-3">
          <CheckboxField
            id="hard-mode"
            label="Hard Mode"
            checked={state.hardMode}
            onCheckedChange={(v) => onChange({ hardMode: v })}
            description={`+${formatMoney((selectedTarget?.hardValue ?? 0) - (selectedTarget?.standardValue ?? 0))} on primary. Start within 48 min of last run.`}
          />
          <CheckboxField
            id="within-cooldown"
            label="Within 72h Cooldown"
            checked={state.withinCooldown}
            onCheckedChange={(v) => onChange({ withinCooldown: v })}
            description={`Secondary loot ×${selectedTarget?.bonusMultiplier?.toFixed(2) ?? "1.00"} bonus based on primary target.`}
          />
          <CheckboxField
            id="first-time"
            label="First Time Run"
            checked={state.firstTime}
            onCheckedChange={onFirstTimeChange}
            description="Unlocks Madrazo Files as primary target. Adds $25,000 setup cost."
          />
          <CheckboxField
            id="elite-challenge"
            label="Elite Challenge Completed"
            checked={state.eliteChallenge}
            onCheckedChange={(v) => onChange({ eliteChallenge: v })}
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
                onChange({ officeSafe: val });
              }}
              className="w-32"
            />
          </div>
          <p className="text-muted-foreground text-xs">Random amount found in El Rubio&apos;s office safe ($0–$99,000).</p>
        </div>
      </CardContent>
    </Card>
  );
}
