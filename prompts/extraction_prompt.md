# Extraction Prompt

从用户输入中提取事实，不要推测、不要补充不存在的信息。

## 输入

- relationship_stage
- user_goal
- evidence_type
- raw_content
- tone_preference
- output_format

## 输出 JSON

```json
{
  "relationship_stage": "",
  "key_events": [],
  "counterparty_behaviors": [],
  "user_feelings": [],
  "observed_patterns": [],
  "direct_quotes": [],
  "evidence_strength": "弱 | 中 | 强",
  "missing_information": []
}
```

## 提取规则

- 聊天记录里的原话放入 `direct_quotes`。
- 多次出现、跨场景出现的行为放入 `observed_patterns`。
- 只有一次的事件放入 `key_events`，不要直接升级为模式。
- 用户没有提供的动机、身份、关系状态，不要编造。
- 如果信息不足，写入 `missing_information`。

