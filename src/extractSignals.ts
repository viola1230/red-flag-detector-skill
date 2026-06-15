import type { DetectorInput, ExtractedSignals, RedFlag, RiskLabel } from "./types.ts";
import { classifyRelationship } from "./classifyRelationship.ts";
import { runSafetyFilter } from "./safetyFilter.ts";

interface Rule {
  label: RiskLabel;
  dimension: RedFlag["dimension"];
  severity: RedFlag["severity"];
  patterns: RegExp[];
  evidence: string;
}

const redFlagRules: Rule[] = [
  {
    label: "嘴甜行动少型",
    dimension: "consistency",
    severity: 4,
    patterns: [/喜欢你|想你|宝贝|以后.*(结婚|在一起)|承诺|画饼/, /忙|没空|下次|改天|不见|约不上|从不.*见面/],
    evidence: "高频表达喜欢或未来承诺，但低频实际付出或见面安排"
  },
  {
    label: "养鱼型",
    dimension: "availability",
    severity: 4,
    patterns: [/深夜|半夜|凌晨|无聊才|忽冷忽热|失联.*出现|只在.*晚上/, /不确认|顺其自然|别急|暧昧/],
    evidence: "长期暧昧不确认关系，只在特定空档或深夜出现"
  },
  {
    label: "回避确认型",
    dimension: "responsibility",
    severity: 3,
    patterns: [/一谈.*关系|确认关系|名分|未来/, /转移话题|沉默|消失|不回复|逃避|顺其自然/],
    evidence: "一谈关系确认就转移话题，冲突后回避沟通"
  },
  {
    label: "控制型",
    dimension: "boundaryRespect",
    severity: 5,
    patterns: [/不准|必须|报备|定位|查岗|穿衣|裙子|异性朋友|控制|限制/, /去哪|和谁|拍照证明|定位|报备/],
    evidence: "干涉穿衣、社交、行踪，要求过度报备或证明"
  },
  {
    label: "情绪勒索型",
    dimension: "emotionalManipulation",
    severity: 5,
    patterns: [/你要是爱我|如果你爱我|都是你的错|你太敏感|你有病|没人会要你|不这样就是不爱/],
    evidence: "使用内疚、贬低、反向指责或爱意测试制造压力"
  },
  {
    label: "隐瞒关系型",
    dimension: "transparency",
    severity: 4,
    patterns: [/不公开|朋友圈不发|手机.*不给看|前任|已婚|有对象|隐瞒|不能让.*知道|边界不清/],
    evidence: "不公开关系、手机高度避讳、前任或社交边界不清"
  },
  {
    label: "冷暴力型",
    dimension: "emotionalManipulation",
    severity: 4,
    patterns: [/已读不回|冷暴力|消失|失联|不理我|沉默惩罚|拉黑|断联/],
    evidence: "通过消失、已读不回或沉默惩罚处理冲突"
  }
];

const greenFlagPatterns: Array<[RegExp, string]> = [
  [/道歉|解释清楚|复盘|愿意沟通/, "愿意沟通和修复"],
  [/尊重|可以拒绝|不勉强|按你的节奏/, "尊重边界和节奏"],
  [/确定时间|安排见面|兑现|说到做到/, "有明确行动兑现"],
  [/公开|介绍朋友|介绍家人|边界清楚/, "关系透明度较高"]
];

export function extractSignals(input: DetectorInput): ExtractedSignals {
  const content = input.raw_content.trim();
  const safety = runSafetyFilter(content);
  const relationshipStage = classifyRelationship(input);
  const redFlags = redFlagRules
    .filter((rule) => rule.patterns.every((pattern) => pattern.test(content)))
    .map<RedFlag>((rule) => ({
      type: rule.label,
      evidence: rule.evidence,
      severity: rule.severity,
      dimension: rule.dimension
    }));

  const greenFlags = greenFlagPatterns
    .filter(([pattern]) => pattern.test(content))
    .map(([, signal]) => signal);
  const evidenceStrength = getEvidenceStrength(input, redFlags.length);

  if (redFlags.length === 0 && greenFlags.length === 0) {
    redFlags.push({
      type: "正常但沟通差型",
      evidence: "材料中未出现强红旗，更像沟通节奏、期待管理或信息不足问题",
      severity: 2,
      dimension: "consistency"
    });
  }

  return {
    relationshipStage,
    keyEvents: splitSentences(content).slice(0, 6),
    counterpartyBehaviors: collectMatches(content, [
      /不回复|消失|约不上|转移话题|不公开|要求报备|贬低|道歉|安排见面/g
    ]),
    userFeelings: collectMatches(content, [/难受|焦虑|不安|委屈|上头|困惑|害怕|被消耗/g]),
    observedPatterns: redFlags.map((flag) => flag.evidence),
    directQuotes: extractQuotes(content),
    evidenceStrength,
    missingInformation: getMissingInformation(input),
    redFlags,
    greenFlags,
    safetyConcerns: safety.escalations
  };
}

function splitSentences(content: string): string[] {
  return content
    .split(/[。！？!?;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectMatches(content: string, patterns: RegExp[]): string[] {
  const matches = new Set<string>();
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      matches.add(match[0]);
    }
  }
  return Array.from(matches);
}

function extractQuotes(content: string): string[] {
  const quoted = Array.from(content.matchAll(/[“"']([^“”"']{2,80})[”"']/g)).map((match) => match[1]);
  return quoted.slice(0, 8);
}

function getEvidenceStrength(input: DetectorInput, redFlagCount: number): ExtractedSignals["evidenceStrength"] {
  const length = input.raw_content.length;
  if (input.evidence_type === "长期相处模式" || input.evidence_type === "多段混合材料" || redFlagCount >= 3 || length > 800) {
    return "强";
  }
  if (redFlagCount >= 1 || length > 200) return "中";
  return "弱";
}

function getMissingInformation(input: DetectorInput): string[] {
  const missing: string[] = [];
  if (input.raw_content.length < 80) missing.push("材料较短，建议补充时间跨度和具体原话");
  if (!/多久|一个月|半年|三周|每天|每次|长期|最近/.test(input.raw_content)) missing.push("缺少行为持续时间");
  if (!/我说|我问|我拒绝|边界|沟通/.test(input.raw_content)) missing.push("缺少用户表达边界后的对方反应");
  return missing;
}
