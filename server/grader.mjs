import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";

const runnerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "grader", "run_submission.py");

export async function gradeSubmission({ functionName, code, testCases, publicOnly = false }) {
  const selectedCases = publicOnly
    ? testCases.filter((testCase) => testCase.visibility === "public")
    : testCases;
  const start = Date.now();
  const runnerResult = await runPython({
    functionName,
    code,
    testCases: selectedCases.map((testCase) => ({
      id: testCase.id,
      name: testCase.name,
      args: JSON.parse(testCase.args_json),
      visibility: testCase.visibility
    }))
  });
  const runtimeMs = Date.now() - start;

  if (!runnerResult.ok) {
    return {
      score: 0,
      passed: false,
      passedTests: 0,
      totalTests: selectedCases.length,
      runtimeMs,
      details: selectedCases.map((testCase) =>
        buildDetail(testCase, {
          passed: false,
          message: runnerResult.error || "程式執行失敗"
        })
      )
    };
  }

  const details = selectedCases.map((testCase) => {
    const execution = runnerResult.results.find((item) => item.id === testCase.id);
    if (!execution) {
      return buildDetail(testCase, {
        passed: false,
        message: "找不到測資執行結果"
      });
    }

    const expected = JSON.parse(testCase.expected_json);
    if (!execution.ok) {
      return buildDetail(testCase, {
        passed: false,
        expected,
        error: execution.error,
        stdout: execution.stdout,
        message: "執行時發生錯誤"
      });
    }

    const comparison = compareResult(execution.result, expected, testCase.comparator);
    return buildDetail(testCase, {
      passed: comparison.passed,
      expected: testCase.comparator === "customOutput" ? undefined : expected,
      actual: execution.result,
      stdout: execution.stdout,
      message: comparison.message
    });
  });

  const passedTests = details.filter((detail) => detail.passed).length;
  const score = selectedCases.length === 0 ? 0 : Math.round((passedTests / selectedCases.length) * 100);
  return {
    score,
    passed: passedTests === selectedCases.length,
    passedTests,
    totalTests: selectedCases.length,
    runtimeMs,
    details
  };
}

function buildDetail(testCase, { passed, expected, actual, error, stdout, message }) {
  const isPublic = testCase.visibility === "public";
  const shouldRevealValues = isPublic || !passed;
  return {
    id: testCase.id,
    name: testCase.name,
    visibility: testCase.visibility,
    passed,
    ...(shouldRevealValues
      ? {
          args: JSON.parse(testCase.args_json),
          ...(expected !== undefined ? { expected } : {}),
          ...(actual !== undefined ? { actual } : {}),
          ...(stdout ? { stdout } : {}),
          ...(error ? { error } : {})
        }
      : {}),
    message
  };
}

function runPython(payload) {
  return new Promise((resolve) => {
    const child = spawn(config.pythonBin, [runnerPath], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        child.kill("SIGKILL");
        resolve({ ok: false, error: `程式執行超過 ${config.graderTimeoutMs}ms` });
      }
    }, config.graderTimeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 1024 * 1024) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ ok: false, error: `無法啟動 Python：${error.message}` });
    });
    child.on("close", (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (code !== 0) {
        resolve({ ok: false, error: stderr.trim() || `Python process exited with code ${code}` });
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ ok: false, error: "Python runner 回傳的 JSON 格式錯誤" });
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

function compareResult(actual, expected, comparator) {
  if (comparator === "customOutput") {
    return { passed: true, message: "自訂輸出已執行" };
  }
  if (comparator === "number") {
    return compareNumber(actual, expected);
  }
  if (comparator === "deepNumber") {
    const passed = deepEqualNumber(actual, expected);
    return { passed, message: passed ? "Accepted" : "輸出與預期不一致" };
  }
  const passed = deepEqualStrict(actual, expected);
  return { passed, message: passed ? "Accepted" : "輸出與預期不一致" };
}

function compareNumber(actual, expected) {
  const passed =
    typeof actual === "number" &&
    typeof expected === "number" &&
    Math.abs(actual - expected) <= 0.0001;
  return { passed, message: passed ? "Accepted" : "數值誤差超過 0.0001" };
}

function deepEqualNumber(actual, expected) {
  if (typeof actual === "number" && typeof expected === "number") {
    return Math.abs(actual - expected) <= 0.0001;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return (
      actual.length === expected.length &&
      actual.every((value, index) => deepEqualNumber(value, expected[index]))
    );
  }
  if (isPlainObject(actual) && isPlainObject(expected)) {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    return (
      deepEqualStrict(actualKeys, expectedKeys) &&
      actualKeys.every((key) => deepEqualNumber(actual[key], expected[key]))
    );
  }
  return deepEqualStrict(actual, expected);
}

function deepEqualStrict(actual, expected) {
  return JSON.stringify(normalizeForCompare(actual)) === JSON.stringify(normalizeForCompare(expected));
}

function normalizeForCompare(value) {
  if (Array.isArray(value)) return value.map(normalizeForCompare);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [String(key), normalizeForCompare(value[key])])
    );
  }
  return value;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
