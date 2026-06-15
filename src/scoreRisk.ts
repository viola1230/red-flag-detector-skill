import type { ExtractedSignals, RiskLabel, RiskLevel, RiskScore, ScoreBreakdown } from "./types.ts";

const weights: Record<keyof ScoreBreakdown, number> = {
  consistency: 0.25,
  availability: 0.2,
  boundaryRespect: 0.2,
  transparency: 0.15,
  emotionalManipulation: 0.15,
  responsibility: 0.05
};

const labelDimensions: Record<RiskLabel, keyof ScoreBreakdown> = {
  嘴甜行动少型: "consistency",
  养鱼型: "availability",
  回避确认型: "responsibility",
  控制型: "boundaryRespect",
  情绪勒索型: "emotionalManipulation",
  隐瞒关系型: "transparency",
  冷暴力型: "emotionalManipulation",
  正常但沟通差型: "consistency"
};

export function scoreRisk(signals: Pick<ExtractedSignals, "redFlags" | "greenFlags" | "evidenceStrength" | "missingInformation">): RiskScore {
  const breakdown: ScoreBreakdown = {
    consistency: 0,
    availability: 0,
    boundaryRespect: 0,
    transparency: 0,
    emotionalManipulation: 0,
    responsibility: 0
  };

  const labels = new Set<RiskLabel>();
  const rationale: string[] = [];

  for (const flag of signals.redFlags) {
    labels.add(flag.type);
    const dimension = flag.dimension ?? labelDimensions[flag.type];
    const severityScore = flag.severity * 20;
    breakdown[dimension] = Math.max(breakdown[dimension], severityScore);
    rationale.push(`${flag.type}: ${flag.evidence}`);
  }

  for (const greenFlag of signals.greenFlags) {
    if (/沟通|修复/.test(greenFlag)) breakdown.responsibility = Math.max(0, breakdown.responsibility - 15);
    if (/尊重/.test(greenFlag)) breakdown.boundaryRespect = Math.max(0, breakdown.boundaryRespect - 20);
    if (/兑现|行动/.test(greenFlag)) breakdown.consistency = Math.max(0, breakdown.consistency - 15);
    if (/透明/.test(greenFlag)) breakdown.transparency = Math.max(0, breakdown.transparency - 15);
  }

  const weightedTotal = Object.entries(weights).reduce((sum, [dimension, weight]) => {
    return sum + breakdown[dimension as keyof ScoreBreakdown] * weight;
  }, 0);
  const patternDensityBonus = Math.min(20, Math.max(0, signals.redFlags.length - 1) * 7.5);
  const total = clamp(Math.round(weightedTotal + patternDensityBonus));

  if (labels.size === 0) labels.add("正常但沟通差型");
  if (total < 30 && !signals.redFlags.some((flag) => flag.severity >= 4)) {
    labels.clear();
    labels.add("正常但沟通差型");
  }

  const confidenceScore = getConfidenceScore(signals, total);

  return {
    total,
    riskLevel: getRiskLevel(total),
    labels: Array.from(labels),
    confidenceScore,
    breakdown,
    rationale
  };
}

export function getRiskLevel(total: number): RiskLevel {
  if (total >= 80) return "极高";
  if (total >= 55) return "高";
  if (total >= 30) return "中";
  return "低";
}

function getConfidenceScore(
  signals: Pick<ExtractedSignals, "redFlags" | "greenFlags" | "evidenceStrength" | "missingInformation">,
  total: number
): number {
  const evidenceBase = signals.evidenceStrength === "强" ? 78 : signals.evidenceStrength === "中" ? 62 : 45;
  const flagBonus = Math.min(15, signals.redFlags.length * 4);
  const greenAdjustment = signals.greenFlags.length > 0 && total > 55 ? -4 : 0;
  const missingPenalty = Math.min(18, signals.missingInformation.length * 6);
  return clamp(Math.round(evidenceBase + flagBonus + greenAdjustment - missingPenalty));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
