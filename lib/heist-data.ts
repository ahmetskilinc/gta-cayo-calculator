type PrimaryTarget = {
  id: string;
  name: string;
  standardValue: number;
  hardValue: number;
  bonusMultiplier: number;
  firstTimeOnly?: boolean;
  rare?: boolean;
};

type SecondaryLoot = {
  id: string;
  name: string;
  valuePerPile: number;
  grabsPerPile: number;
  grabWeightUnits: number[];
  teamOnly?: boolean;
  noOverfill?: boolean;
};

export const BAG_TOTAL_UNITS = 1800;

export const PRIMARY_TARGETS: PrimaryTarget[] = [
  { id: "panther", name: "Panther Statue", standardValue: 1_900_000, hardValue: 2_090_000, bonusMultiplier: 1.0, rare: true },
  { id: "pink-diamond", name: "Pink Diamond", standardValue: 1_300_000, hardValue: 1_430_000, bonusMultiplier: 1.0 },
  { id: "madrazo", name: "Madrazo Files", standardValue: 1_100_000, hardValue: 1_100_000, bonusMultiplier: 1.0, firstTimeOnly: true },
  { id: "bearer-bonds", name: "Bearer Bonds", standardValue: 770_000, hardValue: 850_000, bonusMultiplier: 1.05 },
  { id: "ruby-necklace", name: "Ruby Necklace", standardValue: 700_000, hardValue: 770_000, bonusMultiplier: 1.1 },
  { id: "tequila", name: "Sinsimito Tequila", standardValue: 630_000, hardValue: 690_000, bonusMultiplier: 1.2 },
];

export const SECONDARY_LOOT: SecondaryLoot[] = [
  {
    id: "gold",
    name: "Gold",
    valuePerPile: 330_833,
    grabsPerPile: 7,
    grabWeightUnits: [100, 200, 100, 200, 200, 200, 200],
    teamOnly: true,
  },
  {
    id: "cocaine",
    name: "Cocaine",
    valuePerPile: 200_250,
    grabsPerPile: 10,
    grabWeightUnits: [100, 100, 80, 60, 40, 80, 120, 120, 160, 40],
  },
  {
    id: "artwork",
    name: "Artwork",
    valuePerPile: 168_750,
    grabsPerPile: 1,
    grabWeightUnits: [900],
    noOverfill: true,
  },
  {
    id: "weed",
    name: "Weed",
    valuePerPile: 132_750,
    grabsPerPile: 10,
    grabWeightUnits: [75, 75, 60, 45, 30, 60, 90, 90, 120, 30],
  },
  {
    id: "cash",
    name: "Cash",
    valuePerPile: 81_000,
    grabsPerPile: 10,
    grabWeightUnits: [50, 50, 40, 30, 20, 40, 60, 60, 80, 20],
  },
];

const FENCE_FEE = 0.1;
const PAVEL_CUT = 0.02;
const SETUP_COST = 25_000;
const ELITE_BONUS_HARD = 100_000;
const ELITE_BONUS_NORMAL = 50_000;

export type HeistState = {
  primaryTargetId: string;
  playerCount: number;
  playerSplits: number[];
  hardMode: boolean;
  withinCooldown: boolean;
  firstTime: boolean;
  eliteChallenge: boolean;
  officeSafe: number;
  lootStacks: Record<string, number>;
};

type PlayerShare = {
  split: number;
  amount: number;
};

type OptimalLootItem = {
  lootId: string;
  name: string;
  grabs: number;
  bags: number;
  value: number;
  weightUnits: number;
};

type HeistCalculation = {
  primaryValue: number;
  hardModeBonus: number;
  secondaryValue: number;
  secondaryMultiplier: number;
  grossTotal: number;
  fenceFee: number;
  afterFence: number;
  pavelCut: number;
  afterPavel: number;
  setupCost: number;
  eliteBonus: number;
  officeSafeAmount: number;
  netTotal: number;
  perPlayerNet: number;
  perPlayerBreakdown: PlayerShare[];
  bagUsedUnits: number;
  bagCapacityUnits: number;
  bagUsedPercent: number;
  bagCapacityPercent: number;
  bagsUsed: number;
  bagsTotal: number;
  isOverCapacity: boolean;
  optimalCollection: OptimalLootItem[];
};

export const SPLIT_MIN = 15;
export const SPLIT_STEP = 5;

export function getDefaultSplits(playerCount: number): number[] {
  if (playerCount === 1) return [100];
  if (playerCount === 2) return [50, 50];
  if (playerCount === 3) return [35, 35, 30];
  return [25, 25, 25, 25];
}

export function pileUnits(loot: SecondaryLoot): number {
  return loot.grabWeightUnits.reduce((a, b) => a + b, 0);
}

export function pileBagPercent(loot: SecondaryLoot): number {
  return (pileUnits(loot) / BAG_TOTAL_UNITS) * 100;
}

function collectLoot(
  loot: SecondaryLoot,
  availableGrabs: number,
  remainingUnits: number,
  valueMultiplier: number,
  allowOverfill: boolean,
): { grabs: number; units: number; value: number } {
  if (availableGrabs <= 0 || remainingUnits <= 0) return { grabs: 0, units: 0, value: 0 };

  const valuePerUnit = (loot.valuePerPile * valueMultiplier) / pileUnits(loot);

  if (loot.noOverfill) {
    const fullPileUnits = pileUnits(loot);
    if (remainingUnits < fullPileUnits) return { grabs: 0, units: 0, value: 0 };
    const pilesFit = Math.floor(remainingUnits / fullPileUnits);
    const pilesAvail = Math.floor(availableGrabs / loot.grabsPerPile);
    const piles = Math.min(pilesFit, pilesAvail);
    const units = piles * fullPileUnits;
    return { grabs: piles * loot.grabsPerPile, units, value: units * valuePerUnit };
  }

  let grabs = 0;
  let units = 0;
  let value = 0;

  for (let i = 0; i < availableGrabs; i++) {
    const w = loot.grabWeightUnits[i % loot.grabsPerPile];
    if (units + w <= remainingUnits) {
      grabs++;
      units += w;
      value += w * valuePerUnit;
    } else if (allowOverfill && units < remainingUnits) {
      const partial = remainingUnits - units;
      grabs++;
      units += partial;
      value += partial * valuePerUnit;
      break;
    } else {
      break;
    }
  }

  return { grabs, units, value };
}

const VALUE_PRIORITY = ["gold", "cocaine", "weed", "artwork", "cash"] as const;

function optimizeLoot(playerCount: number, availableGrabs: Record<string, number>, valueMultiplier: number): OptimalLootItem[] {
  const capacityUnits = playerCount * BAG_TOTAL_UNITS;
  let remainingUnits = capacityUnits;
  const result: OptimalLootItem[] = [];

  for (const id of VALUE_PRIORITY) {
    if (remainingUnits <= 0) break;

    const loot = SECONDARY_LOOT.find((l) => l.id === id);
    if (!loot) continue;

    if (loot.teamOnly && playerCount === 1) continue;

    const available = availableGrabs[id] ?? 0;
    if (available <= 0) continue;

    const isCash = id === "cash";
    const { grabs, units, value } = collectLoot(loot, available, remainingUnits, valueMultiplier, isCash);

    if (grabs > 0) {
      result.push({
        lootId: loot.id,
        name: loot.name,
        grabs,
        bags: units / BAG_TOTAL_UNITS,
        value,
        weightUnits: units,
      });
      remainingUnits -= units;
    }
  }

  return result;
}

export function calculateHeist(state: HeistState): HeistCalculation {
  const target = PRIMARY_TARGETS.find((t) => t.id === state.primaryTargetId);
  const standardValue = target?.standardValue ?? 0;
  const hardValue = target?.hardValue ?? standardValue;
  const primaryValue = state.hardMode ? hardValue : standardValue;
  const hardModeBonus = state.hardMode ? hardValue - standardValue : 0;

  const secondaryMultiplier = state.withinCooldown ? (target?.bonusMultiplier ?? 1) : 1;

  const bagCapacityUnits = state.playerCount * BAG_TOTAL_UNITS;

  const availableGrabs: Record<string, number> = {};
  for (const loot of SECONDARY_LOOT) {
    availableGrabs[loot.id] = (state.lootStacks[loot.id] ?? 0) * loot.grabsPerPile;
  }

  const optimalCollection = optimizeLoot(state.playerCount, availableGrabs, secondaryMultiplier);

  let bagUsedUnits = 0;
  let secondaryValue = 0;
  for (const item of optimalCollection) {
    bagUsedUnits += item.weightUnits;
    secondaryValue += item.value;
  }

  const bagCapacityPercent = state.playerCount * 100;
  const bagUsedPercent = (bagUsedUnits / bagCapacityUnits) * 100;
  const bagsUsed = bagUsedUnits / BAG_TOTAL_UNITS;
  const bagsTotal = state.playerCount;
  const isOverCapacity = bagUsedUnits > bagCapacityUnits;

  const grossTotal = primaryValue + secondaryValue;
  const fenceFee = grossTotal * FENCE_FEE;
  const pavelCut = grossTotal * PAVEL_CUT;
  const afterFees = grossTotal - fenceFee - pavelCut;
  const afterFence = grossTotal - fenceFee;
  const afterPavel = afterFees;
  const setupCost = state.firstTime ? SETUP_COST : 0;
  const eliteBonus = state.eliteChallenge ? (state.hardMode ? ELITE_BONUS_HARD : ELITE_BONUS_NORMAL) : 0;
  const officeSafeAmount = state.officeSafe;
  const netTotal = afterPavel - setupCost + eliteBonus + officeSafeAmount;
  const splits = state.playerSplits.length === state.playerCount ? state.playerSplits : getDefaultSplits(state.playerCount);
  const perPlayerBreakdown: PlayerShare[] = splits.map((split) => ({
    split,
    amount: netTotal * (split / 100),
  }));
  const perPlayerNet = netTotal / state.playerCount;

  return {
    primaryValue,
    hardModeBonus,
    secondaryValue,
    secondaryMultiplier,
    grossTotal,
    fenceFee,
    afterFence,
    pavelCut,
    afterPavel,
    setupCost,
    eliteBonus,
    officeSafeAmount,
    netTotal,
    perPlayerNet,
    perPlayerBreakdown,
    bagUsedUnits,
    bagCapacityUnits,
    bagUsedPercent,
    bagCapacityPercent,
    bagsUsed,
    bagsTotal,
    isOverCapacity,
    optimalCollection,
  };
}

export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rounded);
}
