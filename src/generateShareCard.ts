import type { DetectorInput, DetectorOutput, RiskScore, ShareableReport } from "./types.ts";

export function generateShareCard(input: DetectorInput, score: RiskScore, partial?: Partial<DetectorOutput>): ShareableReport {
  const labels = score.labels.length > 0 ? score.labels.join(" + ") : "正常但沟通差型";
  const title = getTitle(input, score);
  const shortSummary = partial?.core_pattern ?? getShortSummary(score);

  return {
    title,
    short_summary: shortSummary,
    dramatic_score: `渣男嫌疑指数 ${score.total}/100`,
    sister_version: [
      "《渣男鉴定报告》",
      "",
      `鉴定对象：某位不愿透露姓名的${input.relationship_stage === "已确认关系" ? "恋爱对象" : "暧昧对象"}`,
      `风险等级：${score.riskLevel}风险`,
      `类型标签：${labels}`,
      `核心罪证：${getCoreEvidence(score)}`,
      `姐妹建议：${getSisterAdvice(score)}`,
      `今日判词：${getVerdictLine(score)}`
    ].join("\n")
  };
}

function getTitle(input: DetectorInput, score: RiskScore): string {
  if (score.riskLevel === "极高") return "恋爱脑暂停：这不是心动，是红色警报";
  if (score.labels.includes("嘴甜行动少型")) return "他说喜欢你，但行动一直缺席";
  if (score.labels.includes("养鱼型")) return "暧昧对象红旗体检：你可能在鱼塘边";
  if (input.output_format === "分享卡片") return "渣男鉴定报告：证据说话版";
  return "暧昧关系风险体检报告";
}

function getShortSummary(score: RiskScore): string {
  if (score.riskLevel === "低") return "目前没有明显强红旗，更像沟通和节奏问题。";
  if (score.riskLevel === "中") return "已经出现消耗信号，建议先观察行动变化。";
  if (score.riskLevel === "高") return "红旗不止一面，别只听他说什么。";
  return "风险信号密集，优先保护自己和边界。";
}

function getCoreEvidence(score: RiskScore): string {
  const first = score.rationale[0];
  return first ? first.replace(/^[^:]+:\s*/, "") : "证据不足，先观察他的稳定行动";
}

function getSisterAdvice(score: RiskScore): string {
  if (score.riskLevel === "低") return "先别急着定性，把需求说清楚再看回应";
  if (score.riskLevel === "中") return "少脑补，多看行动，给观察期但别加码投入";
  return "别听他说什么，看他做什么";
}

function getVerdictLine(score: RiskScore): string {
  if (score.labels.includes("回避确认型")) return "不是不会爱，是不想负责";
  if (score.labels.includes("嘴甜行动少型")) return "嘴上有糖，行动没粮";
  if (score.labels.includes("控制型")) return "爱不是管理权限";
  if (score.labels.includes("情绪勒索型")) return "让你内疚的人，未必真的爱你";
  return "先把期待收回来，让证据往前走";
}
