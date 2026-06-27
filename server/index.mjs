import path from "node:path";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { config } from "./config.mjs";
import { getDb } from "./db.mjs";
import { gradeSubmission } from "./grader.mjs";

const app = express();
const db = getDb();
const DAILY_ATTEMPT_LIMIT = 3;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  const problemCount = db.prepare("SELECT COUNT(*) AS count FROM problems").get().count;
  res.json({ ok: true, problemCount });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, studentId, password } = req.body || {};
  const errors = validateStudentRegistration({ name, email, studentId, password });
  if (errors.length) return res.status(400).json({ error: errors.join("；") });

  try {
    const result = db
      .prepare(
        `INSERT INTO users (name, email, student_id, password_hash, role)
         VALUES (@name, @email, @studentId, @passwordHash, 'student')`
      )
      .run({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        studentId: studentId.trim(),
        passwordHash: bcrypt.hashSync(password, 12)
      });

    const user = getUserById(result.lastInsertRowid);
    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Email 或學號已被註冊" });
    }
    throw error;
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "請輸入 Email 與密碼" });

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "帳號或密碼錯誤" });
  }
  res.json({ user: publicUser(user), token: signToken(user) });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/problems", optionalAuth, (req, res) => {
  const week = req.query.week ? Number(req.query.week) : undefined;
  const showClosed = req.user?.role === "admin";
  const where = [
    week ? "week = @week" : "",
    showClosed ? "" : "is_open = 1"
  ].filter(Boolean);
  const problemQuery = db.prepare(
    `SELECT * FROM problems${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY week, id`
  );
  const rows = week ? problemQuery.all({ week }) : problemQuery.all();
  const progress = req.user ? getProgressMap(req.user.id) : new Map();
  res.json({
    problems: rows.map((row) => ({
      ...publicProblem(row),
      bestScore: progress.get(row.id)?.score ?? null,
      submissions: progress.get(row.id)?.submissions ?? 0
    }))
  });
});

app.get("/api/problems/:slug", optionalAuth, (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });
  const publicTests = getTestCases(problem.id, "public").slice(0, 2);
  const best = req.user ? getBestSubmission(req.user.id, problem.id) : null;
  res.json({
    problem: {
      ...publicProblem(problem),
      publicTests: publicTests.map(publicTestCase),
      bestSubmission: best ? publicSubmission(best) : null
    }
  });
});

app.get("/api/leaderboard", (_req, res) => {
  res.json(buildGlobalLeaderboard());
});

app.get("/api/problems/:slug/attempt-state", requireAuth, (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });
  res.json({ attemptState: getAttemptState(req.user.id, problem) });
});

app.post("/api/problems/:slug/attempts/start", requireAuth, (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  if (!problem.is_open && req.user.role !== "admin") {
    return res.status(403).json({ error: "此題目前未開放作答" });
  }

  if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });

  syncExpiredAttempts();
  const state = getAttemptState(req.user.id, problem);
  if (state.activeAttempt) {
    return res.json({ attempt: state.activeAttempt, attemptState: state });
  }
  if (!state.canStart) {
    return res.status(409).json({ error: "已有進行中的作答", attemptState: state });
  }

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + problem.time_limit_seconds * 1000);
  const saved = db
    .prepare(
      `INSERT INTO attempts (user_id, problem_id, day_key, status, started_at, expires_at)
       VALUES (?, ?, ?, 'active', ?, ?)`
    )
    .run(
      req.user.id,
      problem.id,
      getTaipeiDayKey(startedAt),
      startedAt.toISOString(),
      expiresAt.toISOString()
    );

  const attempt = getAttemptById(saved.lastInsertRowid);
  res.status(201).json({
    attempt: publicAttempt(attempt),
    attemptState: getAttemptState(req.user.id, problem)
  });
});

app.post("/api/attempts/:id/abandon", (req, res) => {
  const user = readUserFromRequest(req) || readUserFromBodyToken(req);
  if (!user) return res.status(401).json({ error: "請先登入" });
  const attempt = getAttemptById(Number(req.params.id));
  if (!attempt || attempt.user_id !== user.id) return res.status(404).json({ error: "找不到作答紀錄" });
  if (attempt.status === "active") {
    endAttempt(attempt.id, "abandoned", 0, null, "離開題目頁");
  }
  res.json({ attempt: publicAttempt(getAttemptById(attempt.id)) });
});

app.post("/api/attempts/:id/timeout", requireAuth, (req, res) => {
  const attempt = getAttemptById(Number(req.params.id));
  if (!attempt || attempt.user_id !== req.user.id) return res.status(404).json({ error: "找不到作答紀錄" });
  if (attempt.status === "active") {
    endAttempt(attempt.id, "timed_out", 0, null, "作答時間結束");
  }
  res.json({ attempt: publicAttempt(getAttemptById(attempt.id)) });
});

app.post("/api/attempts/:id/focus-violation", requireAuth, (req, res) => {
  const attempt = getAttemptById(Number(req.params.id));
  if (!attempt || attempt.user_id !== req.user.id) return res.status(404).json({ error: "找不到作答紀錄" });
  const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(attempt.problem_id);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  if (attempt.status !== "active") {
    return res.status(409).json({
      error: "本次作答已結束",
      attemptState: getAttemptState(req.user.id, problem)
    });
  }
  if (new Date(attempt.expires_at).getTime() <= Date.now()) {
    endAttempt(attempt.id, "timed_out", 0, null, "作答時間已到");
    return res.status(409).json({
      error: "作答時間已到",
      attemptState: getAttemptState(req.user.id, problem)
    });
  }

  db.prepare("UPDATE attempts SET focus_violations = focus_violations + 1 WHERE id = ?").run(attempt.id);
  const updated = getAttemptById(attempt.id);
  const maxWarnings = 2;
  res.json({
    attempt: publicAttempt(updated),
    attemptState: getAttemptState(req.user.id, problem),
    violationCount: updated.focus_violations,
    maxWarnings,
    shouldForceSubmit: updated.focus_violations > maxWarnings
  });
});

app.post("/api/problems/:slug/run", requireAuth, async (req, res, next) => {
  try {
    const problem = getProblemBySlug(req.params.slug);
    if (!problem) return res.status(404).json({ error: "找不到題目" });
    if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });
    const code = String(req.body?.code || "");
    if (!code.trim()) return res.status(400).json({ error: "請提交程式碼" });
    const attempt = requireActiveAttempt(req, problem);
    const testCases = buildRunnableTestCases(problem.id, req.body?.sampleCases);
    const result = await gradeSubmission({
      functionName: problem.function_name,
      code,
      testCases,
      publicOnly: false
    });
    res.json({ result, attempt: publicAttempt(attempt) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/problems/:slug/submit", requireAuth, async (req, res, next) => {
  try {
    const problem = getProblemBySlug(req.params.slug);
    if (!problem) return res.status(404).json({ error: "找不到題目" });
    if (!problem.is_open && req.user.role !== "admin") {
      return res.status(403).json({ error: "此題目前未開放提交" });
    }
    if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });
    const code = String(req.body?.code || "");
    if (!code.trim()) return res.status(400).json({ error: "請提交程式碼" });
    const attempt = requireActiveAttempt(req, problem);
    const state = getAttemptState(req.user.id, problem);
    if (state.remainingAttempts <= 0) {
      return res.status(429).json({
        error: `今日本題 submit ${DAILY_ATTEMPT_LIMIT} 次已用完，請等午夜重置`,
        attemptState: state
      });
    }
    const testCases = getTestCases(problem.id);
    const result = await gradeSubmission({
      functionName: problem.function_name,
      code,
      testCases,
      publicOnly: false
    });
    const saved = db
      .prepare(
        `INSERT INTO submissions (
          user_id, problem_id, code, score, passed, passed_tests, total_tests, runtime_ms, details_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.user.id,
        problem.id,
        code,
        result.score,
        result.passed ? 1 : 0,
        result.passedTests,
        result.totalTests,
        result.runtimeMs,
        JSON.stringify(result.details)
      );

    endAttempt(
      attempt.id,
      result.passed ? "passed" : "failed",
      result.score,
      saved.lastInsertRowid,
      result.passed ? "提交通過" : "提交未通過"
    );

    res.status(201).json({
      result,
      submission: publicSubmission(getSubmissionById(saved.lastInsertRowid)),
      attempt: publicAttempt(getAttemptById(attempt.id))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/me/progress", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT
        p.id,
        p.slug,
        p.title,
        p.week,
        COUNT(s.id) AS submissions,
        MAX(s.score) AS best_score,
        MAX(s.created_at) AS last_submission
       FROM problems p
       LEFT JOIN submissions s ON s.problem_id = p.id AND s.user_id = ?
       WHERE (? = 'admin' OR p.is_open = 1)
       GROUP BY p.id
       ORDER BY p.week, p.id`
    )
    .all(req.user.id, req.user.role);
  res.json({ progress: rows });
});

app.get("/api/admin/dashboard", requireAdmin, (_req, res) => {
  const counts = {
    students: db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student'").get().count,
    problems: db.prepare("SELECT COUNT(*) AS count FROM problems").get().count,
    openProblems: db.prepare("SELECT COUNT(*) AS count FROM problems WHERE is_open = 1").get().count,
    submissions: db.prepare("SELECT COUNT(*) AS count FROM submissions").get().count,
    attempts: db.prepare("SELECT COUNT(*) AS count FROM attempts").get().count,
    passedSubmissions: db.prepare("SELECT COUNT(*) AS count FROM submissions WHERE passed = 1").get().count
  };
  const weekStats = db
    .prepare(
      `SELECT p.week, COUNT(DISTINCT p.id) AS problems, COUNT(s.id) AS submissions, AVG(s.score) AS average_score
       FROM problems p
       LEFT JOIN submissions s ON s.problem_id = p.id
       GROUP BY p.week
       ORDER BY p.week`
    )
    .all();
  const recentSubmissions = db
    .prepare(
      `SELECT s.id, s.score, s.passed, s.created_at, u.name, u.student_id, p.title, p.week
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       JOIN problems p ON p.id = s.problem_id
       ORDER BY s.created_at DESC
       LIMIT 20`
    )
    .all();

  res.json({ counts, weekStats, recentSubmissions });
});

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  const users = db
    .prepare(
      `SELECT id, name, email, student_id, role, created_at
       FROM users
       ORDER BY created_at DESC`
    )
    .all();
  res.json({ users });
});

app.get("/api/admin/problems", requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM problems ORDER BY week, id").all();
  res.json({ problems: rows.map(publicProblem) });
});

app.post("/api/admin/problems", requireAdmin, (req, res) => {
  const parsed = normalizeProblemPayload(req.body || {});
  if (parsed.errors.length) {
    return res.status(400).json({ error: parsed.errors.join("；") });
  }

  const createProblem = db.transaction((problem) => {
    const result = db
      .prepare(
        `INSERT INTO problems (
          slug, week, series_title, title, difficulty, category, time_limit_seconds,
          function_name, signature_json, statement, input_format, output_format,
          constraints_text, starter_code, is_open
        )
        VALUES (
          @slug, @week, @seriesTitle, @title, @difficulty, @category, @timeLimitSeconds,
          @functionName, @signatureJson, @statement, @inputFormat, @outputFormat,
          @constraintsText, @starterCode, @isOpen
        )`
      )
      .run({
        ...problem,
        signatureJson: JSON.stringify(problem.signature),
        isOpen: problem.isOpen ? 1 : 0
      });

    const insertCase = db.prepare(
      `INSERT INTO test_cases (problem_id, name, visibility, args_json, expected_json, comparator, points)
       VALUES (@problemId, @name, @visibility, @argsJson, @expectedJson, @comparator, @points)`
    );
    for (const testCase of problem.tests) {
      insertCase.run({
        problemId: result.lastInsertRowid,
        name: testCase.name,
        visibility: testCase.visibility,
        argsJson: JSON.stringify(testCase.args),
        expectedJson: JSON.stringify(testCase.expected),
        comparator: testCase.comparator,
        points: testCase.points
      });
    }
    return result.lastInsertRowid;
  });

  try {
    const id = createProblem(parsed.problem);
    const created = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
    res.status(201).json({
      problem: {
        ...publicProblem(created),
        publicTests: getTestCases(id, "public").slice(0, 2).map(publicTestCase)
      }
    });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "題目 slug 已存在，請換一個 slug 或標題。" });
    }
    throw error;
  }
});

app.patch("/api/admin/problems/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const isOpen = req.body?.isOpen ? 1 : 0;
  const result = db.prepare("UPDATE problems SET is_open = ? WHERE id = ?").run(isOpen, id);
  if (!result.changes) return res.status(404).json({ error: "找不到題目" });
  res.json({ problem: publicProblem(db.prepare("SELECT * FROM problems WHERE id = ?").get(id)) });
});

app.get("/api/admin/submissions", requireAdmin, (_req, res) => {
  const submissions = db
    .prepare(
      `SELECT s.id, s.score, s.passed, s.passed_tests, s.total_tests, s.runtime_ms, s.created_at,
              u.name, u.email, u.student_id, p.slug, p.title, p.week
       FROM submissions s
       JOIN users u ON u.id = s.user_id
       JOIN problems p ON p.id = s.problem_id
       ORDER BY s.created_at DESC
       LIMIT 200`
    )
    .all();
  res.json({ submissions });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "找不到 API" });
});

const distDir = path.join(config.rootDir, "dist");
app.use(express.static(distDir));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON 格式不正確" });
  }
  if (error?.status) {
    return res.status(error.status).json({
      error: error.message,
      attemptState: error.attemptState
    });
  }
  console.error(error);
  res.status(500).json({ error: "伺服器發生錯誤" });
});

app.listen(config.port, () => {
  console.log(`DataArena listening on http://0.0.0.0:${config.port}`);
  console.log(`Admin email: ${config.adminEmail}`);
});

function validateStudentRegistration({ name, email, studentId, password }) {
  const errors = [];
  if (!String(name || "").trim()) errors.push("請輸入姓名");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ""))) errors.push("Email 格式不正確");
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(String(studentId || ""))) {
    errors.push("學號需為 4-32 碼英數字、底線或連字號");
  }
  if (String(password || "").length < 8) errors.push("密碼至少 8 碼");
  return errors;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: "12h" });
}

function requireAuth(req, res, next) {
  const user = readUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "請先登入" });
  req.user = user;
  next();
}

function optionalAuth(req, _res, next) {
  req.user = readUserFromRequest(req);
  next();
}

function requireAdmin(req, res, next) {
  const user = readUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "請先登入" });
  if (user.role !== "admin") return res.status(403).json({ error: "需要管理員權限" });
  req.user = user;
  next();
}

function readUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token) return null;
  return readUserFromToken(token);
}

function readUserFromBodyToken(req) {
  return readUserFromToken(req.body?.token);
}

function readUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return getUserById(payload.sub);
  } catch {
    return null;
  }
}

function getUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.student_id,
    role: user.role,
    createdAt: user.created_at
  };
}

function getProblemBySlug(slug) {
  return db.prepare("SELECT * FROM problems WHERE slug = ?").get(slug);
}

function canSeeProblem(user, problem) {
  return Boolean(problem?.is_open || user?.role === "admin");
}

function getTestCases(problemId, visibility) {
  const sql = visibility
    ? "SELECT * FROM test_cases WHERE problem_id = ? AND visibility = ? ORDER BY id"
    : "SELECT * FROM test_cases WHERE problem_id = ? ORDER BY id";
  return visibility
    ? db.prepare(sql).all(problemId, visibility)
    : db.prepare(sql).all(problemId);
}

function publicProblem(row) {
  return {
    id: row.id,
    slug: row.slug,
    week: row.week,
    seriesTitle: row.series_title,
    title: row.title,
    difficulty: row.difficulty,
    category: row.category,
    timeLimitSeconds: row.time_limit_seconds,
    functionName: row.function_name,
    signature: JSON.parse(row.signature_json),
    statement: row.statement,
    inputFormat: row.input_format,
    outputFormat: row.output_format,
    constraintsText: row.constraints_text,
    starterCode: row.starter_code,
    isOpen: Boolean(row.is_open)
  };
}

function publicTestCase(row) {
  return {
    id: row.id,
    name: row.name,
    args: JSON.parse(row.args_json),
    expected: JSON.parse(row.expected_json),
    comparator: row.comparator
  };
}

function normalizeProblemPayload(body) {
  const errors = [];
  const week = Number(body.week);
  const difficulty = Number(body.difficulty);
  const timeLimitSeconds = Number(body.timeLimitSeconds || body.time_limit_seconds || 1800);
  const title = String(body.title || "").trim();
  const functionName = String(body.functionName || "").trim();
  const signature = Array.isArray(body.signature)
    ? body.signature.map((item) => String(item).trim()).filter(Boolean)
    : String(body.signature || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const tests = Array.isArray(body.tests) ? body.tests : [];

  if (!Number.isInteger(week) || week < 1 || week > 99) errors.push("週次必須是 1 到 99 的整數");
  if (!title) errors.push("請填寫題目標題");
  if (!String(body.statement || "").trim()) errors.push("請填寫題目敘述");
  if (!String(body.inputFormat || "").trim()) errors.push("請填寫輸入格式");
  if (!String(body.outputFormat || "").trim()) errors.push("請填寫輸出格式");
  if (!String(body.constraintsText || "").trim()) errors.push("請填寫限制條件");
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 3) errors.push("難度必須是 1、2 或 3");
  if (!/^[A-Za-z_]\w*$/.test(functionName)) errors.push("函式名稱只能使用 Python identifier，例如 two_sum");
  if (signature.length === 0) errors.push("至少需要一個函式參數");
  for (const arg of signature) {
    if (!/^[A-Za-z_]\w*$/.test(arg)) errors.push(`參數名稱 ${arg} 不是合法 Python identifier`);
  }
  if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds < 60 || timeLimitSeconds > 7200) {
    errors.push("時間限制必須介於 60 到 7200 秒");
  }

  const normalizedTests = tests.map((testCase, index) => normalizeTestCase(testCase, index, errors));
  if (normalizedTests.length === 0) errors.push("至少需要一筆測資");
  if (!normalizedTests.some((testCase) => testCase.visibility === "public")) {
    errors.push("至少需要一筆 public 測資，學生才會看到範例測資");
  }

  const slugBase = String(body.slug || "").trim() || `${week}-${title}`;
  const slug = uniqueSlug(slugify(slugBase));
  const starterCode =
    String(body.starterCode || "").trim() ||
    `def ${functionName}(${signature.join(", ")}):\n    # TODO: implement your solution\n    pass\n`;

  return {
    errors,
    problem: {
      slug,
      week,
      seriesTitle: String(body.seriesTitle || `Week ${week}`).trim(),
      title,
      difficulty,
      category: String(body.category || "Python").trim(),
      timeLimitSeconds,
      functionName,
      signature,
      statement: String(body.statement || "").trim(),
      inputFormat: String(body.inputFormat || "").trim(),
      outputFormat: String(body.outputFormat || "").trim(),
      constraintsText: String(body.constraintsText || "").trim(),
      starterCode,
      isOpen: body.isOpen !== false,
      tests: normalizedTests
    }
  };
}

function normalizeTestCase(testCase, index, errors) {
  const visibility = testCase?.visibility === "hidden" ? "hidden" : "public";
  const comparator = ["exact", "number", "deepNumber"].includes(testCase?.comparator)
    ? testCase.comparator
    : "exact";
  const args = testCase?.args;
  if (!Array.isArray(args)) {
    errors.push(`第 ${index + 1} 筆測資 args 必須是陣列，代表要傳給函式的參數列表`);
  }
  if (!Object.prototype.hasOwnProperty.call(testCase || {}, "expected")) {
    errors.push(`第 ${index + 1} 筆測資缺少 expected`);
  }
  return {
    name: String(testCase?.name || `Case ${index + 1}`).trim(),
    visibility,
    args: Array.isArray(args) ? args : [],
    expected: testCase?.expected,
    comparator,
    points: Number.isInteger(Number(testCase?.points)) && Number(testCase.points) > 0
      ? Number(testCase.points)
      : 1
  };
}

function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `problem-${Date.now()}`;
}

function uniqueSlug(base) {
  let next = base;
  let suffix = 2;
  while (db.prepare("SELECT id FROM problems WHERE slug = ?").get(next)) {
    next = `${base}-${suffix}`;
    suffix += 1;
  }
  return next;
}

function buildRunnableTestCases(problemId, sampleCases) {
  if (!Array.isArray(sampleCases) || sampleCases.length === 0) {
    return getTestCases(problemId, "public").slice(0, 2);
  }
  return sampleCases.slice(0, 6).map((testCase, index) => {
    const hasExpected = Object.prototype.hasOwnProperty.call(testCase, "expected");
    return {
      id: Number(testCase.id) || -(index + 1),
      name: String(testCase.name || `Custom ${index + 1}`),
      visibility: "public",
      args_json: JSON.stringify(Array.isArray(testCase.args) ? testCase.args : []),
      expected_json: JSON.stringify(hasExpected ? testCase.expected : null),
      comparator: hasExpected ? String(testCase.comparator || "exact") : "customOutput",
      points: 1
    };
  });
}

function syncExpiredAttempts() {
  db
    .prepare(
      `UPDATE attempts
       SET status = 'timed_out',
           ended_at = ?,
           end_reason = '作答時間結束'
       WHERE status = 'active' AND expires_at <= ?`
    )
    .run(new Date().toISOString(), new Date().toISOString());
}

function getAttemptState(userId, problem) {
  syncExpiredAttempts();
  const dayKey = getTaipeiDayKey();
  const attempts = db
    .prepare(
      `SELECT *
       FROM attempts
       WHERE user_id = ? AND problem_id = ? AND day_key = ?
       ORDER BY started_at DESC`
    )
    .all(userId, problem.id, dayKey);
  const active = attempts.find((attempt) => attempt.status === "active") || null;
  const dailyUsed = attempts.filter((attempt) => attempt.status === "passed" || attempt.status === "failed").length;
  return {
    dailyLimit: DAILY_ATTEMPT_LIMIT,
    dailyUsed,
    remainingAttempts: Math.max(0, DAILY_ATTEMPT_LIMIT - dailyUsed),
    canStart: Boolean(problem.is_open) && !active,
    canSubmit: dailyUsed < DAILY_ATTEMPT_LIMIT,
    activeAttempt: active ? publicAttempt(active) : null,
    nextResetAt: getNextTaipeiMidnightIso()
  };
}

function requireActiveAttempt(req, problem) {
  const attemptId = Number(req.body?.attemptId);
  if (!Number.isInteger(attemptId) || attemptId <= 0) {
    throwHttp(400, "請先按開始作答");
  }
  const attempt = getAttemptById(attemptId);
  if (!attempt || attempt.user_id !== req.user.id || attempt.problem_id !== problem.id) {
    throwHttp(404, "找不到作答紀錄");
  }
  if (attempt.status !== "active") {
    throwHttp(409, "這次作答已結束，請重新開始作答", getAttemptState(req.user.id, problem));
  }
  if (new Date(attempt.expires_at).getTime() <= Date.now()) {
    endAttempt(attempt.id, "timed_out", 0, null, "作答時間結束");
    throwHttp(409, "作答時間已結束，本次作答已記錄為逾時", getAttemptState(req.user.id, problem));
  }
  return attempt;
}

function getAttemptById(id) {
  return db.prepare("SELECT * FROM attempts WHERE id = ?").get(id);
}

function endAttempt(id, status, score = 0, submissionId = null, reason = "") {
  db
    .prepare(
      `UPDATE attempts
       SET status = ?,
           ended_at = ?,
           score = ?,
           submission_id = ?,
           end_reason = ?
       WHERE id = ? AND status = 'active'`
    )
    .run(status, new Date().toISOString(), score, submissionId, reason, id);
}

function publicAttempt(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    dayKey: row.day_key,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    endedAt: row.ended_at,
    score: row.score,
    focusViolations: row.focus_violations || 0,
    endReason: row.end_reason
  };
}

function getTaipeiDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getNextTaipeiMidnightIso(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 16, 0, 0)).toISOString();
}

function throwHttp(status, message, attemptState) {
  const error = new Error(message);
  error.status = status;
  error.attemptState = attemptState;
  throw error;
}

function buildGlobalLeaderboard() {
  const students = db
    .prepare("SELECT id, name, student_id FROM users WHERE role = 'student' ORDER BY name, id")
    .all();
  const problems = db.prepare("SELECT id FROM problems WHERE is_open = 1 ORDER BY week, id").all();
  const submissions = db
    .prepare(
      `SELECT user_id, problem_id, score, passed, runtime_ms, created_at
       FROM submissions
       ORDER BY created_at ASC`
    )
    .all();

  const explanation = {
    title: "全站排行榜計算方式",
    summary: "排行榜不是單題排名，而是把全部題目的題目排名取平均，形成全站平均題目排名。平均題目排名越小，總榜越前面。",
    perProblemScore:
      "每題先計算題目分：最佳通過率 70% + 時間效率 15% + submit 次數效率 10% + 失敗次數效率 5%。",
    ranking:
      "每題依題目分排序得到該題排名；未提交該題會排在該題最後。總榜依 50 題平均題目排名排序。",
    tieBreakers:
      "平均題目排名相同時，依序比較解題數、平均題目分、總執行時間、總 submit 次數、總失敗次數。"
  };

  if (students.length === 0 || problems.length === 0) {
    return { leaderboard: [], explanation, problemCount: problems.length };
  }

  const submissionsByKey = new Map();
  for (const submission of submissions) {
    const key = `${submission.user_id}:${submission.problem_id}`;
    submissionsByKey.set(key, [...(submissionsByKey.get(key) || []), submission]);
  }

  const totals = new Map(
    students.map((student) => [
      student.id,
      {
        userId: student.id,
        name: student.name,
        studentId: student.student_id,
        rankSum: 0,
        problemScoreSum: 0,
        solvedProblems: 0,
        attemptedProblems: 0,
        totalSubmissions: 0,
        totalFailures: 0,
        totalRuntimeMs: 0
      }
    ])
  );

  for (const problem of problems) {
    const problemSubmissions = submissions.filter((submission) => submission.problem_id === problem.id);
    const fastestRuntime = problemSubmissions.reduce((fastest, submission) => {
      if (!submission.runtime_ms) return fastest;
      return Math.min(fastest, submission.runtime_ms);
    }, Number.POSITIVE_INFINITY);

    const standings = students.map((student) => {
      const userSubmissions = submissionsByKey.get(`${student.id}:${problem.id}`) || [];
      const submitCount = userSubmissions.length;
      const failCount = userSubmissions.filter((submission) => !submission.passed).length;
      const bestScore = submitCount ? Math.max(...userSubmissions.map((submission) => submission.score)) : 0;
      const bestRuntime = submitCount
        ? userSubmissions
            .filter((submission) => submission.score === bestScore)
            .reduce((best, submission) => Math.min(best, submission.runtime_ms || Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY)
        : Number.POSITIVE_INFINITY;
      const solved = userSubmissions.some((submission) => Boolean(submission.passed));
      const timeScore = Number.isFinite(bestRuntime) && Number.isFinite(fastestRuntime) && fastestRuntime > 0
        ? 15 * (fastestRuntime / bestRuntime)
        : 0;
      const submitEfficiency = submitCount ? 10 / submitCount : 0;
      const failureEfficiency = submitCount ? 5 / (failCount + 1) : 0;
      const problemScore = submitCount ? bestScore * 0.7 + timeScore + submitEfficiency + failureEfficiency : 0;
      return {
        userId: student.id,
        submitCount,
        failCount,
        bestScore,
        bestRuntime,
        solved,
        problemScore
      };
    });

    standings.sort((a, b) => {
      if (b.problemScore !== a.problemScore) return b.problemScore - a.problemScore;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      if (a.bestRuntime !== b.bestRuntime) return a.bestRuntime - b.bestRuntime;
      if (a.failCount !== b.failCount) return a.failCount - b.failCount;
      if (a.submitCount !== b.submitCount) return a.submitCount - b.submitCount;
      return a.userId - b.userId;
    });

    standings.forEach((standing, index) => {
      const total = totals.get(standing.userId);
      const rank = standing.submitCount ? index + 1 : students.length;
      total.rankSum += rank;
      total.problemScoreSum += standing.problemScore;
      total.solvedProblems += standing.solved ? 1 : 0;
      total.attemptedProblems += standing.submitCount ? 1 : 0;
      total.totalSubmissions += standing.submitCount;
      total.totalFailures += standing.failCount;
      total.totalRuntimeMs += Number.isFinite(standing.bestRuntime) ? standing.bestRuntime : 0;
    });
  }

  const leaderboard = [...totals.values()]
    .map((total) => ({
      ...total,
      averageRank: round2(total.rankSum / problems.length),
      averageProblemScore: round2(total.problemScoreSum / problems.length)
    }))
    .sort((a, b) => {
      if (a.averageRank !== b.averageRank) return a.averageRank - b.averageRank;
      if (b.solvedProblems !== a.solvedProblems) return b.solvedProblems - a.solvedProblems;
      if (b.averageProblemScore !== a.averageProblemScore) return b.averageProblemScore - a.averageProblemScore;
      if (a.totalRuntimeMs !== b.totalRuntimeMs) return a.totalRuntimeMs - b.totalRuntimeMs;
      if (a.totalSubmissions !== b.totalSubmissions) return a.totalSubmissions - b.totalSubmissions;
      if (a.totalFailures !== b.totalFailures) return a.totalFailures - b.totalFailures;
      return a.name.localeCompare(b.name);
    })
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.name,
      studentId: entry.studentId,
      averageRank: entry.averageRank,
      averageProblemScore: entry.averageProblemScore,
      solvedProblems: entry.solvedProblems,
      attemptedProblems: entry.attemptedProblems,
      totalSubmissions: entry.totalSubmissions,
      totalFailures: entry.totalFailures,
      totalRuntimeMs: entry.totalRuntimeMs,
      problemCount: problems.length
    }));

  return { leaderboard, explanation, problemCount: problems.length };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function getProgressMap(userId) {
  const rows = db
    .prepare(
      `SELECT problem_id, COUNT(*) AS submissions, MAX(score) AS score
       FROM submissions
       WHERE user_id = ?
       GROUP BY problem_id`
    )
    .all(userId);
  return new Map(rows.map((row) => [row.problem_id, row]));
}

function getBestSubmission(userId, problemId) {
  return db
    .prepare(
      `SELECT * FROM submissions
       WHERE user_id = ? AND problem_id = ?
       ORDER BY score DESC, runtime_ms ASC, created_at ASC
       LIMIT 1`
    )
    .get(userId, problemId);
}

function getSubmissionById(id) {
  return db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
}

function publicSubmission(row) {
  return {
    id: row.id,
    score: row.score,
    passed: Boolean(row.passed),
    passedTests: row.passed_tests,
    totalTests: row.total_tests,
    runtimeMs: row.runtime_ms,
    details: JSON.parse(row.details_json),
    createdAt: row.created_at
  };
}
