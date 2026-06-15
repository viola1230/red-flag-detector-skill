import type { DetectorInput, RelationshipStage } from "./types.ts";

const stageKeywords: Array<[RelationshipStage, RegExp[]]> = [
  ["分手后拉扯", [/分手|前任|拉黑|复联|断联|拉扯/]],
  ["复合观察期", [/复合|重新开始|再试试|观察期/]],
  ["已确认关系", [/男朋友|女朋友|在一起|确认关系|恋爱中/]],
  ["暧昧期", [/暧昧|喜欢我|表白|约会|上头|养鱼|不确认/]],
  ["刚认识", [/刚认识|第一次见|相亲|加微信|认识不久/]]
];

export function classifyRelationship(input: Pick<DetectorInput, "relationship_stage" | "raw_content">): RelationshipStage {
  if (input.relationship_stage) return input.relationship_stage;

  for (const [stage, patterns] of stageKeywords) {
    if (patterns.some((pattern) => pattern.test(input.raw_content))) {
      return stage;
    }
  }

  return "暧昧期";
}
