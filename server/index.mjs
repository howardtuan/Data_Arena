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
  const isAdmin = req.user?.role === "admin";
  const visibleRows = rows.filter((row) => isAdmin || contestStatusOf(row) !== "upcoming");
  const progress = req.user ? getProgressMap(req.user.id) : new Map();
  res.json({
    problems: visibleRows.map((row) => ({
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
  const savedCode = req.user ? getSavedCode(req.user.id, problem.id) : null;
  res.json({
    problem: {
      ...publicProblem(problem),
      publicTests: publicTests.map(publicTestCase),
      savedCode: savedCode?.code ?? null,
      bestSubmission: best ? publicSubmission(best) : null
    }
  });
});

app.get("/api/problems/:slug/submissions", requireAuth, (req, res) => {
  const problem = getProblemBySlug(req.params.slug);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  if (!canSeeProblem(req.user, problem)) return res.status(404).json({ error: "找不到題目" });
  const submissions = db
    .prepare(
      `SELECT *
       FROM submissions
       WHERE user_id = ? AND problem_id = ?
       ORDER BY created_at DESC
       LIMIT 50`
    )
    .all(req.user.id, problem.id);
  res.json({ submissions: submissions.map(publicSubmission) });
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
    saveProblemCode(req.user.id, problem.id, code, "run");
    const testCases = buildRunnableTestCases(problem.id, req.body?.sampleCases);
    const result = await gradeSubmission({
      functionName: problem.function_name,
      code,
      testCases,
      publicOnly: false
    });
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

const SUBMIT_WINDOW_MS = 60 * 1000;
const SUBMIT_MAX_PER_WINDOW = Number(process.env.SUBMIT_MAX_PER_MIN || 12);
const SUBMIT_MIN_GAP_MS = Number(process.env.SUBMIT_MIN_GAP_MS || 3000);
const submitHistory = new Map();

function checkSubmitRate(userId) {
  const now = Date.now();
  const history = (submitHistory.get(userId) || []).filter((ts) => now - ts < SUBMIT_WINDOW_MS);
  if (history.length > 0 && now - history[history.length - 1] < SUBMIT_MIN_GAP_MS) {
    return { ok: false, retryAfter: Math.ceil((SUBMIT_MIN_GAP_MS - (now - history[history.length - 1])) / 1000) };
  }
  if (history.length >= SUBMIT_MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((SUBMIT_WINDOW_MS - (now - history[0])) / 1000) };
  }
  history.push(now);
  submitHistory.set(userId, history);
  return { ok: true };
}

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
    if (req.user.role !== "admin") {
      const rate = checkSubmitRate(req.user.id);
      if (!rate.ok) {
        return res.status(429).json({ error: `提交太頻繁，請 ${rate.retryAfter} 秒後再試。` });
      }
    }
    saveProblemCode(req.user.id, problem.id, code, "submit");
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
          user_id, problem_id, code, score, passed, passed_tests, total_tests, runtime_ms, peak_memory, details_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        result.peakMemory ?? 0,
        JSON.stringify(result.details)
      );

    res.status(201).json({
      result,
      submission: publicSubmission(getSubmissionById(saved.lastInsertRowid))
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
        p.title_en,
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
          series_title_en, title_en, category_en,
          function_name, signature_json, statement, statement_en, input_format, input_format_en,
          output_format, output_format_en, constraints_text, constraints_text_en,
          starter_code, is_open
        )
        VALUES (
          @slug, @week, @seriesTitle, @title, @difficulty, @category, @timeLimitSeconds,
          @seriesTitleEn, @titleEn, @categoryEn,
          @functionName, @signatureJson, @statement, @statementEn, @inputFormat, @inputFormatEn,
          @outputFormat, @outputFormatEn, @constraintsText, @constraintsTextEn,
          @starterCode, @isOpen
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
  const existing = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "找不到題目" });
  const body = req.body || {};
  const updates = [];
  const values = [];
  if ("isOpen" in body) {
    updates.push("is_open = ?");
    values.push(body.isOpen ? 1 : 0);
  }
  if ("isContest" in body) {
    updates.push("is_contest = ?");
    values.push(body.isContest ? 1 : 0);
  }
  if ("opensAt" in body) {
    if (body.opensAt && normalizeIsoOrNull(body.opensAt) === null) {
      return res.status(400).json({ error: "開放時間格式不正確" });
    }
    updates.push("opens_at = ?");
    values.push(normalizeIsoOrNull(body.opensAt));
  }
  if ("closesAt" in body) {
    if (body.closesAt && normalizeIsoOrNull(body.closesAt) === null) {
      return res.status(400).json({ error: "關閉時間格式不正確" });
    }
    updates.push("closes_at = ?");
    values.push(normalizeIsoOrNull(body.closesAt));
  }
  const finalOpens = "opensAt" in body ? normalizeIsoOrNull(body.opensAt) : existing.opens_at;
  const finalCloses = "closesAt" in body ? normalizeIsoOrNull(body.closesAt) : existing.closes_at;
  if (finalOpens && finalCloses && Date.parse(finalOpens) >= Date.parse(finalCloses)) {
    return res.status(400).json({ error: "開放時間必須早於關閉時間" });
  }
  if (updates.length) {
    values.push(id);
    db.prepare(`UPDATE problems SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }
  res.json({ problem: publicProblem(db.prepare("SELECT * FROM problems WHERE id = ?").get(id)) });
});

app.get("/api/admin/problems/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
  if (!problem) return res.status(404).json({ error: "找不到題目" });
  const tests = getTestCases(problem.id).map((row) => ({
    id: row.id,
    name: row.name,
    visibility: row.visibility,
    args: JSON.parse(row.args_json),
    expected: JSON.parse(row.expected_json),
    comparator: row.comparator,
    points: row.points
  }));
  res.json({ problem: { ...publicProblem(problem), tests } });
});

app.put("/api/admin/problems/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "找不到題目" });
  const parsed = normalizeProblemPayload(req.body || {}, { keepSlug: existing.slug });
  if (parsed.errors.length) {
    return res.status(400).json({ error: parsed.errors.join("；") });
  }
  const problem = parsed.problem;
  const updateProblem = db.transaction(() => {
    db.prepare(
      `UPDATE problems SET
         week = @week, series_title = @seriesTitle, series_title_en = @seriesTitleEn,
         title = @title, title_en = @titleEn, difficulty = @difficulty,
         category = @category, category_en = @categoryEn, time_limit_seconds = @timeLimitSeconds,
         function_name = @functionName, signature_json = @signatureJson,
         statement = @statement, statement_en = @statementEn,
         input_format = @inputFormat, input_format_en = @inputFormatEn,
         output_format = @outputFormat, output_format_en = @outputFormatEn,
         constraints_text = @constraintsText, constraints_text_en = @constraintsTextEn,
         starter_code = @starterCode, is_open = @isOpen
       WHERE id = @id`
    ).run({
      ...problem,
      signatureJson: JSON.stringify(problem.signature),
      isOpen: problem.isOpen ? 1 : 0,
      id
    });
    db.prepare("DELETE FROM test_cases WHERE problem_id = ?").run(id);
    const insertCase = db.prepare(
      `INSERT INTO test_cases (problem_id, name, visibility, args_json, expected_json, comparator, points)
       VALUES (@problemId, @name, @visibility, @argsJson, @expectedJson, @comparator, @points)`
    );
    for (const testCase of problem.tests) {
      insertCase.run({
        problemId: id,
        name: testCase.name,
        visibility: testCase.visibility,
        argsJson: JSON.stringify(testCase.args),
        expectedJson: JSON.stringify(testCase.expected),
        comparator: testCase.comparator,
        points: testCase.points
      });
    }
  });
  updateProblem();
  const updated = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
  res.json({
    problem: {
      ...publicProblem(updated),
      publicTests: getTestCases(id, "public").slice(0, 2).map(publicTestCase)
    }
  });
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
  if (user?.role === "admin") return true;
  if (!problem?.is_open) return false;
  if (contestStatusOf(problem) === "upcoming") return false;
  return true;
}

function contestStatusOf(problem, now = Date.now()) {
  if (!problem || !problem.is_contest) return null;
  const opens = problem.opens_at ? Date.parse(problem.opens_at) : null;
  const closes = problem.closes_at ? Date.parse(problem.closes_at) : null;
  if (opens !== null && !Number.isNaN(opens) && now < opens) return "upcoming";
  if (closes !== null && !Number.isNaN(closes) && now > closes) return "ended";
  return "active";
}

function normalizeIsoOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return null;
  return new Date(ts).toISOString();
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
    seriesTitleEn: row.series_title_en || "",
    title: row.title,
    titleEn: row.title_en || "",
    difficulty: row.difficulty,
    category: row.category,
    categoryEn: row.category_en || "",
    timeLimitSeconds: row.time_limit_seconds,
    functionName: row.function_name,
    signature: JSON.parse(row.signature_json),
    statement: row.statement,
    statementEn: row.statement_en || "",
    inputFormat: row.input_format,
    inputFormatEn: row.input_format_en || "",
    outputFormat: row.output_format,
    outputFormatEn: row.output_format_en || "",
    constraintsText: row.constraints_text,
    constraintsTextEn: row.constraints_text_en || "",
    starterCode: row.starter_code,
    isOpen: Boolean(row.is_open),
    isContest: Boolean(row.is_contest),
    opensAt: row.opens_at || null,
    closesAt: row.closes_at || null,
    contestStatus: contestStatusOf(row)
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

function normalizeProblemPayload(body, options = {}) {
  const errors = [];
  const week = Number(body.week);
  const difficulty = Number(body.difficulty);
  const timeLimitSeconds = Number(body.timeLimitSeconds || body.time_limit_seconds || 1800);
  const title = String(body.title || "").trim();
  const titleEn = String(body.titleEn || body.title_en || "").trim();
  const seriesTitle = String(body.seriesTitle || `Week ${week}`).trim();
  const seriesTitleEn = String(body.seriesTitleEn || body.series_title_en || "").trim();
  const category = String(body.category || "Python").trim();
  const categoryEn = String(body.categoryEn || body.category_en || "").trim();
  const statement = String(body.statement || "").trim();
  const statementEn = String(body.statementEn || body.statement_en || "").trim();
  const inputFormat = String(body.inputFormat || body.input_format || "").trim();
  const inputFormatEn = String(body.inputFormatEn || body.input_format_en || "").trim();
  const outputFormat = String(body.outputFormat || body.output_format || "").trim();
  const outputFormatEn = String(body.outputFormatEn || body.output_format_en || "").trim();
  const constraintsText = String(body.constraintsText || body.constraints_text || "").trim();
  const constraintsTextEn = String(body.constraintsTextEn || body.constraints_text_en || "").trim();
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
  if (!titleEn) errors.push("請填寫英文題目標題");
  if (!seriesTitleEn) errors.push("請填寫英文系列名稱");
  if (!categoryEn) errors.push("請填寫英文分類");
  if (!statement) errors.push("請填寫題目敘述");
  if (!statementEn) errors.push("請填寫英文題目敘述");
  if (!inputFormat) errors.push("請填寫輸入格式");
  if (!inputFormatEn) errors.push("請填寫英文輸入格式");
  if (!outputFormat) errors.push("請填寫輸出格式");
  if (!outputFormatEn) errors.push("請填寫英文輸出格式");
  if (!constraintsText) errors.push("請填寫限制條件");
  if (!constraintsTextEn) errors.push("請填寫英文限制條件");
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
  if (!normalizedTests.some((testCase) => testCase.visibility === "hidden")) {
    errors.push("至少需要一筆 hidden 測資，Submit 才能進行隱藏評分");
  }

  const slugBase = String(body.slug || "").trim() || `${week}-${title}`;
  const slug = options.keepSlug || uniqueSlug(slugify(slugBase));
  const starterCode =
    String(body.starterCode || "").trim() ||
    `def ${functionName}(${signature.join(", ")}):\n    # TODO: implement your solution\n    pass\n`;

  return {
    errors,
    problem: {
      slug,
      week,
      seriesTitle,
      seriesTitleEn,
      title,
      titleEn,
      difficulty,
      category,
      categoryEn,
      timeLimitSeconds,
      functionName,
      signature,
      statement,
      statementEn,
      inputFormat,
      inputFormatEn,
      outputFormat,
      outputFormatEn,
      constraintsText,
      constraintsTextEn,
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
  const now = Date.now();
  const students = db
    .prepare("SELECT id, name, student_id FROM users WHERE role = 'student' ORDER BY name, id")
    .all();

  const explanation = {
    title: "週賽排行榜計算方式",
    titleEn: "How the Weekly Contest Leaderboard Is Calculated",
    summary:
      "排行榜只計算「競賽題」。每週開放 2 題，關閉結算後才列入計分；非競賽練習題不影響排名。",
    summaryEn:
      "The leaderboard counts contest problems only. Two problems open each week and are scored after the window closes; practice problems do not affect ranking.",
    perProblemScore:
      "每題 0～100 分：未全部通過 = 60 ×（通過測資比例）；全部通過 = 60 底分 + 40 效率分。效率分 = 40 ×（0.6 × 時間百分位 + 0.4 × 記憶體百分位），在「當題全部通過的同學」中相對比較，最快、最省記憶體者得滿分。",
    perProblemScoreEn:
      "Each problem is 0-100: not fully correct = 60 × (passed-test ratio); fully correct = 60 base + 40 efficiency. Efficiency = 40 × (0.6 × time percentile + 0.4 × memory percentile), compared among students who fully solved that problem.",
    ranking:
      "每週成績 = 該週 2 題分數的平均（沒作答的題以 0 分計）。學期總分 = 各已結算週成績的平均（沒參加的週以 0 分計）。總分越高，排名越前面。",
    rankingEn:
      "Weekly score = average of that week's two problem scores (unattempted = 0). Semester score = average of settled weekly scores (missed weeks = 0). A higher score ranks higher.",
    tieBreakers:
      "總分相同時，依序比較已解出的競賽題數（多者優先）、總提交次數（少者優先）、姓名。",
    tieBreakersEn:
      "On ties, compare solved contest problems (more first), total submissions (fewer first), then name."
  };

  const contestProblems = db
    .prepare(
      "SELECT id, opens_at, closes_at FROM problems WHERE is_contest = 1 AND closes_at IS NOT NULL ORDER BY opens_at, id"
    )
    .all()
    .filter((problem) => {
      const closes = Date.parse(problem.closes_at);
      return !Number.isNaN(closes) && closes < now;
    });

  if (students.length === 0 || contestProblems.length === 0) {
    return { leaderboard: [], explanation, weekCount: 0, contestProblemCount: contestProblems.length };
  }

  const problemIds = contestProblems.map((problem) => problem.id);
  const placeholders = problemIds.map(() => "?").join(", ");
  const submissions = db
    .prepare(
      `SELECT user_id, problem_id, passed, passed_tests, total_tests, runtime_ms, peak_memory, created_at
       FROM submissions
       WHERE problem_id IN (${placeholders})
       ORDER BY created_at ASC`
    )
    .all(...problemIds);

  const problemById = new Map(contestProblems.map((problem) => [problem.id, problem]));
  const bestByKey = new Map();
  const submissionCount = new Map();
  for (const submission of submissions) {
    const problem = problemById.get(submission.problem_id);
    if (!problem) continue;
    const opensMs = problem.opens_at ? Date.parse(problem.opens_at) : Number.NEGATIVE_INFINITY;
    const closesMs = problem.closes_at ? Date.parse(problem.closes_at) : Number.POSITIVE_INFINITY;
    const createdMs = parseSqliteUtc(submission.created_at);
    if (Number.isNaN(createdMs)) continue;
    if (createdMs < opensMs || createdMs > closesMs) continue;
    submissionCount.set(submission.user_id, (submissionCount.get(submission.user_id) || 0) + 1);
    const key = `${submission.user_id}:${submission.problem_id}`;
    const ratio = submission.total_tests > 0 ? submission.passed_tests / submission.total_tests : 0;
    const candidate = {
      solved: Boolean(submission.passed),
      ratio,
      runtime: submission.runtime_ms || 0,
      memory: submission.peak_memory || 0
    };
    const current = bestByKey.get(key);
    bestByKey.set(key, current ? pickBetterBest(current, candidate) : candidate);
  }

  const problemScore = new Map();
  for (const problem of contestProblems) {
    const runtimes = [];
    const memories = [];
    for (const student of students) {
      const best = bestByKey.get(`${student.id}:${problem.id}`);
      if (best && best.solved) {
        runtimes.push(best.runtime);
        memories.push(best.memory);
      }
    }
    for (const student of students) {
      const key = `${student.id}:${problem.id}`;
      const best = bestByKey.get(key);
      if (!best) {
        problemScore.set(key, 0);
      } else if (best.solved) {
        const efficiency =
          0.6 * percentileLowerBetter(runtimes, best.runtime) +
          0.4 * percentileLowerBetter(memories, best.memory);
        problemScore.set(key, 60 + 40 * efficiency);
      } else {
        problemScore.set(key, 60 * best.ratio);
      }
    }
  }

  const weekProblems = new Map();
  for (const problem of contestProblems) {
    const weekKey = taipeiWeekKey(problem.opens_at);
    weekProblems.set(weekKey, [...(weekProblems.get(weekKey) || []), problem.id]);
  }
  const weekKeys = [...weekProblems.keys()];

  const leaderboard = students
    .map((student) => {
      let weekScoreSum = 0;
      for (const weekKey of weekKeys) {
        const ids = weekProblems.get(weekKey);
        let sum = 0;
        for (const problemId of ids) {
          sum += problemScore.get(`${student.id}:${problemId}`) || 0;
        }
        weekScoreSum += ids.length ? sum / ids.length : 0;
      }
      let settledSolved = 0;
      for (const problem of contestProblems) {
        const best = bestByKey.get(`${student.id}:${problem.id}`);
        if (best && best.solved) settledSolved += 1;
      }
      return {
        name: student.name,
        studentId: student.student_id,
        semesterScore: round2(weekScoreSum / weekKeys.length),
        settledSolved,
        settledProblemCount: contestProblems.length,
        weeksCounted: weekKeys.length,
        totalSubmissions: submissionCount.get(student.id) || 0
      };
    })
    .sort((a, b) => {
      if (b.semesterScore !== a.semesterScore) return b.semesterScore - a.semesterScore;
      if (b.settledSolved !== a.settledSolved) return b.settledSolved - a.settledSolved;
      if (a.totalSubmissions !== b.totalSubmissions) return a.totalSubmissions - b.totalSubmissions;
      return a.name.localeCompare(b.name);
    })
    .map((entry, index) => ({ rank: index + 1, ...entry }));

  return { leaderboard, explanation, weekCount: weekKeys.length, contestProblemCount: contestProblems.length };
}

function pickBetterBest(a, b) {
  if (a.solved !== b.solved) return a.solved ? a : b;
  if (a.solved) {
    if (a.runtime !== b.runtime) return a.runtime <= b.runtime ? a : b;
    return a.memory <= b.memory ? a : b;
  }
  return a.ratio >= b.ratio ? a : b;
}

function percentileLowerBetter(values, myValue) {
  const n = values.length;
  if (n <= 1) return 1;
  const better = values.filter((value) => value < myValue).length;
  return 1 - better / (n - 1);
}

function taipeiWeekKey(iso) {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "unknown";
  const taipei = new Date(ts + 8 * 3600 * 1000);
  const mondayOffset = (taipei.getUTCDay() + 6) % 7;
  const monday = new Date(taipei.getTime() - mondayOffset * 24 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
}

function parseSqliteUtc(text) {
  if (!text) return NaN;
  const str = String(text).trim();
  const normalized = str.includes("T") ? str : str.replace(" ", "T");
  if (normalized.endsWith("Z") || /[+-]\d\d:?\d\d$/.test(normalized)) return Date.parse(normalized);
  return Date.parse(normalized + "Z");
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

function getSavedCode(userId, problemId) {
  return db
    .prepare(
      `SELECT code, last_action, updated_at
       FROM saved_codes
       WHERE user_id = ? AND problem_id = ?`
    )
    .get(userId, problemId);
}

function saveProblemCode(userId, problemId, code, lastAction) {
  db
    .prepare(
      `INSERT INTO saved_codes (user_id, problem_id, code, last_action)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, problem_id) DO UPDATE SET
         code = excluded.code,
         last_action = excluded.last_action,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(userId, problemId, code, lastAction);
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
    code: row.code,
    details: JSON.parse(row.details_json),
    createdAt: row.created_at
  };
}
