"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SECONDARY_LOOT, formatMoney, pileBagPercent } from "@/lib/heist-data";

type SecondaryLootCardProps = {
  lootStacks: Record<string, number>;
  playerCount: number;
  bagsUsed: number;
  bagsTotal: number;
  bagFillPercent: number;
  onLootChange: (id: string, value: number) => void;
};

export function SecondaryLootCard({ lootStacks, playerCount, bagsUsed, bagsTotal, bagFillPercent, onLootChange }: SecondaryLootCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Secondary Loot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Bag fill (optimal)</span>
            <span className="text-muted-foreground tabular-nums">
              {bagsUsed.toFixed(2)} / {bagsTotal}.00 bags
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
            const stacks = lootStacks[loot.id] ?? 0;
            const isDisabled = loot.teamOnly && playerCount === 1;
            const availableValue = stacks * loot.valuePerPile;
            const bagPct = pileBagPercent(loot)
              .toFixed(2)
              .replace(/\.?0+$/, "");

            return (
              <div
                key={loot.id}
                className={["flex items-center justify-between gap-3 rounded-md px-3 py-2 ring-1 ring-foreground/10", isDisabled ? "opacity-40" : ""].join(" ")}
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
                    onChange={(e) => onLootChange(loot.id, parseInt(e.target.value) || 0)}
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
  );
}
