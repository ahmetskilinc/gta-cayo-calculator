import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, type HeistCalculation } from "@/lib/heist-data";

type OptimalLootGuideProps = {
  calc: HeistCalculation;
  withinCooldown: boolean;
  hasAnyLoot: boolean;
};

export function OptimalLootGuide({ calc, withinCooldown, hasAnyLoot }: OptimalLootGuideProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimal Loot Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-xs">
          Enter piles found above. Collect in this order to maximise earnings - ranked by value per bag unit.
          {withinCooldown && calc.secondaryMultiplier > 1 && (
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
  );
}
