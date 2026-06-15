import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreRisk } from "../src/scoreRisk.ts";
import type { ExtractedSignals } from "../src/types.ts";

function baseSignals(overrides: Partial<ExtractedSignals>): ExtractedSignals {
  return {
    relationshipStage: "暧昧期",
    keyEvents: [],
    counterpartyBehaviors: [],
    userFeelings: [],
    observedPatterns: [],
    directQuotes: [],
    evidenceStrength: "中",
    missingInformation: [],
    redFlags: [],
    greenFlags: [],
    safetyConcerns: [],
    ...overrides
  };
}

describe("scoreRisk", () => {
  it("scores breadcrumbing and avoidance as high risk", () => {
    const score = scoreRisk(baseSignals({
      evidenceStrength: "强",
      redFlags: [
        { type: "嘴甜行动少型", evidence: "说喜欢但不安排见面", severity: 4, dimension: "consistency" },
        { type: "养鱼型", evidence: "只在深夜出现且不确认关系", severity: 4, dimension: "availability" },
        { type: "回避确认型", evidence: "一谈关系就转移话题", severity: 4, dimension: "responsibility" }
      ]
    }));

    assert.equal(score.riskLevel, "高");
    assert.ok(score.total >= 55);
    assert.ok(score.labels.includes("嘴甜行动少型"));
    assert.ok(score.labels.includes("养鱼型"));
  });

  it("keeps normal miscommunication low when green flags exist", () => {
    const score = scoreRisk(baseSignals({
      evidenceStrength: "中",
      redFlags: [
        { type: "正常但沟通差型", evidence: "节奏慢但有解释", severity: 2, dimension: "consistency" }
      ],
      greenFlags: ["愿意沟通和修复", "有明确行动兑现"]
    }));

    assert.equal(score.riskLevel, "低");
    assert.deepEqual(score.labels, ["正常但沟通差型"]);
  });

  it("maps severe control and manipulation to very high risk", () => {
    const score = scoreRisk(baseSignals({
      evidenceStrength: "强",
      redFlags: [
        { type: "控制型", evidence: "要求定位和报备", severity: 5, dimension: "boundaryRespect" },
        { type: "情绪勒索型", evidence: "你要是爱我就应该", severity: 5, dimension: "emotionalManipulation" },
        { type: "隐瞒关系型", evidence: "不公开关系", severity: 5, dimension: "transparency" },
        { type: "嘴甜行动少型", evidence: "承诺不兑现", severity: 5, dimension: "consistency" },
        { type: "冷暴力型", evidence: "冲突后消失并用沉默惩罚", severity: 5, dimension: "availability" }
      ]
    }));

    assert.equal(score.riskLevel, "极高");
    assert.ok(score.total >= 80);
  });
});
