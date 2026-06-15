export type RelationshipStage = "刚认识" | "暧昧期" | "已确认关系" | "分手后拉扯" | "复合观察期";

export type UserGoal =
  | "判断是否靠谱"
  | "判断是否被养鱼"
  | "判断是否被 PUA"
  | "判断是否值得继续"
  | "生成可分享报告"
  | "生成下一步话术";

export type EvidenceType = "聊天记录" | "事件描述" | "约会复盘" | "长期相处模式" | "多段混合材料";

export type TonePreference = "犀利吐槽" | "理性分析" | "闺蜜口吻" | "温柔提醒" | "报告体";

export type OutputFormat = "简短结论" | "完整鉴定报告" | "分享卡片" | "后续应对策略" | "聊天回复话术";

export type RiskLevel = "低" | "中" | "高" | "极高";

export type RiskLabel =
  | "嘴甜行动少型"
  | "养鱼型"
  | "回避确认型"
  | "控制型"
  | "情绪勒索型"
  | "隐瞒关系型"
  | "冷暴力型"
  | "正常但沟通差型";

export type ScoreDimension =
  | "consistency"
  | "availability"
  | "boundaryRespect"
  | "transparency"
  | "emotionalManipulation"
  | "responsibility";

export interface DetectorInput {
  relationship_stage: RelationshipStage;
  user_goal: UserGoal;
  evidence_type: EvidenceType;
  raw_content: string;
  tone_preference: TonePreference;
  output_format: OutputFormat;
}

export interface RedFlag {
  type: RiskLabel;
  evidence: string;
  severity: 1 | 2 | 3 | 4 | 5;
  dimension?: ScoreDimension;
}

export interface ExtractedSignals {
  relationshipStage: RelationshipStage;
  keyEvents: string[];
  counterpartyBehaviors: string[];
  userFeelings: string[];
  observedPatterns: string[];
  directQuotes: string[];
  evidenceStrength: "弱" | "中" | "强";
  missingInformation: string[];
  redFlags: RedFlag[];
  greenFlags: string[];
  safetyConcerns: string[];
}

export interface ScoreBreakdown {
  consistency: number;
  availability: number;
  boundaryRespect: number;
  transparency: number;
  emotionalManipulation: number;
  responsibility: number;
}

export interface RiskScore {
  total: number;
  riskLevel: RiskLevel;
  labels: RiskLabel[];
  confidenceScore: number;
  breakdown: ScoreBreakdown;
  rationale: string[];
}

export interface ShareableReport {
  title: string;
  short_summary: string;
  dramatic_score: string;
  sister_version: string;
}

export interface DetectorOutput {
  verdict: string;
  risk_level: RiskLevel;
  label: RiskLabel[];
  confidence_score: number;
  red_flags: RedFlag[];
  green_flags: string[];
  core_pattern: string;
  possible_motivation: string;
  user_risk: string;
  advice: string[];
  boundary_script: string;
  observation_period: string;
  shareable_report: ShareableReport;
}

export interface GeneratedReport {
  output: DetectorOutput;
  markdown: string;
}

export interface SafetyResult {
  safe: boolean;
  blocked: boolean;
  warnings: string[];
  escalations: string[];
  sanitizedContent: string;
}

