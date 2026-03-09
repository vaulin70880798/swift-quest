type SwiftRuntimeValue = string | number | boolean | null;

interface RuntimeVariable {
  mutable: boolean;
  value: SwiftRuntimeValue;
}

interface RunResult {
  output: string;
  error?: string;
}

function stripInlineComment(line: string): string {
  let inString = false;
  let escaped = false;

  for (let index = 0; index < line.length - 1; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\\" && !escaped) {
      escaped = true;
      continue;
    }

    if (char === "\"" && !escaped) {
      inString = !inString;
    }

    if (!inString && char === "/" && next === "/") {
      return line.slice(0, index).trim();
    }

    escaped = false;
  }

  return line.trim();
}

function toJsLiteral(value: SwiftRuntimeValue): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return "null";
}

function evaluateStringLiteral(
  content: string,
  variables: Record<string, RuntimeVariable>,
): SwiftRuntimeValue {
  const withEscapes = content
    .replace(/\\"/g, "\"")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  return withEscapes.replace(/\\\(([^)]+)\)/g, (_, expr: string) => {
    const result = evaluateExpression(expr, variables);
    return result === null ? "nil" : String(result);
  });
}

function tokenizeExpression(expression: string): string[] {
  const tokenRegex =
    /"(?:\\.|[^"\\])*"|==|!=|>=|<=|\|\||&&|[+\-*/()<>]|[0-9]+(?:\.[0-9]+)?|[A-Za-z_]\w*|nil/g;
  const tokens = expression.match(tokenRegex) ?? [];

  const compactExpression = expression.replace(/\s+/g, "");
  const compactTokens = tokens.join("").replace(/\s+/g, "");
  if (compactExpression !== compactTokens) {
    throw new Error("ביטוי לא נתמך בקונסולה.");
  }

  return tokens;
}

function evaluateExpression(
  expression: string,
  variables: Record<string, RuntimeVariable>,
): SwiftRuntimeValue {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error("ביטוי ריק אינו חוקי.");
  }

  const stringMatch = trimmed.match(/^"(.*)"$/s);
  if (stringMatch) {
    return evaluateStringLiteral(stringMatch[1] ?? "", variables);
  }

  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  if (trimmed === "nil") {
    return null;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (/^[A-Za-z_]\w*$/.test(trimmed)) {
    const variable = variables[trimmed];
    if (!variable) {
      throw new Error(`המשתנה '${trimmed}' לא הוגדר.`);
    }
    return variable.value;
  }

  const tokens = tokenizeExpression(trimmed);
  const jsTokens = tokens.map((token) => {
    if (/^[A-Za-z_]\w*$/.test(token) && token !== "true" && token !== "false" && token !== "nil") {
      const variable = variables[token];
      if (!variable) {
        throw new Error(`המשתנה '${token}' לא הוגדר.`);
      }
      return toJsLiteral(variable.value);
    }
    if (token === "nil") {
      return "null";
    }
    return token;
  });

  const jsExpression = jsTokens.join(" ");
  try {
    // Safe enough for this local learning sandbox: tokens are restricted.
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${jsExpression});`)();
    if (typeof result === "string" || typeof result === "number" || typeof result === "boolean" || result === null) {
      return result;
    }
    return String(result);
  } catch {
    throw new Error("לא ניתן לחשב את הביטוי הזה בקונסולה.");
  }
}

function parseDeclaration(
  line: string,
  variables: Record<string, RuntimeVariable>,
): void {
  const declarationMatch = line.match(
    /^(let|var)\s+([A-Za-z_]\w*)(?:\s*:\s*[A-Za-z_][\w<>?]*)?\s*=\s*(.+)$/s,
  );
  if (!declarationMatch) {
    throw new Error("תחביר ההצהרה לא תקין.");
  }

  const keyword = declarationMatch[1];
  const name = declarationMatch[2];
  const expression = declarationMatch[3] ?? "";
  const value = evaluateExpression(expression, variables);

  variables[name] = {
    mutable: keyword === "var",
    value,
  };
}

function parseAssignment(
  line: string,
  variables: Record<string, RuntimeVariable>,
): boolean {
  const compoundMatch = line.match(/^([A-Za-z_]\w*)\s*([+\-*/])=\s*(.+)$/s);
  if (compoundMatch) {
    const variableName = compoundMatch[1];
    const operator = compoundMatch[2];
    const expression = compoundMatch[3] ?? "";
    const variable = variables[variableName];
    if (!variable) {
      throw new Error(`המשתנה '${variableName}' לא הוגדר.`);
    }
    if (!variable.mutable) {
      throw new Error(`אי אפשר לשנות let: '${variableName}'.`);
    }

    const rightValue = evaluateExpression(expression, variables);
    const leftValue = variable.value;
    const jsExpression = `${toJsLiteral(leftValue)} ${operator} ${toJsLiteral(rightValue)}`;
    try {
      // eslint-disable-next-line no-new-func
      const next = Function(`"use strict"; return (${jsExpression});`)();
      variable.value = next as SwiftRuntimeValue;
    } catch {
      throw new Error("אי אפשר לחשב את פעולת ה-assignment הזו.");
    }
    return true;
  }

  const assignmentMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/s);
  if (!assignmentMatch) {
    return false;
  }

  const variableName = assignmentMatch[1];
  const expression = assignmentMatch[2] ?? "";
  const variable = variables[variableName];
  if (!variable) {
    throw new Error(`המשתנה '${variableName}' לא הוגדר.`);
  }
  if (!variable.mutable) {
    throw new Error(`אי אפשר לשנות let: '${variableName}'.`);
  }

  variable.value = evaluateExpression(expression, variables);
  return true;
}

export function runSwiftConsoleProgram(sourceCode: string): RunResult {
  const lines = sourceCode.split("\n");
  const variables: Record<string, RuntimeVariable> = {};
  const outputLines: string[] = [];

  try {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const raw = lines[lineIndex] ?? "";
      const line = stripInlineComment(raw);
      if (!line) {
        continue;
      }

      if (line.startsWith("let ") || line.startsWith("var ")) {
        parseDeclaration(line, variables);
        continue;
      }

      const printMatch = line.match(/^print\s*\((.+)\)\s*$/s);
      if (printMatch) {
        const expr = printMatch[1] ?? "";
        const value = evaluateExpression(expr, variables);
        outputLines.push(value === null ? "nil" : String(value));
        continue;
      }

      if (parseAssignment(line, variables)) {
        continue;
      }

      throw new Error(`שורה ${lineIndex + 1}: פקודה לא נתמכת בקונסולה.`);
    }

    return {
      output: outputLines.join("\n"),
    };
  } catch (error) {
    return {
      output: outputLines.join("\n"),
      error: error instanceof Error ? error.message : "שגיאה לא צפויה בהרצת הקוד.",
    };
  }
}

