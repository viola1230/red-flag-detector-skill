import type { SafetyResult } from "./types.ts";

const privacyViolationPatterns = [
  /查岗|偷拍|偷看|破解|定位|跟踪|蹲守|人肉|挂他|曝光|网暴|报复|羞辱/,
  /登录.*账号|看.*聊天记录|查.*开房|查.*身份证|查.*手机号/
];

const diagnosticPatterns = [
  /人格障碍|精神病|躁郁|抑郁症|自恋型人格|反社会人格|边缘型人格|心理疾病/
];

const safetyEscalationPatterns = [
  /威胁|打我|家暴|强迫|强奸|掐|勒|恐吓|跟踪|堵门|拿刀|自杀|杀了|不让我走|囚禁/
];

export function runSafetyFilter(content: string): SafetyResult {
  const warnings: string[] = [];
  const escalations: string[] = [];
  let blocked = false;

  if (privacyViolationPatterns.some((pattern) => pattern.test(content))) {
    warnings.push("不要跟踪、查岗、偷拍、破解账号、公开曝光或报复对方。");
    blocked = /破解|偷拍|人肉|曝光|网暴|报复/.test(content);
  }

  if (diagnosticPatterns.some((pattern) => pattern.test(content))) {
    warnings.push("不要做医学、心理疾病或人格障碍诊断，只能描述具体行为和关系风险。");
  }

  if (safetyEscalationPatterns.some((pattern) => pattern.test(content))) {
    escalations.push("材料中出现威胁、暴力、强迫或严重控制信号。请优先保护自身安全，联系可信任的人、当地紧急服务或专业机构。");
  }

  return {
    safe: !blocked,
    blocked,
    warnings,
    escalations,
    sanitizedContent: sanitizePrivateInfo(content)
  };
}

export function sanitizePrivateInfo(content: string): string {
  return content
    .replace(/1[3-9]\d{9}/g, "[手机号已隐藏]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[邮箱已隐藏]")
    .replace(/微信(?:号)?[:：]?\s?[a-zA-Z0-9_-]{5,}/g, "微信号：[已隐藏]")
    .replace(/身份证(?:号)?[:：]?\s?\d{6,18}[\dXx]?/g, "身份证号：[已隐藏]");
}
