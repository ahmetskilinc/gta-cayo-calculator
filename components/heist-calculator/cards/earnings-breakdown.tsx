import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney, type HeistCalculation, type HeistState, type PrimaryTarget } from "@/lib/heist-data";
import { BreakdownRow } from "@/components/heist-calculator/shared/breakdown-row";

type EarningsBreakdownProps = {
  state: HeistState;
  calc: HeistCalculation;
  selectedTarget: PrimaryTarget | undefined;
  splitsOverflow: boolean;
};

export function EarningsBreakdown({ state, calc, selectedTarget, splitsOverflow }: EarningsBreakdownProps) {
  return (
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
                <div key={share.playerId} className="flex items-center justify-between gap-4">
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
  );
}
