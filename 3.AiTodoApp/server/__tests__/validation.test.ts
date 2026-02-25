import { describe, it, expect } from "vitest";
import {
  validateTitle,
  validatePriority,
  validateCategory,
} from "../src/server";

// ─── validateTitle ────────────────────────────────────────────────

describe("validateTitle", () => {
  it("빈 값이면 에러를 반환한다", () => {
    expect(validateTitle("")).toBe("제목을 입력해주세요");
    expect(validateTitle(null)).toBe("제목을 입력해주세요");
    expect(validateTitle(undefined)).toBe("제목을 입력해주세요");
  });

  it("문자열이 아니면 에러를 반환한다", () => {
    expect(validateTitle(123)).toBe("제목을 입력해주세요");
    expect(validateTitle(true)).toBe("제목을 입력해주세요");
  });

  it("공백만 있으면 에러를 반환한다", () => {
    expect(validateTitle("   ")).toBe("제목을 입력해주세요");
  });

  it("200자 초과하면 에러를 반환한다", () => {
    const longTitle = "a".repeat(201);
    expect(validateTitle(longTitle)).toBe("제목은 200자 이하여야 합니다");
  });

  it("정상 제목은 null을 반환한다", () => {
    expect(validateTitle("할일 제목")).toBeNull();
    expect(validateTitle("a")).toBeNull();
    expect(validateTitle("a".repeat(200))).toBeNull();
  });
});

// ─── validatePriority ─────────────────────────────────────────────

describe("validatePriority", () => {
  it("undefined이면 null을 반환한다 (선택적 필드)", () => {
    expect(validatePriority(undefined)).toBeNull();
  });

  it("유효한 값이면 null을 반환한다", () => {
    expect(validatePriority("low")).toBeNull();
    expect(validatePriority("medium")).toBeNull();
    expect(validatePriority("high")).toBeNull();
  });

  it("유효하지 않은 값이면 에러를 반환한다", () => {
    expect(validatePriority("urgent")).toBe(
      "우선순위는 low, medium, high 중 하나여야 합니다"
    );
    expect(validatePriority("")).toBe(
      "우선순위는 low, medium, high 중 하나여야 합니다"
    );
    expect(validatePriority(123)).toBe(
      "우선순위는 low, medium, high 중 하나여야 합니다"
    );
  });
});

// ─── validateCategory ─────────────────────────────────────────────

describe("validateCategory", () => {
  it("undefined이면 null을 반환한다 (선택적 필드)", () => {
    expect(validateCategory(undefined)).toBeNull();
  });

  it("정상 카테고리는 null을 반환한다", () => {
    expect(validateCategory("")).toBeNull();
    expect(validateCategory("학습")).toBeNull();
    expect(validateCategory("a".repeat(50))).toBeNull();
  });

  it("문자열이 아니면 에러를 반환한다", () => {
    expect(validateCategory(123)).toBe("카테고리는 문자열이어야 합니다");
    expect(validateCategory(true)).toBe("카테고리는 문자열이어야 합니다");
  });

  it("50자 초과하면 에러를 반환한다", () => {
    expect(validateCategory("a".repeat(51))).toBe(
      "카테고리는 50자 이하여야 합니다"
    );
  });
});
