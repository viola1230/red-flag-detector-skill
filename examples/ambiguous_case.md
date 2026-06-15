# Ambiguous Case

## Input

```json
{
  "relationship_stage": "刚认识",
  "user_goal": "判断是否靠谱",
  "evidence_type": "事件描述",
  "raw_content": "我们相亲认识两周。他每天会聊天，但最近两次约饭都说工作忙改天。我有点不安，不知道是不是没兴趣。他没有说过喜欢我，也没有越界，只是节奏很慢。",
  "tone_preference": "理性分析",
  "output_format": "简短结论"
}
```

## Expected Direction

- 不应直接判定为渣男。
- 风险等级应偏低或中。
- 应提示证据不足，需要观察是否继续主动安排见面。
- 可能标签：正常但沟通差型。

