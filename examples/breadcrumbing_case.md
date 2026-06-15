# Breadcrumbing Case

## Input

```json
{
  "relationship_stage": "暧昧期",
  "user_goal": "判断是否被养鱼",
  "evidence_type": "聊天记录",
  "raw_content": "他每天半夜找我，说想我、喜欢我，还说以后要一起旅行。但我约他周末见面，他每次都说忙、下次、改天。一谈确认关系，他就说顺其自然，别急。",
  "tone_preference": "犀利吐槽",
  "output_format": "分享卡片"
}
```

## Expected Direction

- 应识别嘴甜行动少型、养鱼型、回避确认型。
- 风险等级应为高。
- 分享卡片应包含「别听他说什么，看他做什么」一类建议。

