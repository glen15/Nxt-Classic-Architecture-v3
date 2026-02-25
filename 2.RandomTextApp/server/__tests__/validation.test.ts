import { describe, it, expect } from "vitest";
import { validateText, validateUsername } from "../src/server";

// ─── validateText ─────────────────────────────────────────────────

describe("validateText", () => {
  it("빈 값이면 에러를 반환한다", () => {
    expect(validateText("")).toBe("텍스트는 필수입니다");
    expect(validateText(null)).toBe("텍스트는 필수입니다");
    expect(validateText(undefined)).toBe("텍스트는 필수입니다");
  });

  it("문자열이 아니면 에러를 반환한다", () => {
    expect(validateText(123)).toBe("텍스트는 필수입니다");
    expect(validateText(true)).toBe("텍스트는 필수입니다");
  });

  it("공백만 있으면 에러를 반환한다", () => {
    expect(validateText("   ")).toBe("텍스트는 필수입니다");
  });

  it("500자 초과하면 에러를 반환한다", () => {
    const longText = "a".repeat(501);
    expect(validateText(longText)).toBe("텍스트는 500자 이하여야 합니다");
  });

  it("정상 텍스트는 null을 반환한다", () => {
    expect(validateText("인생은 짧다")).toBeNull();
    expect(validateText("a")).toBeNull();
    expect(validateText("a".repeat(500))).toBeNull();
  });
});

// ─── validateUsername ─────────────────────────────────────────────

describe("validateUsername", () => {
  it("빈 값이면 에러를 반환한다", () => {
    expect(validateUsername("")).toBe("사용자 이름은 필수입니다");
    expect(validateUsername(null)).toBe("사용자 이름은 필수입니다");
    expect(validateUsername(undefined)).toBe("사용자 이름은 필수입니다");
  });

  it("문자열이 아니면 에러를 반환한다", () => {
    expect(validateUsername(123)).toBe("사용자 이름은 필수입니다");
    expect(validateUsername(true)).toBe("사용자 이름은 필수입니다");
  });

  it("공백만 있으면 에러를 반환한다", () => {
    expect(validateUsername("   ")).toBe("사용자 이름은 필수입니다");
  });

  it("100자 초과하면 에러를 반환한다", () => {
    const longName = "a".repeat(101);
    expect(validateUsername(longName)).toBe(
      "사용자 이름은 100자 이하여야 합니다"
    );
  });

  it("정상 사용자 이름은 null을 반환한다", () => {
    expect(validateUsername("소크라테스")).toBeNull();
    expect(validateUsername("a")).toBeNull();
    expect(validateUsername("a".repeat(100))).toBeNull();
  });
});
