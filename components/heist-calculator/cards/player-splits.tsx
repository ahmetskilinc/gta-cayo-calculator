"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SPLIT_MIN, SPLIT_STEP } from "@/lib/heist-data";

type PlayerSplitsProps = {
  playerCount: number;
  playerSplits: number[];
  totalSplit: number;
  splitsOverflow: boolean;
  splitsUnder: boolean;
  onIncrease: (idx: number) => void;
  onDecrease: (idx: number) => void;
};

export function PlayerSplits({ playerCount, playerSplits, totalSplit, splitsOverflow, splitsUnder, onIncrease, onDecrease }: PlayerSplitsProps) {
  return (
    <div className="space-y-2">
      <Label>Player Cuts</Label>
      {playerSplits.slice(0, playerCount).map((split, idx) => (
        <div key={`player-cut-${idx}-${split}`} className="flex items-center justify-between gap-3">
          <span className="text-xs w-20 shrink-0">{idx === 0 ? "Player 1 (Host)" : `Player ${idx + 1}`}</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon-sm" onClick={() => onDecrease(idx)} disabled={split <= SPLIT_MIN} aria-label="Decrease cut">
              −
            </Button>
            <span className="w-10 text-center text-xs font-medium tabular-nums">{split}%</span>
            <Button variant="outline" size="icon-sm" onClick={() => onIncrease(idx)} disabled={split >= 100} aria-label="Increase cut">
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
  );
}
