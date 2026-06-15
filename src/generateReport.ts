import type { DetectorInput, DetectorOutput, ExtractedSignals, GeneratedReport, RiskScore } from "./types.ts";
import { generateShareCard } from "./generateShareCard.ts";

export function generateReport(input: DetectorInput, extraction: ExtractedSignals, score: RiskScore): GeneratedReport {
  const output = buildOutput(input, extraction, score);
  const markdown = renderMarkdown(output, extraction);
  return { output, markdown };
}

function buildOutput(input: DetectorInput, extraction: ExtractedSignals, score: RiskScore): DetectorOutput {
  const corePattern = getCorePattern(score);
  const partial = {
    core_pattern: corePattern
  };

  return {
    verdict: getVerdict(score),
    risk_level: score.riskLevel,
    label: score.labels,
    confidence_score: score.confidenceScore,
    red_flags: extraction.redFlags,
    green_flags: extraction.greenFlags,
    core_pattern: corePattern,
    possible_motivation: getPossibleMotivation(score),
    user_risk: getUserRisk(score),
    advice: getAdvice(score),
    boundary_script: getBoundaryScript(score),
    observation_period: getObservationPeriod(score),
    shareable_report: generateShareCard(input, score, partial)
  };
}

function renderMarkdown(output: DetectorOutput, extraction: ExtractedSignals): string {
  const redFlags = output.red_flags.length
    ? output.red_flags.map((flag) => `- ${flag.type}：${flag.evidence}`).join("\n")
    : "- 暂未发现明确红旗。";
  const greenFlags = output.green_flags.length
    ? output.green_flags.map((flag) => `- ${flag}`).join("\n")
    : "- 目前材料里正向信号不明显，也可能是用户没有提供。";
  const advice = output.advice.map((item) => `- ${item}`).join("\n");
  const safety = [
    "以上分析只基于你提供的信息，不构成医学、心理或法律判断。",
    "不要跟踪、查岗、偷拍、破解账号或公开曝光对方。",
    ...extraction.safetyConcerns
  ].join("\n\n");

  return `# 渣男鉴定报告

## 一句话结论

${output.verdict}

## 风险等级

${output.risk_level}风险，置信度 ${output.confidence_score}/100。

## 类型标签

${output.label.join(" + ")}

## 关键红旗

${redFlags}

## 可能不是渣的部分

${greenFlags}

证据强度：${extraction.evidenceStrength}。${extraction.missingInformation.length ? `还缺少：${extraction.missingInformation.join("、")}。` : "当前材料相对完整。"}

## 关系核心问题

${output.core_pattern}

可能动机：${output.possible_motivation}

继续投入风险：${output.user_risk}

## 你现在最该做什么

${advice}

## 可复制话术

${output.boundary_script}

## 建议观察周期

${output.observation_period}

## 姐妹分享版总结

${output.shareable_report.sister_version}

## 风险提示

${safety}
`;
}

function getVerdict(score: RiskScore): string {
  if (score.riskLevel === "低") return "目前没有明显强红旗，更像沟通节奏或信息不足问题，先别急着给对方定性。";
  if (score.riskLevel === "中") return "这段关系已经出现需要警惕的消耗信号，建议降低投入，用行动观察替代脑补。";
  if (score.riskLevel === "高") return "目前更像高风险关系模式：话术或暧昧不少，但稳定行动、边界或责任感不足。";
  return "当前风险信号密集，优先保护自己的安全、边界和情绪，不建议继续加码投入。";
}

function getCorePattern(score: RiskScore): string {
  if (score.labels.includes("嘴甜行动少型")) return "语言升温快，行动兑现慢；用户在投入期待，对方保留弹性。";
  if (score.labels.includes("养鱼型")) return "对方提供间歇性情绪价值，但不提供稳定承诺和清晰关系位置。";
  if (score.labels.includes("控制型")) return "对方把亲密关系理解成管理权限，边界尊重不足。";
  if (score.labels.includes("情绪勒索型")) return "对方用内疚、贬低或反向指责推动用户让步。";
  if (score.labels.includes("正常但沟通差型")) return "核心问题更像沟通方式、期待管理和节奏不一致。";
  return "关系中出现承诺、投入、透明度或责任感不匹配。";
}

function getPossibleMotivation(score: RiskScore): string {
  if (score.labels.includes("养鱼型")) return "可能享受暧昧陪伴或暂时不想承担关系责任，但不能据此断言真实动机。";
  if (score.labels.includes("回避确认型")) return "可能害怕承诺、尚未想清楚或在保留选择，但需要通过后续行动验证。";
  if (score.labels.includes("控制型")) return "可能有强控制需求或安全感不足，但这不能成为侵犯边界的理由。";
  return "可能是沟通能力不足、节奏不一致或投入意愿有限，真实动机需要更多稳定证据。";
}

function getUserRisk(score: RiskScore): string {
  if (score.riskLevel === "低") return "主要风险是误会扩大、过早定性或双方期待没有说清。";
  if (score.riskLevel === "中") return "继续高投入可能带来情绪消耗、期待落空和时间成本。";
  if (score.riskLevel === "高") return "继续投入可能陷入反复期待、失望、复盘和自我怀疑。";
  return "继续接触可能影响人身安全、情绪稳定、社交边界或现实生活秩序。";
}

function getAdvice(score: RiskScore): string[] {
  if (score.riskLevel === "低") {
    return ["先补充事实，不急着定性。", "把自己的需求说清楚，观察对方是否理解并回应。", "给 1-2 周观察期，看行动是否稳定。"];
  }
  if (score.riskLevel === "中") {
    return ["降低主动频率，不再用脑补替对方补行动。", "提出一个具体需求，例如确定见面时间或关系边界。", "观察 2-3 周，看对方是否用行动修复。"];
  }
  if (score.riskLevel === "高") {
    return ["停止加码投入，把关系从情绪上头拉回现实观察。", "一次性说清边界和期待，不进入反复拉扯。", "如果对方继续回避、消失或操控，建议退出。"];
  }
  return ["优先保护自身安全和隐私，减少单独接触。", "联系可信任的人同步情况，必要时寻求专业机构帮助。", "不要刺激、报复或公开曝光，保留必要证据用于保护自己。"];
}

function getBoundaryScript(score: RiskScore): string {
  if (score.riskLevel === "低") return "我想把节奏和期待说清楚。你如果也想继续了解，我们可以约个具体时间好好聊。";
  if (score.riskLevel === "中") return "我喜欢清楚、稳定的相处。如果你只是偶尔想聊天，我会把期待收回来；如果你也想认真发展，我们这周定个具体安排。";
  if (score.riskLevel === "高") return "我不想继续停在只有暧昧没有行动的状态。你可以想清楚再回应，但我不会继续无限等待。";
  return "我需要把自己的安全和边界放在第一位。接下来请不要再用威胁、控制或强迫的方式联系我。";
}

function getObservationPeriod(score: RiskScore): string {
  if (score.riskLevel === "低") return "1-2 周";
  if (score.riskLevel === "中") return "2-3 周";
  if (score.riskLevel === "高") return "最多 2 周，重点看行动而不是解释";
  return "不建议继续观察，优先安全退出";
}
