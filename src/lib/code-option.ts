import { QuestionFormat } from "@/lib/types";

const CODE_SYMBOL_REGEX = /[{}()[\]=+*/%<>!?:\\.@;$]/;
const HEBREW_REGEX = /[א-ת]/g;
const LATIN_REGEX = /[A-Za-z]/g;

export function isLikelyCodeOption(option: string): boolean {
  const text = option.trim();
  if (!text) {
    return false;
  }

  if (/^[A-D]$/.test(text)) {
    return false;
  }

  if (text.includes("\n")) {
    return true;
  }

  const hebrewCount = (text.match(HEBREW_REGEX) ?? []).length;
  const latinCount = (text.match(LATIN_REGEX) ?? []).length;

  if (hebrewCount > latinCount * 2 && !CODE_SYMBOL_REGEX.test(text)) {
    return false;
  }

  if (CODE_SYMBOL_REGEX.test(text)) {
    return true;
  }

  if (/^\w+\(.*\)$/.test(text)) {
    return true;
  }

  return false;
}

export function shouldRenderOptionAsCode(
  option: string,
  format: QuestionFormat,
): boolean {
  if (isLikelyCodeOption(option)) {
    return true;
  }

  return format === "complete_code" && !/[א-ת]/.test(option);
}
