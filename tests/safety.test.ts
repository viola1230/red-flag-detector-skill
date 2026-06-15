import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runSafetyFilter, sanitizePrivateInfo } from "../src/safetyFilter.ts";

describe("safetyFilter", () => {
  it("warns and blocks revenge or privacy-violating requests", () => {
    const result = runSafetyFilter("我想破解他的账号，把聊天记录曝光到网上报复他。");

    assert.equal(result.safe, false);
    assert.equal(result.blocked, true);
    assert.ok(result.warnings.some((warning) => warning.includes("不要跟踪")));
  });

  it("escalates violence and coercion risks", () => {
    const result = runSafetyFilter("他威胁我，不让我走，还说要堵门。");

    assert.equal(result.blocked, false);
    assert.ok(result.escalations.length > 0);
    assert.ok(result.escalations[0].includes("优先保护自身安全"));
  });

  it("sanitizes private identifiers", () => {
    const sanitized = sanitizePrivateInfo("手机号13812345678，微信号 abcdef12345，邮箱 test@example.com");

    assert.ok(sanitized.includes("[手机号已隐藏]"));
    assert.ok(sanitized.includes("微信号：[已隐藏]"));
    assert.ok(sanitized.includes("[邮箱已隐藏]"));
  });
});
