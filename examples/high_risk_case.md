# High Risk Case

## Input

```json
{
  "relationship_stage": "已确认关系",
  "user_goal": "判断是否被 PUA",
  "evidence_type": "长期相处模式",
  "raw_content": "在一起三个月，他经常说你要是爱我就应该听我的，不准穿短裙，不准和异性朋友吃饭，出去必须报备定位。我一拒绝他就说都是我的错，说我太敏感。有次吵架后他消失两天，回来又让我道歉。",
  "tone_preference": "温柔提醒",
  "output_format": "完整鉴定报告"
}
```

## Expected Direction

- 应识别控制型、情绪勒索型、冷暴力型。
- 风险等级应为高或极高。
- 建议优先保护边界和安全。
- 不应诊断人格障碍。

