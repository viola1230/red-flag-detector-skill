# red-flag-detector-skill

「渣男鉴定器」是一个面向 C 端用户的轻娱乐 + 关系分析 Skill。用户输入聊天记录、约会复盘、相处细节或长期关系描述后，系统提取事实、识别关系风险信号，输出结构化的「渣男鉴定报告」和适合小红书、朋友圈、闺蜜群传播的分享文案。

## Safety First

本项目不做医学诊断、心理疾病诊断、人格障碍诊断，也不鼓励网暴、跟踪、查岗、偷拍、破解账号、报复或侵犯隐私。所有判断必须基于用户提供的信息；证据不足时应明确说明「需要继续观察」，不能凭单一事件直接定性。

遇到威胁、暴力、强迫、严重控制、跟踪骚扰等情况，应优先建议用户保护自身安全，联系可信任的人、当地紧急服务或专业机构。

## Project Structure

```text
red-flag-detector-skill/
├── README.md
├── SKILL.md
├── prompts/
├── schemas/
├── src/
├── examples/
└── tests/
```

## Install

```bash
cd red-flag-detector-skill
npm install
```

本仓库没有强绑定运行框架。源码是 TypeScript 纯函数，适合接入 Claude/Codex Skill、Node 服务、前端工具或自动化测试。

## Usage

```ts
import { extractSignals } from "./src/extractSignals.ts";
import { scoreRisk } from "./src/scoreRisk.ts";
import { generateReport } from "./src/generateReport.ts";
import type { DetectorInput } from "./src/types.ts";

const input: DetectorInput = {
  relationship_stage: "暧昧期",
  user_goal: "判断是否被养鱼",
  evidence_type: "聊天记录",
  raw_content: "他说很喜欢我，但每次约见面都说忙。基本只在晚上十一点后找我聊天。",
  tone_preference: "闺蜜口吻",
  output_format: "完整鉴定报告"
};

const extraction = extractSignals(input);
const score = scoreRisk(extraction.signals);
const report = generateReport(input, extraction, score);

console.log(report.markdown);
```

## Input Example

```json
{
  "relationship_stage": "暧昧期",
  "user_goal": "判断是否被养鱼",
  "evidence_type": "聊天记录",
  "raw_content": "他说很喜欢我，但从不主动安排见面。只有深夜无聊时找我，一聊关系就说顺其自然。",
  "tone_preference": "犀利吐槽",
  "output_format": "完整鉴定报告"
}
```

## Output Example

```json
{
  "verdict": "目前更像高风险暧昧消耗局，建议降低投入并设置观察边界。",
  "risk_level": "高",
  "label": ["嘴甜行动少型", "养鱼型", "回避确认型"],
  "confidence_score": 78,
  "red_flags": [
    {
      "type": "嘴甜行动少型",
      "evidence": "频繁表达喜欢，但没有确定见面安排",
      "severity": 4
    }
  ],
  "green_flags": [],
  "core_pattern": "语言升温快，行动兑现慢，关系确认被持续延后。",
  "possible_motivation": "可能享受暧昧陪伴或暂时不想承担关系责任，但不能据此断言真实动机。",
  "user_risk": "继续高投入可能带来情绪消耗、期待落空和时间成本。",
  "advice": ["降低主动频率", "提出一次明确见面或关系边界", "观察 2-3 周行动是否变化"],
  "boundary_script": "我喜欢清楚和稳定的相处。如果你只是想偶尔聊天，我会把期待收回来。",
  "observation_period": "2-3 周",
  "shareable_report": {
    "title": "暧昧对象红旗体检：嘴甜但不落地",
    "short_summary": "他说喜欢你，但行动一直缺席。",
    "dramatic_score": "渣男嫌疑指数 78/100",
    "sister_version": "姐妹，别听他说多上头，先看他有没有把你放进行程表。"
  }
}
```

## Scoring Model

Red Flag Scoring Matrix:

- 一致性：25%
- 可得性：20%
- 尊重边界：20%
- 透明度：15%
- 情绪操控：15%
- 责任感：5%

分数越高，风险越高。输出必须同时给出正向信号、证据不足说明和安全提示，避免把娱乐化表达变成绝对化审判。
