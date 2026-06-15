import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractSignals } from "../src/extractSignals.ts";
import type { DetectorInput } from "../src/types.ts";

function input(raw_content: string): DetectorInput {
  return {
    relationship_stage: "暧昧期",
    user_goal: "判断是否被养鱼",
    evidence_type: "聊天记录",
    raw_content,
    tone_preference: "犀利吐槽",
    output_format: "完整鉴定报告"
  };
}

describe("extractSignals", () => {
  it("extracts breadcrumbing labels from sweet words without action", () => {
    const result = extractSignals(input("他每天半夜找我，说想你、喜欢你，但我约见面他总说忙、下次、改天。一谈确认关系，他就说顺其自然，别急。"));
    const labels = result.redFlags.map((flag) => flag.type);

    assert.ok(labels.includes("嘴甜行动少型"));
    assert.ok(labels.includes("养鱼型"));
    assert.ok(labels.includes("回避确认型"));
  });

  it("extracts control and emotional blackmail", () => {
    const result = extractSignals(input("他说你要是爱我就应该听我的，不准穿短裙，去哪都必须报备定位。我拒绝后他说都是我的错。"));
    const labels = result.redFlags.map((flag) => flag.type);

    assert.ok(labels.includes("控制型"));
    assert.ok(labels.includes("情绪勒索型"));
  });

  it("keeps weak evidence as weak when content is short", () => {
    const result = extractSignals(input("他今天没回我。"));

    assert.equal(result.evidenceStrength, "弱");
    assert.ok(result.missingInformation.length > 0);
  });
});
