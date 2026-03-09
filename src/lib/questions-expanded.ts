import { worlds } from "@/lib/curriculum";
import { Difficulty, Question, QuestionFormat } from "@/lib/types";

const MIN_QUESTIONS_PER_WORLD = 100;

const FORMAT_ROTATION: QuestionFormat[] = [
  "output_prediction",
  "choose_correct_code",
  "find_bug",
  "complete_code",
  "code_vs_concept",
  "code_comparison",
  "mini_refactor",
  "multiple_choice",
  "output_prediction",
  "choose_correct_code",
];

const DIFFICULTY_ROTATION: Difficulty[] = [
  "easy",
  "easy",
  "medium",
  "medium",
  "hard",
  "medium",
  "hard",
  "easy",
  "medium",
  "hard",
];

const NAMES = ["Noa", "Lia", "Eli", "Maya", "Dana", "Omer"];
const OBJECT_NAMES = ["score", "points", "level", "lives", "coins", "energy"];

type Archetype =
  | "basics"
  | "optional"
  | "function"
  | "flow"
  | "collection"
  | "enum"
  | "struct"
  | "class"
  | "protocol"
  | "closure"
  | "async"
  | "generic"
  | "memory"
  | "networking"
  | "persistence"
  | "tooling"
  | "swiftui"
  | "state";

interface ArchetypePack {
  codeLanguage: "swift" | "swiftui";
  conceptTerm: string;
  validSnippet: string;
  expectedOutcome: string;
  buggySnippet: string;
  bugReason: string;
  chooseCorrectOptions: [string, string, string, string];
  chooseCorrectReason: string;
  completionSnippet: string;
  completionCorrect: string;
  completionDistractors: [string, string, string];
  comparisonA: string;
  comparisonB: string;
  comparisonCorrect: string;
  refactorFrom: string;
  refactorTo: string;
  refactorReason: string;
}

interface BuiltFormatSpec {
  questionText: string;
  codeSnippet?: string;
  options: [string, string, string, string];
  correctAnswerIndex: number;
  explanation: string;
  wrongOptionExplanations: [string, string, string, string];
  hint: string;
  subtopic: string;
  format: QuestionFormat;
}

function pick<T>(values: T[], seed: number): T {
  const index = Math.abs(seed) % values.length;
  return values[index];
}

function rotateOptions(
  options: [string, string, string, string],
  correctAnswerIndex: number,
  seed: number,
): { options: [string, string, string, string]; correctAnswerIndex: number } {
  const shift = Math.abs(seed) % options.length;
  if (shift === 0) {
    return { options, correctAnswerIndex };
  }

  const rotated = [...options.slice(shift), ...options.slice(0, shift)] as [
    string,
    string,
    string,
    string,
  ];

  const nextCorrect = (correctAnswerIndex - shift + options.length) % options.length;
  return { options: rotated, correctAnswerIndex: nextCorrect };
}

function toWrongOptionExplanations(
  options: [string, string, string, string],
  correctAnswerIndex: number,
  wrongBaseReason: string,
): [string, string, string, string] {
  return options.map((option, index) => {
    if (index === correctAnswerIndex) {
      return "נכון.";
    }
    return `האופציה "${option}" לא נכונה כאן. ${wrongBaseReason}`;
  }) as [string, string, string, string];
}

function outputOptions(expected: string): [string, string, string, string] {
  const numeric = Number(expected);
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    const plusOne = String(numeric + 1);
    const minusOne = String(Math.max(0, numeric - 1));
    return [expected, plusOne, minusOne, "שגיאת קומפילציה"];
  }

  if (expected === "true" || expected === "false") {
    return [expected, expected === "true" ? "false" : "true", "nil", "שגיאת קומפילציה"];
  }

  return [expected, "שגיאת קומפילציה", "nil", "לא יודפס כלום"];
}

function xpByDifficulty(difficulty: Difficulty): number {
  if (difficulty === "hard") {
    return 42;
  }
  if (difficulty === "medium") {
    return 32;
  }
  return 24;
}

function retryWeightByDifficulty(difficulty: Difficulty): number {
  if (difficulty === "hard") {
    return 4;
  }
  if (difficulty === "medium") {
    return 3;
  }
  return 2;
}

function resolveArchetype(worldId: number, topic: string): Archetype {
  const normalizedTopic = topic.toLowerCase();

  if (
    normalizedTopic.includes("swiftui") ||
    normalizedTopic.includes("navigation") ||
    normalizedTopic.includes("sheet") ||
    normalizedTopic.includes("alert") ||
    normalizedTopic.includes("view")
  ) {
    return "swiftui";
  }

  if (
    normalizedTopic.includes("@state") ||
    normalizedTopic.includes("@binding") ||
    normalizedTopic.includes("@observedobject") ||
    normalizedTopic.includes("@stateobject") ||
    normalizedTopic.includes("@environmentobject") ||
    normalizedTopic.includes("data flow")
  ) {
    return "state";
  }

  if (
    normalizedTopic.includes("optional") ||
    normalizedTopic.includes("nil") ||
    normalizedTopic.includes("guard let") ||
    normalizedTopic.includes("if let")
  ) {
    return "optional";
  }

  if (
    normalizedTopic.includes("collection") ||
    normalizedTopic.includes("array") ||
    normalizedTopic.includes("dictionary") ||
    normalizedTopic.includes("set") ||
    normalizedTopic.includes("map") ||
    normalizedTopic.includes("filter")
  ) {
    return "collection";
  }

  if (
    normalizedTopic.includes("enum") ||
    normalizedTopic.includes("raw value") ||
    normalizedTopic.includes("associated value")
  ) {
    return "enum";
  }

  if (
    normalizedTopic.includes("protocol") ||
    normalizedTopic.includes("extension") ||
    normalizedTopic.includes("conformance") ||
    normalizedTopic.includes("associatedtype")
  ) {
    return "protocol";
  }

  if (
    normalizedTopic.includes("generic") ||
    normalizedTopic.includes("where clause") ||
    normalizedTopic.includes("type parameters") ||
    normalizedTopic.includes("opaque")
  ) {
    return "generic";
  }

  if (
    normalizedTopic.includes("arc") ||
    normalizedTopic.includes("weak") ||
    normalizedTopic.includes("unowned") ||
    normalizedTopic.includes("retain") ||
    normalizedTopic.includes("memory")
  ) {
    return "memory";
  }

  if (
    normalizedTopic.includes("urlsession") ||
    normalizedTopic.includes("codable") ||
    normalizedTopic.includes("http") ||
    normalizedTopic.includes("api")
  ) {
    return "networking";
  }

  if (
    normalizedTopic.includes("core data") ||
    normalizedTopic.includes("swiftdata") ||
    normalizedTopic.includes("userdefaults") ||
    normalizedTopic.includes("filemanager") ||
    normalizedTopic.includes("persistence")
  ) {
    return "persistence";
  }

  if (
    normalizedTopic.includes("xctest") ||
    normalizedTopic.includes("testing") ||
    normalizedTopic.includes("standard library") ||
    normalizedTopic.includes("algorithm") ||
    normalizedTopic.includes("complexity") ||
    normalizedTopic.includes("package") ||
    normalizedTopic.includes("module") ||
    normalizedTopic.includes("dependency") ||
    normalizedTopic.includes("debug") ||
    normalizedTopic.includes("instruments") ||
    normalizedTopic.includes("performance") ||
    normalizedTopic.includes("keychain") ||
    normalizedTopic.includes("security") ||
    normalizedTopic.includes("accessibility") ||
    normalizedTopic.includes("localization") ||
    normalizedTopic.includes("lifecycle") ||
    normalizedTopic.includes("ci/cd") ||
    normalizedTopic.includes("testflight")
  ) {
    return "tooling";
  }

  if (
    normalizedTopic.includes("async") ||
    normalizedTopic.includes("await") ||
    normalizedTopic.includes("task") ||
    normalizedTopic.includes("actor") ||
    normalizedTopic.includes("throw") ||
    normalizedTopic.includes("result")
  ) {
    return "async";
  }

  if (
    normalizedTopic.includes("closure") ||
    normalizedTopic.includes("capture") ||
    normalizedTopic.includes("escaping")
  ) {
    return "closure";
  }

  if (normalizedTopic.includes("class") || normalizedTopic.includes("inheritance")) {
    return "class";
  }

  if (normalizedTopic.includes("struct")) {
    return "struct";
  }

  if (normalizedTopic.includes("func") || normalizedTopic.includes("function")) {
    return "function";
  }

  if (
    normalizedTopic.includes("if") ||
    normalizedTopic.includes("switch") ||
    normalizedTopic.includes("loop") ||
    normalizedTopic.includes("while")
  ) {
    return "flow";
  }

  // Fallback by early-course ids keeps starter content coherent.
  if (worldId <= 2) {
    return "basics";
  }
  if (worldId <= 4) {
    return "function";
  }
  if (worldId <= 6) {
    return "collection";
  }
  if (worldId <= 10) {
    return "protocol";
  }
  if (worldId <= 12) {
    return "async";
  }
  if (worldId <= 14) {
    return "generic";
  }
  if (worldId <= 16) {
    return "memory";
  }
  if (worldId <= 20) {
    return "tooling";
  }
  if (worldId <= 21) {
    return "swiftui";
  }
  if (worldId <= 24) {
    return "state";
  }
  if (worldId === 25) {
    return "networking";
  }
  if (worldId === 26) {
    return "persistence";
  }
  return "tooling";
}

function buildPack(archetype: Archetype, topic: string, seed: number): ArchetypePack {
  const name = pick(NAMES, seed);
  const objectName = pick(OBJECT_NAMES, seed + 11);
  const n1 = 2 + (seed % 5);
  const n2 = 3 + (seed % 6);
  const n3 = 1 + (seed % 4);

  switch (archetype) {
    case "basics":
      return {
        codeLanguage: "swift",
        conceptTerm: "Type Safety ו-immutability",
        validSnippet: `var ${objectName} = ${n1}\n${objectName} += ${n3}\nprint(${objectName})`,
        expectedOutcome: String(n1 + n3),
        buggySnippet: `let ${objectName} = ${n2}\n${objectName} = ${n2 + 1}`,
        bugReason: "מנסים לשנות `let` אחרי אתחול, וזה לא חוקי ב-Swift.",
        chooseCorrectOptions: [
          `var ${objectName} = ${n1}\n${objectName} += 1`,
          `let ${objectName} = ${n1}\n${objectName} += 1`,
          `let ${objectName}: Int = "${n1}"`,
          `print(${objectName}`,
        ],
        chooseCorrectReason: "רק האופציה הראשונה גם חוקית תחבירית וגם תואמת mutability.",
        completionSnippet: `let ${objectName} = ${n2}\nprint("value: ___")`,
        completionCorrect: `\\(${objectName})`,
        completionDistractors: [objectName, `\${${objectName}}`, `(${objectName})`],
        comparisonA: `let ${objectName} = ${n1}`,
        comparisonB: `var ${objectName} = ${n1}`,
        comparisonCorrect: "A יוצר ערך קבוע, B יוצר ערך שניתן לשינוי.",
        refactorFrom: `let ${objectName} = ${n1}\nlet text = "value: " + String(${objectName})\nprint(text)`,
        refactorTo: `let ${objectName} = ${n1}\nprint("value: \\(${objectName})")`,
        refactorReason: "Interpolation קריא יותר ומקטין חיכוך של המרות ידניות.",
      };

    case "optional":
      return {
        codeLanguage: "swift",
        conceptTerm: "Optional binding",
        validSnippet: `let nickname: String? = ${seed % 2 === 0 ? `"${name}"` : "nil"}\nprint(nickname ?? "Guest")`,
        expectedOutcome: seed % 2 === 0 ? name : "Guest",
        buggySnippet: `let nickname: String? = nil\nprint(nickname!)`,
        bugReason: "Force unwrap על nil עלול לקרוס בזמן ריצה.",
        chooseCorrectOptions: [
          `if let nickname {\n  print(nickname)\n}`,
          `let nickname: String? = nil\nprint(nickname!)`,
          `guard nickname != nil else { return }\nprint(nickname!)`,
          `let nickname = Optional.none\nprint(nickname + "x")`,
        ],
        chooseCorrectReason: "האופציה הראשונה פותחת Optional בצורה בטוחה.",
        completionSnippet: `let value: String? = ${seed % 2 === 0 ? `"${name}"` : "nil"}\nprint(value ?? ___)`,
        completionCorrect: `"Guest"`,
        completionDistractors: ["nil", "value", "0"],
        comparisonA: `if let username = username {\n  print(username)\n}`,
        comparisonB: `guard let username = username else { return }\nprint(username)`,
        comparisonCorrect: "שתיהן בטוחות; `guard let` מתאים יותר ליציאה מוקדמת בפונקציה.",
        refactorFrom: `let value: Int? = nil\nlet safe = value!\nprint(safe)`,
        refactorTo: `let value: Int? = nil\nprint(value ?? 0)`,
        refactorReason: "מחליפים force unwrap ב-fallback בטוח עם `??`.",
      };

    case "function":
      return {
        codeLanguage: "swift",
        conceptTerm: "Function signature ו-argument labels",
        validSnippet: `func add(_ a: Int, _ b: Int) -> Int {\n  return a + b\n}\nprint(add(${n1}, ${n3}))`,
        expectedOutcome: String(n1 + n3),
        buggySnippet: `func add(_ a: Int, _ b: Int) -> Int {\n  a + b\n}`,
        bugReason: "בפונקציה עם `-> Int` צריך להחזיר ערך במפורש עם `return` בקונטקסט הזה.",
        chooseCorrectOptions: [
          `func multiply(_ a: Int, _ b: Int) -> Int {\n  return a * b\n}`,
          `func multiply(a Int, b Int) -> Int { a * b }`,
          `func multiply(_ a, _ b) -> Int { return a * b }`,
          `func multiply(_ a: Int, _ b: Int) => Int { return a * b }`,
        ],
        chooseCorrectReason: "רק האופציה הראשונה משתמשת בתחביר פונקציה תקין.",
        completionSnippet: `func power(_ value: Int) -> Int {\n  return ___\n}`,
        completionCorrect: "value * value",
        completionDistractors: ["value ** 2", "pow(value, 2)", "return value"],
        comparisonA: `func greet(_ name: String) { print(name) }`,
        comparisonB: `func greet(name: String) { print(name) }`,
        comparisonCorrect: "A נקרא בלי label חיצוני, B דורש label בשם `name:`.",
        refactorFrom: `func total(_ a: Int, _ b: Int) -> Int {\n  let sum = a + b\n  return sum\n}`,
        refactorTo: `func total(_ a: Int, _ b: Int) -> Int {\n  a + b\n}`,
        refactorReason: "ביטוי בודד יכול להיות קריא יותר בלי משתנה ביניים מיותר.",
      };

    case "flow":
      return {
        codeLanguage: "swift",
        conceptTerm: "Control flow reasoning",
        validSnippet: `var sum = 0\nfor n in 1...${n2} {\n  sum += n\n}\nprint(sum)`,
        expectedOutcome: String((n2 * (n2 + 1)) / 2),
        buggySnippet: `let value = ${n1}\nswitch value {\ncase 1:\n  print("one")\n}`,
        bugReason: "ב-`switch` על Int צריך לכסות את כל האפשרויות או להוסיף `default`.",
        chooseCorrectOptions: [
          `for n in 0..<3 {\n  print(n)\n}`,
          `for n to 3 {\n  print(n)\n}`,
          `while n in 0...3 {\n  print(n)\n}`,
          `switch 2 {\ncase 1: print("1")\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה משתמשת בתחביר לולאה תקין.",
        completionSnippet: `let hp = ${n2}\nif hp > ${n1} {\n  print(___)\n}`,
        completionCorrect: `"alive"`,
        completionDistractors: ["alive", "hp", "true"],
        comparisonA: `for n in 1...5 {\n  if n == 3 { continue }\n  print(n)\n}`,
        comparisonB: `for n in 1...5 {\n  if n == 3 { break }\n  print(n)\n}`,
        comparisonCorrect: "`continue` מדלג רק על סיבוב אחד; `break` עוצר את כל הלולאה.",
        refactorFrom: `if ${n2} > ${n1} {\n  print("ok")\n} else {\n  print("ok")\n}`,
        refactorTo: `print("ok")`,
        refactorReason: "כששני הענפים זהים, עדיף לפשט ולהסיר תנאי מיותר.",
      };

    case "collection":
      return {
        codeLanguage: "swift",
        conceptTerm: "Collection operations",
        validSnippet: `var items = [${n1}, ${n2}]\nitems.append(${n3})\nprint(items.count)`,
        expectedOutcome: "3",
        buggySnippet: `let items = [${n1}, ${n2}]\nprint(items[5])`,
        bugReason: "גישה לאינדקס מחוץ לטווח תגרום לקריסה בזמן ריצה.",
        chooseCorrectOptions: [
          `var users: [String: Int] = ["${name}": ${n2}]\nprint(users["${name}"] ?? 0)`,
          `var users = Dictionary<String, Int>()\nusers.add("${name}", ${n2})`,
          `let values: Set<Int> = [1, 1, 2, 2]\nprint(values[0])`,
          `let list = [1,2]\nlist.append(3)`,
        ],
        chooseCorrectReason: "האופציה הראשונה משתמשת נכון ב-Dictionary + fallback.",
        completionSnippet: `let numbers = [1, 2, 3]\nlet doubled = numbers.map { ___ }\nprint(doubled[0])`,
        completionCorrect: "$0 * 2",
        completionDistractors: ["$0 + 2", "numbers * 2", "2 * numbers"],
        comparisonA: `let array = [1, 2, 2, 3]`,
        comparisonB: `let set: Set = [1, 2, 2, 3]`,
        comparisonCorrect: "Array שומר כפילויות וסדר; Set שומר ייחודיות ללא סדר מובטח.",
        refactorFrom: `var found = false\nfor n in [1,2,3] {\n  if n == 2 { found = true }\n}\nprint(found)`,
        refactorTo: `print([1,2,3].contains(2))`,
        refactorReason: "שימוש ב-`contains` קצר וברור יותר מחיפוש ידני.",
      };

    case "enum":
      return {
        codeLanguage: "swift",
        conceptTerm: "Enum with cases",
        validSnippet: `enum Mode {\n  case easy\n  case hard\n}\nlet mode: Mode = .easy\nprint(mode == .easy)`,
        expectedOutcome: "true",
        buggySnippet: `enum Status {\n  case ready\n}\nlet current: Status = "ready"`,
        bugReason: "Enum לא מאותחל מ-String כזה; צריך להשתמש ב-case (`.ready`) או raw value מתאים.",
        chooseCorrectOptions: [
          `enum Direction {\n  case left\n  case right\n}`,
          `enum Direction = { left, right }`,
          `enum Direction {\n  left, right\n}`,
          `Direction enum {\n  case left\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה היא תחביר enum תקין ב-Swift.",
        completionSnippet: `enum Result {\n  case success\n  case failure\n}\nlet value: Result = .___`,
        completionCorrect: "success",
        completionDistractors: ["ok", "true", "value"],
        comparisonA: `enum ApiResult {\n  case success(Int)\n  case failure(String)\n}`,
        comparisonB: `enum ApiCode: Int {\n  case success = 200\n  case failure = 500\n}`,
        comparisonCorrect: "A משתמש ב-associated values, B משתמש ב-raw values.",
        refactorFrom: `if code == 200 {\n  print("ok")\n} else {\n  print("fail")\n}`,
        refactorTo: `enum ApiCode: Int { case ok = 200, fail = 500 }\nlet state: ApiCode = code == 200 ? .ok : .fail`,
        refactorReason: "Enum נותן מודל קריא ובטוח יותר ממספרים קסומים.",
      };

    case "generic":
      return {
        codeLanguage: "swift",
        conceptTerm: "Generics and constraints",
        validSnippet: `func swapValues<T>(_ a: inout T, _ b: inout T) {\n  let temp = a\n  a = b\n  b = temp\n}\nvar x = ${n1}\nvar y = ${n2}\nswapValues(&x, &y)\nprint(x)`,
        expectedOutcome: String(n2),
        buggySnippet: `func first<T>(_ items: [T]) -> T {\n  items.first\n}`,
        bugReason: "`items.first` מחזיר `T?`, לא `T` ישיר.",
        chooseCorrectOptions: [
          `func identity<T>(_ value: T) -> T {\n  value\n}`,
          `func identity(_ value: T) -> T {\n  value\n}`,
          `func identity<T>(_ value: T) -> Int {\n  value\n}`,
          `func identity<T>(value) -> T {\n  value\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה מגדירה generic function תקין.",
        completionSnippet: `func isEqual<T: Equatable>(_ a: T, _ b: T) -> Bool {\n  return ___\n}`,
        completionCorrect: "a == b",
        completionDistractors: ["a = b", "a === b", "equal(a,b)"],
        comparisonA: `func printAny<T>(_ value: T) { print(value) }`,
        comparisonB: `func printAny(_ value: Any) { print(value) }`,
        comparisonCorrect: "A שומר מידע טיפוסי ב-compile-time, B מוחק לטיפוס Any.",
        refactorFrom: `func intMax(_ a: Int, _ b: Int) -> Int { a > b ? a : b }\nfunc doubleMax(_ a: Double, _ b: Double) -> Double { a > b ? a : b }`,
        refactorTo: `func maxValue<T: Comparable>(_ a: T, _ b: T) -> T { a > b ? a : b }`,
        refactorReason: "Generics מוריד כפילויות ומשמר type safety.",
      };

    case "memory":
      return {
        codeLanguage: "swift",
        conceptTerm: "ARC and retain cycles",
        validSnippet: `class Owner {\n  var child: Child?\n}\nclass Child {\n  weak var owner: Owner?\n}\nlet o = Owner()\nlet c = Child()\no.child = c\nc.owner = o\nprint(o.child != nil)`,
        expectedOutcome: "true",
        buggySnippet: `class A {\n  var b: B?\n}\nclass B {\n  var a: A?\n}`,
        bugReason: "שני הצדדים מחזיקים reference חזק, וזה עלול ליצור retain cycle.",
        chooseCorrectOptions: [
          `class Child {\n  weak var parent: Parent?\n}`,
          `class Child {\n  unowned var parent: Parent?\n}`,
          `class Child {\n  var parent weak: Parent?\n}`,
          `class Child {\n  arc var parent: Parent?\n}`,
        ],
        chooseCorrectReason: "`weak` הוא הפתרון הבטוח הנפוץ לקשר דו-כיווני אופציונלי.",
        completionSnippet: `class Node {\n  ___ var parent: Node?\n}`,
        completionCorrect: "weak",
        completionDistractors: ["strong", "arc", "final"],
        comparisonA: `weak var delegate: Delegate?`,
        comparisonB: `unowned var delegate: Delegate`,
        comparisonCorrect: "`weak` הוא Optional ובטוח כשאובייקט יכול להשתחרר; `unowned` לא Optional.",
        refactorFrom: `class VM {\n  var onUpdate: (() -> Void)?\n  func bind() {\n    onUpdate = { self.reload() }\n  }\n  func reload() {}\n}`,
        refactorTo: `class VM {\n  var onUpdate: (() -> Void)?\n  func bind() {\n    onUpdate = { [weak self] in self?.reload() }\n  }\n  func reload() {}\n}`,
        refactorReason: "Capture list עם `[weak self]` מפחית סיכון ל-retain cycle.",
      };

    case "networking":
      return {
        codeLanguage: "swift",
        conceptTerm: "Networking layer basics",
        validSnippet: `struct User: Codable {\n  let id: Int\n}\nlet decoder = JSONDecoder()\nlet data = #"{"id": ${n2}}"#.data(using: .utf8)!\nlet user = try? decoder.decode(User.self, from: data)\nprint(user?.id ?? 0)`,
        expectedOutcome: String(n2),
        buggySnippet: `let url = URL(string: "https://api.example.com")\nlet task = URLSession.shared.dataTask(with: url)`,
        bugReason: "URL הוא Optional; צריך unwrap בטוח לפני שימוש ב-dataTask.",
        chooseCorrectOptions: [
          `guard let url = URL(string: "https://api.example.com") else { return }\nlet task = URLSession.shared.dataTask(with: url) { _,_,_ in }\ntask.resume()`,
          `let url = URL("https://api.example.com")\nURLSession.dataTask(url)`,
          `URLSession.shared.dataTask("https://api.example.com")`,
          `let task = URLSession.shared.dataTask(with: "https://api.example.com")`,
        ],
        chooseCorrectReason: "האופציה הראשונה מבצעת unwrap נכון ו-resume למשימה.",
        completionSnippet: `let decoder = JSONDecoder()\nlet model = try decoder.decode(User.self, ___ data)`,
        completionCorrect: "from:",
        completionDistractors: ["with:", "at:", "using:"],
        comparisonA: `try? decoder.decode(User.self, from: data)`,
        comparisonB: `try! decoder.decode(User.self, from: data)`,
        comparisonCorrect: "`try?` בטוח יותר; `try!` עלול לקרוס בשגיאת decode.",
        refactorFrom: `if let data = data {\n  if let user = try? decoder.decode(User.self, from: data) {\n    print(user)\n  }\n}`,
        refactorTo: `guard let data = data,\n      let user = try? decoder.decode(User.self, from: data) else { return }\nprint(user)`,
        refactorReason: "guard משטח nesting ומקל על קריאה ותחזוקה.",
      };

    case "persistence":
      return {
        codeLanguage: "swift",
        conceptTerm: "Local persistence",
        validSnippet: `UserDefaults.standard.set(${n2}, forKey: "highScore")\nlet score = UserDefaults.standard.integer(forKey: "highScore")\nprint(score)`,
        expectedOutcome: String(n2),
        buggySnippet: `let defaults = UserDefaults.standard\ndefaults.set(User(), forKey: "user")`,
        bugReason: "UserDefaults לא שומר אובייקטים שרירותיים; צריך טיפוסים נתמכים או קידוד.",
        chooseCorrectOptions: [
          `UserDefaults.standard.set("dark", forKey: "theme")`,
          `UserDefaults.standard.save("dark", key: "theme")`,
          `UserDefaults.standard.setObject("dark", forKey: "theme")`,
          `UserDefaults.theme = "dark"`,
        ],
        chooseCorrectReason: "האופציה הראשונה היא API תקין של UserDefaults.",
        completionSnippet: `let defaults = UserDefaults.standard\nlet name = defaults.string(forKey: "name") ___ "Guest"`,
        completionCorrect: "??",
        completionDistractors: ["&&", "==", "=>"],
        comparisonA: `UserDefaults`,
        comparisonB: `SwiftData/Core Data`,
        comparisonCorrect: "UserDefaults מתאים להגדרות פשוטות; SwiftData/Core Data לנתונים מורכבים ורלציוניים.",
        refactorFrom: `let value = defaults.string(forKey: "theme")\nif value == nil {\n  print("light")\n} else {\n  print(value!)\n}`,
        refactorTo: `print(defaults.string(forKey: "theme") ?? "light")`,
        refactorReason: "מחליפים unwrap מסוכן ב-fallback בטוח ונקי.",
      };

    case "tooling":
      return {
        codeLanguage: "swift",
        conceptTerm: "Production engineering workflow",
        validSnippet: `import XCTest\n\nfinal class ScoreTests: XCTestCase {\n  func testSum() {\n    XCTAssertEqual(2 + 3, 5)\n  }\n}`,
        expectedOutcome: "test passes",
        buggySnippet: `func testLogin() {\n  XCTAssertEqual(response.code, 200)\n}`,
        bugReason: "פונקציית test צריכה להיות בתוך XCTestCase כדי לרוץ במסגרת בדיקות.",
        chooseCorrectOptions: [
          `measure {\n  runHotPath()\n}`,
          `profile {\n  runHotPath()\n}`,
          `benchmark {\n  runHotPath()\n}`,
          `instrument {\n  runHotPath()\n}`,
        ],
        chooseCorrectReason: "ב-XCTest משתמשים ב-`measure` למדידת ביצועים.",
        completionSnippet: `#if DEBUG\nprint("debug log")\n___`,
        completionCorrect: "#endif",
        completionDistractors: ["#end", "endif", "}"],
        comparisonA: `assertionFailure("unexpected state")`,
        comparisonB: `preconditionFailure("unexpected state")`,
        comparisonCorrect: "assertionFailure פעיל בעיקר ב-Debug; preconditionFailure מיועד גם לתנאי runtime קריטיים.",
        refactorFrom: `print("user token: \\(token)")`,
        refactorTo: `print("user authenticated")`,
        refactorReason: "ב-production נמנעים מלחשוף מידע רגיש בלוגים.",
      };

    case "struct":
      return {
        codeLanguage: "swift",
        conceptTerm: "Struct value semantics",
        validSnippet: `struct Player {\n  var hp: Int\n}\nvar p = Player(hp: ${n2})\np.hp -= ${n3}\nprint(p.hp)`,
        expectedOutcome: String(n2 - n3),
        buggySnippet: `struct Counter {\n  var value = 0\n  func increment() {\n    value += 1\n  }\n}`,
        bugReason: "מתודה שמשנה property ב-struct צריכה להיות `mutating`.",
        chooseCorrectOptions: [
          `struct User {\n  let name: String\n  var level: Int\n}`,
          `struct User: class {\n  let name: String\n}`,
          `struct User {\n  init name: String {}\n}`,
          `struct User {\n  var name = nil\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה היא דקלרציית struct תקינה ופשוטה.",
        completionSnippet: `struct Score {\n  var points: Int\n  var isHigh: Bool {\n    ___\n  }\n}`,
        completionCorrect: "points >= 100",
        completionDistractors: ["return points", "isHigh = points >= 100", "points => 100"],
        comparisonA: `var a = Player(hp: 10)\nvar b = a\nb.hp = 1`,
        comparisonB: `let same = a.hp == b.hp`,
        comparisonCorrect: "ב-struct ההעתקה היא ערך, לכן שינוי ב-`b` לא משנה את `a`.",
        refactorFrom: `struct User {\n  var first: String\n  var last: String\n  func full() -> String {\n    return first + " " + last\n  }\n}`,
        refactorTo: `struct User {\n  var first: String\n  var last: String\n  var fullName: String { first + " " + last }\n}`,
        refactorReason: "computed property מתאים יותר לערך נגזר קבוע.",
      };

    case "class":
      return {
        codeLanguage: "swift",
        conceptTerm: "Reference semantics",
        validSnippet: `class Counter {\n  var value = 0\n}\nlet a = Counter()\nlet b = a\nb.value = ${n2}\nprint(a.value)`,
        expectedOutcome: String(n2),
        buggySnippet: `final class Base {}\nclass Child: Base {}`,
        bugReason: "אי אפשר לרשת מ-class שסומנה `final`.",
        chooseCorrectOptions: [
          `class Animal {\n  func sound() -> String { "..." }\n}\nclass Dog: Animal {\n  override func sound() -> String { "woof" }\n}`,
          `class Animal {}\nstruct Dog: Animal {}`,
          `class Dog: Animal {\n  override sound() -> String { "woof" }\n}`,
          `class Dog inherits Animal {}`,
        ],
        chooseCorrectReason: "האופציה הראשונה מדגימה ירושה ו-override תקינים.",
        completionSnippet: `class Session {\n  var id = ${n1}\n}\nlet x = Session()\nlet y = x\ny.id = ___\nprint(x.id)`,
        completionCorrect: String(n2),
        completionDistractors: [String(n1), `"${n2}"`, "nil"],
        comparisonA: `a == b`,
        comparisonB: `a === b`,
        comparisonCorrect: "`==` משווה שוויון לוגי (אם מוגדר), `===` משווה זהות אובייקט.",
        refactorFrom: `class VM {\n  var state = 0\n  func update() {\n    if true {\n      state = 1\n    } else {\n      state = 1\n    }\n  }\n}`,
        refactorTo: `class VM {\n  var state = 0\n  func update() {\n    state = 1\n  }\n}`,
        refactorReason: "מסירים branch מיותר ומשאירים לוגיקה שקופה.",
      };

    case "protocol":
      return {
        codeLanguage: "swift",
        conceptTerm: "Protocol conformance",
        validSnippet: `protocol Renderable {\n  func render() -> String\n}\nstruct Card: Renderable {\n  func render() -> String { "ok" }\n}\nprint(Card().render())`,
        expectedOutcome: "ok",
        buggySnippet: `protocol Runnable {\n  func run()\n}\nstruct Bot: Runnable {\n}`,
        bugReason: "הטיפוס `Bot` לא מממש את הפונקציה הנדרשת בפרוטוקול.",
        chooseCorrectOptions: [
          `protocol Identifiable {\n  var id: String { get }\n}\nstruct User: Identifiable {\n  let id: String\n}`,
          `protocol Identifiable {\n  var id: String\n}`,
          `struct User: Identifiable {\n  id: String\n}`,
          `extension protocol Identifiable {\n  var id: String { "" }\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה מגדירה ומממשת conformance בצורה תקינה.",
        completionSnippet: `protocol Named {\n  var name: String { get }\n}\nstruct Hero: Named {\n  let ___\n}`,
        completionCorrect: "name: String",
        completionDistractors: ["name = String", "String name", "name -> String"],
        comparisonA: `protocol Logger { func log(_ text: String) }`,
        comparisonB: `extension Logger {\n  func log(_ text: String) { print(text) }\n}`,
        comparisonCorrect: "A מגדיר חוזה, B מוסיף מימוש ברירת מחדל דרך extension.",
        refactorFrom: `struct Service {\n  func send() {}\n}\nstruct Client {\n  let service: Service\n}`,
        refactorTo: `protocol Sending { func send() }\nstruct Client {\n  let service: Sending\n}`,
        refactorReason: "תלות בפרוטוקול גמישה יותר מתלות במימוש קונקרטי.",
      };

    case "closure":
      return {
        codeLanguage: "swift",
        conceptTerm: "Closures and capture",
        validSnippet: `let values = [${n2}, ${n1}, ${n3}]\nlet sorted = values.sorted { $0 < $1 }\nprint(sorted[0])`,
        expectedOutcome: String(Math.min(n1, n2, n3)),
        buggySnippet: `let values = [1, 2, 3]\nlet sorted = values.sorted { a, b in\n  a < b\nprint(sorted)`,
        bugReason: "תחביר ה-closure שבור: חסר סוגר/סגירה תקינה לבלוק.",
        chooseCorrectOptions: [
          `let result = [1,2,3].map { $0 * 2 }`,
          `let result = [1,2,3].map( $0 * 2 )`,
          `let result = map([1,2,3]) { $0 * 2`,
          `let result = [1,2,3].map -> $0 * 2`,
        ],
        chooseCorrectReason: "האופציה הראשונה משתמשת נכון ב-trailing closure.",
        completionSnippet: `let numbers = [1,2,3]\nlet total = numbers.reduce(0) { partial, item in\n  ___\n}\nprint(total)`,
        completionCorrect: "partial + item",
        completionDistractors: ["partial += item", "item + numbers", "return total"],
        comparisonA: `func transform(_ x: Int) -> Int { x * 2 }`,
        comparisonB: `let transform: (Int) -> Int = { $0 * 2 }`,
        comparisonCorrect: "A היא פונקציה named, B הוא closure באותו חוזה חתימה.",
        refactorFrom: `let values = [1,2,3]\nlet mapped = values.map({ value in\n  return value * 2\n})`,
        refactorTo: `let values = [1,2,3]\nlet mapped = values.map { $0 * 2 }`,
        refactorReason: "shorthand closure מקצר קוד ושומר על קריאות.",
      };

    case "async":
      return {
        codeLanguage: "swift",
        conceptTerm: "Error + async flow",
        validSnippet: `func loadValue() async -> Int {\n  7\n}\nTask {\n  let value = await loadValue()\n  print(value)\n}`,
        expectedOutcome: "7",
        buggySnippet: `func loadValue() async -> Int { 7 }\nTask {\n  let value = loadValue()\n  print(value)\n}`,
        bugReason: "קריאה לפונקציה async מחייבת `await`.",
        chooseCorrectOptions: [
          `do {\n  let value = try risky()\n  print(value)\n} catch {\n  print(error)\n}`,
          `do {\n  let value = risky()\n} catch {\n  print(error)\n}`,
          `try {\n  let value = risky()\n}`,
          `catch {\n  let value = try risky()\n}`,
        ],
        chooseCorrectReason: "האופציה הראשונה מציגה מבנה `do/catch` תקין עם `try`.",
        completionSnippet: `func fetch() async throws -> String {\n  "ok"\n}\nTask {\n  let value = try ___ fetch()\n  print(value)\n}`,
        completionCorrect: "await",
        completionDistractors: ["async", "do", "catch"],
        comparisonA: `let value = try? risky()`,
        comparisonB: `let value = try! risky()`,
        comparisonCorrect: "`try?` מחזיר Optional בטוח; `try!` יקרוס אם יש שגיאה.",
        refactorFrom: `api.load { result in\n  switch result {\n  case .success(let value): print(value)\n  case .failure(let error): print(error)\n  }\n}`,
        refactorTo: `Task {\n  do {\n    let value = try await api.load()\n    print(value)\n  } catch {\n    print(error)\n  }\n}`,
        refactorReason: "async/await הופך זרימה מורכבת לקריאה יותר.",
      };

    case "swiftui":
      return {
        codeLanguage: "swiftui",
        conceptTerm: "View composition ו-modifiers",
        validSnippet: `var body: some View {\n  VStack(spacing: 12) {\n    Text("Hello")\n    Text("${name}")\n  }\n}`,
        expectedOutcome: "VStack",
        buggySnippet: `var body: some View {\n  Text("Hi")\n  Text("Again")\n}`,
        bugReason: "body חייב להחזיר View יחיד; כאן חסר container כמו VStack.",
        chooseCorrectOptions: [
          `NavigationStack {\n  List {\n    Text("Item")\n  }\n}`,
          `Navigation {\n  List {\n    Text("Item")\n  }\n}`,
          `NavigationStack {\n  List Text("Item")\n}`,
          `List {\n  Text("Item")\n}\nNavigationStack`,
        ],
        chooseCorrectReason: "האופציה הראשונה תקינה וכוללת היררכיה SwiftUI נכונה.",
        completionSnippet: `Button("Save") {\n  ___\n}`,
        completionCorrect: `print("saved")`,
        completionDistractors: [`return "saved"`, `Text("saved")`, `saved => true`],
        comparisonA: `HStack { Text("A"); Text("B") }`,
        comparisonB: `VStack { Text("A"); Text("B") }`,
        comparisonCorrect: "HStack מציב אופקית, VStack מציב אנכית.",
        refactorFrom: `Text("Title")\n  .padding(8)\n  .padding(8)\n  .foregroundColor(.blue)`,
        refactorTo: `Text("Title")\n  .padding(16)\n  .foregroundColor(.blue)`,
        refactorReason: "מאחדים modifiers כפולים לקוד נקי יותר.",
      };

    case "state":
      return {
        codeLanguage: "swiftui",
        conceptTerm: "State/Data Flow wrappers",
        validSnippet: `struct ParentView: View {\n  @State private var count = ${n1}\n  var body: some View {\n    ChildView(count: $count)\n  }\n}\n\nstruct ChildView: View {\n  @Binding var count: Int\n  var body: some View { Text("\\(count)") }\n}`,
        expectedOutcome: "Parent מחזיק @State ו-Child מקבל @Binding",
        buggySnippet: `struct ChildView: View {\n  @State var count: Int\n  var body: some View { Text("\\(count)") }\n}\n\nstruct ParentView: View {\n  @State private var count = 0\n  var body: some View {\n    ChildView(count: $count)\n  }\n}`,
        bugReason: "Child שמקבל binding צריך `@Binding` ולא `@State`.",
        chooseCorrectOptions: [
          `@State private var query = ""`,
          `@Binding private var query = ""`,
          `@ObservedObject private var query = ""`,
          `@EnvironmentObject private var query = ""`,
        ],
        chooseCorrectReason: "ערך מקומי פשוט בתוך אותו View נשמר עם `@State`.",
        completionSnippet: `@State private var count = ${n1}\nChildView(count: ___)`,
        completionCorrect: "$count",
        completionDistractors: ["count", "&count", "Binding(count)"],
        comparisonA: `@StateObject var vm = ViewModel()`,
        comparisonB: `@ObservedObject var vm: ViewModel`,
        comparisonCorrect: "`@StateObject` יוצר ומחזיק lifecycle; `@ObservedObject` רק צופה.",
        refactorFrom: `struct Parent: View {\n  @State private var count = 0\n  var body: some View {\n    Child(count: count)\n  }\n}\n\nstruct Child: View {\n  let count: Int\n  var body: some View { Button("Inc") { } }\n}`,
        refactorTo: `struct Parent: View {\n  @State private var count = 0\n  var body: some View {\n    Child(count: $count)\n  }\n}\n\nstruct Child: View {\n  @Binding var count: Int\n  var body: some View { Button("Inc") { count += 1 } }\n}`,
        refactorReason: "כשהילד משנה state של ההורה, מעבירים Binding ולא value copy.",
      };
    default:
      return {
        codeLanguage: "swift",
        conceptTerm: "Swift reasoning",
        validSnippet: `let value = ${n1}\nprint(value)`,
        expectedOutcome: String(n1),
        buggySnippet: `let value = ${n1}\nvalue = ${n2}`,
        bugReason: "אי אפשר לשנות let.",
        chooseCorrectOptions: [
          `var value = 1`,
          `let value =\n`,
          `value: Int = 1`,
          `if value = 1 {}`,
        ],
        chooseCorrectReason: "האופציה הראשונה תקינה.",
        completionSnippet: `let value = ${n1}\nprint(___)`,
        completionCorrect: "value",
        completionDistractors: ["value()", "\"value\"", "Int.value"],
        comparisonA: `let x = 1`,
        comparisonB: `var x = 1`,
        comparisonCorrect: "let קבוע, var משתנה.",
        refactorFrom: `let x = ${n1}\nprint(String(x))`,
        refactorTo: `let x = ${n1}\nprint("\\(x)")`,
        refactorReason: "Interpolation קריא יותר.",
      };
  }
}

function withRotation(
  options: [string, string, string, string],
  correctAnswerIndex: number,
  seed: number,
  wrongReason: string,
): Pick<BuiltFormatSpec, "options" | "correctAnswerIndex" | "wrongOptionExplanations"> {
  const rotated = rotateOptions(options, correctAnswerIndex, seed);
  return {
    options: rotated.options,
    correctAnswerIndex: rotated.correctAnswerIndex,
    wrongOptionExplanations: toWrongOptionExplanations(
      rotated.options,
      rotated.correctAnswerIndex,
      wrongReason,
    ),
  };
}

function buildFormatSpec(
  pack: ArchetypePack,
  topic: string,
  localIndex: number,
  format: QuestionFormat,
): BuiltFormatSpec {
  if (format === "wrapper_selection") {
    const baseOptions: [string, string, string, string] = [
      "@Binding",
      "@State",
      "@ObservedObject",
      "@EnvironmentObject",
    ];
    const rotated = withRotation(
      baseOptions,
      0,
      localIndex,
      "צריך לבחור wrapper לפי בעלות על state וזרימת הנתונים.",
    );
    return {
      format,
      questionText: `באיזה wrapper משתמשים כש-Child View צריך לשנות state שמוחזק בהורה? (${topic})`,
      codeSnippet: `@State private var count = 0\nChildView(count: ___)`,
      options: rotated.options,
      correctAnswerIndex: rotated.correctAnswerIndex,
      explanation:
        "כש-Child משנה state שמוחזק בהורה, מעבירים Binding ולכן משתמשים ב-`@Binding` בצד הילד ו-`$state` בצד ההורה.",
      wrongOptionExplanations: rotated.wrongOptionExplanations,
      hint: "תחשוב מי הבעלים של הנתון ומי רק צורך/משנה אותו.",
      subtopic: "wrapper selection",
    };
  }

  if (format === "swiftui_scenario") {
    const options: [string, string, string, string] = [
      "לעטוף את ה-Views בתוך VStack/HStack מתאים",
      "להחזיר שני Views נפרדים ישירות מ-body בלי container",
      "להשתמש ב-UIKit UIView בתוך body בלי wrapper",
      "לכתוב קוד UI בלי var body בכלל",
    ];
    const rotated = withRotation(options, 0, localIndex, "SwiftUI דורש היררכיית View תקינה.");
    return {
      format,
      questionText: `יש מסך SwiftUI עם שני Text. מה הפתרון הנכון כדי לשמור מבנה View תקין? (${topic})`,
      codeSnippet: `var body: some View {\n  Text("A")\n  Text("B")\n}`,
      options: rotated.options,
      correctAnswerIndex: rotated.correctAnswerIndex,
      explanation:
        "ב-SwiftUI `body` מחזיר View אחד. לכן עוטפים כמה Views בקונטיינר כמו VStack או HStack.",
      wrongOptionExplanations: rotated.wrongOptionExplanations,
      hint: "body תמיד מחזיר View יחיד.",
      subtopic: "swiftui scenario",
    };
  }

  switch (format) {
    case "output_prediction": {
      const baseOptions = outputOptions(pack.expectedOutcome);
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "שווה לחשב שורה-שורה לפני שבוחרים פלט.",
      );
      return {
        format,
        questionText: `מה הפלט של הקוד הבא בנושא ${topic}?`,
        codeSnippet: pack.validSnippet,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: `הקוד תקין ומחזיר את התוצאה: ${pack.expectedOutcome}.`,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "חשב את הערך האחרון שמגיע לפעולת ההדפסה.",
        subtopic: "output reasoning",
      };
    }
    case "find_bug": {
      const baseOptions: [string, string, string, string] = [
        pack.bugReason,
        "אין באג, הקוד תקין לחלוטין.",
        "הבעיה היחידה היא עיצוב/ריווח ולא לוגיקה.",
        "צריך רק להוסיף print כדי לתקן.",
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "צריך לזהות את השגיאה שמונעת תקינות תחבירית/לוגית.",
      );
      return {
        format,
        questionText: `איפה הבאג המרכזי בקוד בנושא ${topic}?`,
        codeSnippet: pack.buggySnippet,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: pack.bugReason,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "זהה קודם אם הבעיה היא טיפוס, תחביר או זרימת נתונים.",
        subtopic: "bug diagnosis",
      };
    }
    case "choose_correct_code": {
      const rotated = withRotation(
        pack.chooseCorrectOptions,
        0,
        localIndex,
        "רק אופציה אחת שומרת על כללי התחביר והעיקרון של הנושא.",
      );
      return {
        format,
        questionText: `איזה קטע קוד נכון יותר עבור ${topic}?`,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: pack.chooseCorrectReason,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "פסול קודם אופציות עם שגיאת תחביר, ואז בדוק לוגיקה.",
        subtopic: "choose correct code",
      };
    }
    case "complete_code": {
      const baseOptions: [string, string, string, string] = [
        pack.completionCorrect,
        pack.completionDistractors[0],
        pack.completionDistractors[1],
        pack.completionDistractors[2],
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "השורה החסרה צריכה להיות גם תחבירית תקינה וגם תואמת לוגיקה.",
      );
      return {
        format,
        questionText: `מה ההשלמה הנכונה לשורה החסרה (${topic})?`,
        codeSnippet: pack.completionSnippet,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: "ההשלמה הנכונה היא זו ששומרת על זרימה ותקינות הקוד.",
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "בדוק התאמה לטיפוסים ולתפקיד השורה בתוך הבלוק.",
        subtopic: "missing line completion",
      };
    }
    case "code_vs_concept": {
      const baseOptions: [string, string, string, string] = [
        pack.conceptTerm,
        "Memory leak by default",
        "Networking configuration",
        "Binary serialization",
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "המושג צריך להסביר את ההתנהגות שנראית בקוד בפועל.",
      );
      return {
        format,
        questionText: `איזה מושג הקוד הבא מדגים הכי טוב? (${topic})`,
        codeSnippet: pack.validSnippet,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: `המושג המרכזי כאן הוא ${pack.conceptTerm}.`,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "חפש את העיקרון, לא רק את התחביר.",
        subtopic: "concept mapping",
      };
    }
    case "code_comparison": {
      const baseOptions: [string, string, string, string] = [
        pack.comparisonCorrect,
        "אין שום הבדל אמיתי בין A ל-B.",
        "A תמיד מהיר יותר מ-B בכל מצב.",
        "B תמיד בטוח יותר מ-A בכל מצב.",
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "בשאלות השוואה צריך לזהות את ההבדל המהותי ולא הנחה כללית.",
      );
      return {
        format,
        questionText: `מה ההבדל המרכזי בין A ל-B בנושא ${topic}?`,
        codeSnippet: `A)\n${pack.comparisonA}\n\nB)\n${pack.comparisonB}`,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: pack.comparisonCorrect,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "התמקד ב-behavior ולא רק בצורת הכתיבה.",
        subtopic: "code comparison",
      };
    }
    case "mini_refactor": {
      const baseOptions: [string, string, string, string] = [
        pack.refactorTo,
        pack.refactorFrom,
        "להוסיף עוד משתני ביניים כדי להאריך את הקוד",
        "לשמור קוד כפול כדי שיהיה מפורש יותר",
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "Refactor צריך לשפר קריאות בלי לשנות behavior.",
      );
      return {
        format,
        questionText: `מה ה-mini refactor הכי נקי לקטע הבא? (${topic})`,
        codeSnippet: pack.refactorFrom,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation: pack.refactorReason,
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "בחר פתרון פשוט, קריא ושקול לוגית לקוד המקורי.",
        subtopic: "mini refactor",
      };
    }
    case "multiple_choice":
    default: {
      const baseOptions: [string, string, string, string] = [
        "לקרוא את הקוד שורה-שורה, לחשב ערכים ביניים, ואז לבחור תשובה.",
        "לנחש לפי מילה מוכרת אחת באופציות.",
        "להעדיף תמיד את האופציה הארוכה ביותר.",
        "להתעלם מטיפוסים כי הקומפיילר יתקן לבד.",
      ];
      const rotated = withRotation(
        baseOptions,
        0,
        localIndex,
        "בלמידת קוד, מתודולוגיה נכונה עדיפה על ניחוש.",
      );
      return {
        format: "multiple_choice",
        questionText: `מה שיטת הפתרון הנכונה ביותר לשאלת ${topic}?`,
        codeSnippet: pack.validSnippet,
        options: rotated.options,
        correctAnswerIndex: rotated.correctAnswerIndex,
        explanation:
          "פתרון איכותי מבוסס על reasoning: פירוק שלבים, בדיקת טיפוסים, והשוואה לאפשרויות.",
        wrongOptionExplanations: rotated.wrongOptionExplanations,
        hint: "תמיד תעדיף היגיון שיטתי על זיכרון שטחי.",
        subtopic: "logic strategy",
      };
    }
  }
}

function selectFormat(archetype: Archetype, localIndex: number): QuestionFormat {
  let format = FORMAT_ROTATION[localIndex % FORMAT_ROTATION.length];
  if (archetype === "state" && localIndex % 6 === 0) {
    format = "wrapper_selection";
  }
  if (archetype === "swiftui" && localIndex % 7 === 0) {
    format = "swiftui_scenario";
  }
  return format;
}

function buildAutoQuestion(
  worldId: number,
  topic: string,
  localIndex: number,
): Question {
  const archetype = resolveArchetype(worldId, topic);
  const format = selectFormat(archetype, localIndex);
  const difficulty = DIFFICULTY_ROTATION[localIndex % DIFFICULTY_ROTATION.length];
  const pack = buildPack(archetype, topic, localIndex + worldId * 97);
  const built = buildFormatSpec(pack, topic, localIndex, format);

  return {
    id: `w${worldId}-auto-q${localIndex + 1}`,
    worldId,
    stageId: `w${worldId}-auto-s${Math.floor(localIndex / 10) + 1}`,
    topic,
    subtopic: built.subtopic,
    difficulty,
    format: built.format,
    questionText: built.questionText,
    codeSnippet: built.codeSnippet,
    codeLanguage: pack.codeLanguage,
    options: built.options,
    correctAnswerIndex: built.correctAnswerIndex,
    explanation: built.explanation,
    wrongOptionExplanations: built.wrongOptionExplanations,
    hint: built.hint,
    tags: ["auto-generated", `world-${worldId}`, `format-${built.format}`, topic],
    xpReward: xpByDifficulty(difficulty),
    retryWeight: retryWeightByDifficulty(difficulty),
    prerequisites: [],
    relatedQuestionIds: [],
  };
}

function groupQuestionsByWorld(questions: Question[]): Record<number, number> {
  const result: Record<number, number> = {};
  for (const question of questions) {
    result[question.worldId] = (result[question.worldId] ?? 0) + 1;
  }
  return result;
}

export function ensureMinimumWorldQuestions(
  baseQuestions: Question[],
  minimumPerWorld = MIN_QUESTIONS_PER_WORLD,
): Question[] {
  const expanded = [...baseQuestions];
  const counts = groupQuestionsByWorld(baseQuestions);
  const existingIds = new Set(baseQuestions.map((question) => question.id));

  for (const world of worlds) {
    const currentCount = counts[world.id] ?? 0;
    if (currentCount >= minimumPerWorld) {
      continue;
    }

    const needed = minimumPerWorld - currentCount;
    for (let index = 0; index < needed; index += 1) {
      const localIndex = currentCount + index;
      const topic = world.topicCoverage[localIndex % world.topicCoverage.length];
      const question = buildAutoQuestion(world.id, topic, localIndex);
      if (existingIds.has(question.id)) {
        continue;
      }
      existingIds.add(question.id);
      expanded.push(question);
    }
  }

  return expanded;
}
