import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { config } from "./config.mjs";
import { buildProblemBank } from "./problem-bank.mjs";

let db;
const PROBLEM_BANK_VERSION = "2026-06-data-mining-difficulty-v2";

export function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
    db = new Database(config.dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
    seed(db);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = undefined;
  }
}

export function resetDatabaseFile() {
  closeDb();
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${config.dbPath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target);
  }
  return getDb();
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      student_id TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      week INTEGER NOT NULL,
      series_title TEXT NOT NULL,
      series_title_en TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
      category TEXT NOT NULL,
      category_en TEXT NOT NULL DEFAULT '',
      time_limit_seconds INTEGER NOT NULL,
      function_name TEXT NOT NULL,
      signature_json TEXT NOT NULL,
      statement TEXT NOT NULL,
      statement_en TEXT NOT NULL DEFAULT '',
      input_format TEXT NOT NULL,
      input_format_en TEXT NOT NULL DEFAULT '',
      output_format TEXT NOT NULL,
      output_format_en TEXT NOT NULL DEFAULT '',
      constraints_text TEXT NOT NULL,
      constraints_text_en TEXT NOT NULL DEFAULT '',
      starter_code TEXT NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      visibility TEXT NOT NULL CHECK (visibility IN ('public', 'hidden')),
      args_json TEXT NOT NULL,
      expected_json TEXT NOT NULL,
      comparator TEXT NOT NULL DEFAULT 'exact',
      points INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      passed_tests INTEGER NOT NULL,
      total_tests INTEGER NOT NULL,
      runtime_ms INTEGER NOT NULL,
      details_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      last_action TEXT NOT NULL CHECK (last_action IN ('run', 'submit')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, problem_id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      day_key TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'passed', 'failed', 'timed_out', 'abandoned')),
      started_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      ended_at TEXT,
      score INTEGER NOT NULL DEFAULT 0,
      submission_id INTEGER REFERENCES submissions(id) ON DELETE SET NULL,
      focus_violations INTEGER NOT NULL DEFAULT 0,
      end_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_problems_week ON problems(week);
    CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_problem_score ON submissions(problem_id, score DESC, runtime_ms ASC);
    CREATE INDEX IF NOT EXISTS idx_saved_codes_user_problem ON saved_codes(user_id, problem_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_user_problem_day ON attempts(user_id, problem_id, day_key);
    CREATE INDEX IF NOT EXISTS idx_attempts_status_expires ON attempts(status, expires_at);
  `);
  ensureColumn(database, "problems", "series_title_en", "series_title_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "title_en", "title_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "category_en", "category_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "statement_en", "statement_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "input_format_en", "input_format_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "output_format_en", "output_format_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "problems", "constraints_text_en", "constraints_text_en TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, "attempts", "focus_violations", "focus_violations INTEGER NOT NULL DEFAULT 0");
}

function ensureColumn(database, table, column, definition) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
}

function seed(database) {
  seedAdmin(database);
  seedSampleStudent(database);
  seedProblems(database);
}

function seedAdmin(database) {
  const existing = database
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();
  if (existing) return;

  database
    .prepare(
      `INSERT INTO users (name, email, student_id, password_hash, role)
       VALUES (@name, @email, NULL, @passwordHash, 'admin')`
    )
    .run({
      name: "DataArena 管理員",
      email: config.adminEmail,
      passwordHash: bcrypt.hashSync(config.adminPassword, 12)
    });
}

function seedSampleStudent(database) {
  const email = "student@dataarena.local";
  const existing = database
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .get(email);
  if (existing) return;

  database
    .prepare(
      `INSERT INTO users (name, email, student_id, password_hash, role)
       VALUES (@name, @email, @studentId, @passwordHash, 'student')`
    )
    .run({
      name: "範例學生",
      email,
      studentId: "SAMPLE001",
      passwordHash: bcrypt.hashSync("Student@2026!", 12)
    });
}

function seedProblems(database) {
  const currentVersion = database
    .prepare("SELECT value FROM app_meta WHERE key = 'problem_bank_version'")
    .get()?.value;
  const problemCount = database.prepare("SELECT COUNT(*) AS count FROM problems").get().count;
  if (currentVersion === PROBLEM_BANK_VERSION && problemCount > 0) return;

  const submissionCount = database.prepare("SELECT COUNT(*) AS count FROM submissions").get().count;
  if (submissionCount > 0 && problemCount > 0) {
    console.warn(
      `Problem bank version ${PROBLEM_BANK_VERSION} is available, but existing submissions were found. ` +
        "Skipping automatic destructive replacement; run reset-db when you are ready to reseed."
    );
    return;
  }

  replaceProblemBank(database);
}

function replaceProblemBank(database) {
  const insertProblem = database.prepare(`
    INSERT INTO problems (
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
      @starterCode, 1
    )
  `);
  const insertCase = database.prepare(`
    INSERT INTO test_cases (problem_id, name, visibility, args_json, expected_json, comparator, points)
    VALUES (@problemId, @name, @visibility, @argsJson, @expectedJson, @comparator, @points)
  `);

  const transaction = database.transaction((problems) => {
    database.prepare("DELETE FROM attempts").run();
    database.prepare("DELETE FROM submissions").run();
    database.prepare("DELETE FROM test_cases").run();
    database.prepare("DELETE FROM problems").run();

    for (const problem of problems) {
      const result = insertProblem.run({
        ...problem,
        signatureJson: JSON.stringify(problem.signature)
      });
      const problemId = result.lastInsertRowid;
      for (const testCase of problem.tests) {
        insertCase.run({
          problemId,
          name: testCase.name,
          visibility: testCase.visibility,
          argsJson: JSON.stringify(testCase.args),
          expectedJson: JSON.stringify(testCase.expected),
          comparator: testCase.comparator || "exact",
          points: testCase.points || 1
        });
      }
    }

    database
      .prepare(
        `INSERT INTO app_meta (key, value)
         VALUES ('problem_bank_version', @version)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run({ version: PROBLEM_BANK_VERSION });
  });

  transaction(buildProblemBank());
}
