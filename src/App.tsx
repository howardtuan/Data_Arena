import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  UIEvent
} from "react";

type View = "problems" | "workspace" | "auth" | "tutorial" | "leaderboard" | "progress" | "teacher";
type AuthMode = "login" | "register";
type DifficultyFilter = "all" | "1" | "2" | "3";

type User = {
  id: number;
  name: string;
  email: string;
  studentId: string | null;
  role: "student" | "admin";
};

type PublicTest = {
  id: number;
  name: string;
  args: unknown[];
  expected: unknown;
  comparator: string;
};

type Problem = {
  id: number;
  slug: string;
  week: number;
  seriesTitle: string;
  title: string;
  difficulty: number;
  category: string;
  timeLimitSeconds: number;
  functionName: string;
  signature: string[];
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraintsText: string;
  starterCode: string;
  isOpen: boolean;
  bestScore?: number | null;
  submissions?: number;
  publicTests?: PublicTest[];
  bestSubmission?: Submission | null;
};

type Attempt = {
  id: number;
  status: "active" | "passed" | "failed" | "timed_out" | "abandoned";
  dayKey: string;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  score: number;
  focusViolations: number;
  endReason: string | null;
};

type AttemptState = {
  dailyLimit: number;
  dailyUsed: number;
  remainingAttempts: number;
  canStart: boolean;
  canSubmit: boolean;
  activeAttempt: Attempt | null;
  nextResetAt: string;
};

type Submission = {
  id: number;
  score: number;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  details: TestDetail[];
  createdAt: string;
};

type TestDetail = {
  id: number;
  name: string;
  visibility: "public" | "hidden";
  passed: boolean;
  args?: unknown[];
  expected?: unknown;
  actual?: unknown;
  message: string;
  error?: string;
};

type GradeResult = {
  score: number;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  details: TestDetail[];
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  studentId: string;
  averageRank: number;
  averageProblemScore: number;
  solvedProblems: number;
  attemptedProblems: number;
  totalSubmissions: number;
  totalFailures: number;
  totalRuntimeMs: number;
  problemCount: number;
};

type LeaderboardExplanation = {
  title: string;
  summary: string;
  perProblemScore: string;
  ranking: string;
  tieBreakers: string;
};

type Dashboard = {
  counts: {
    students: number;
    problems: number;
    openProblems?: number;
    submissions: number;
    attempts?: number;
    passedSubmissions: number;
  };
};

type SampleCasePayload = {
  id: number;
  name: string;
  args: unknown[];
  expected?: unknown;
  comparator?: string;
};

type ProblemForm = {
  slug: string;
  week: string;
  seriesTitle: string;
  title: string;
  difficulty: string;
  category: string;
  timeLimitSeconds: string;
  functionName: string;
  signature: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraintsText: string;
  starterCode: string;
  testsText: string;
  isOpen: boolean;
};

type ProgressRow = {
  id: number;
  slug: string;
  title: string;
  week: number;
  submissions: number;
  best_score: number | null;
  last_submission: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "dataarena_token";

const PYTHON_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class",
  "continue", "def", "del", "elif", "else", "except", "finally", "for", "from",
  "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass",
  "raise", "return", "try", "while", "with", "yield"
]);

const PYTHON_BUILTINS = new Set([
  "abs", "all", "any", "bool", "dict", "enumerate", "filter", "float", "int", "len",
  "list", "map", "max", "min", "print", "range", "reversed", "round", "set", "sorted",
  "str", "sum", "tuple", "zip"
]);

const DEFAULT_PROBLEM_FORM: ProblemForm = {
  slug: "normalize-scores-template",
  week: "1",
  seriesTitle: "Introduction / Pandas 操作入門",
  title: "整理成績型別",
  difficulty: "1",
  category: "Python / Pandas 基礎",
  timeLimitSeconds: "1800",
  functionName: "normalize_scores",
  signature: "records",
  statement:
    "給定學生資料列，將每筆資料的 score 轉成整數；空字串、None、缺少 score 或無法轉換的值都視為 0。回傳新 list，並保持原本順序與其他欄位。",
  inputFormat: "records: list[dict]。因為 signature 只有 records，所以測資 args 要寫成 [records]，例如 [[{\"name\":\"Amy\",\"score\":\"91\"},{\"name\":\"Ben\",\"score\":null}]]。",
  outputFormat: "list[dict]。每筆資料的 score 必須是 int，其他欄位需要原樣保留。",
  constraintsText: "不要改變資料列順序。\n不要移除 name、class 等其他欄位。\nscore 為空字串、None、缺少欄位或無法轉成數字時，一律輸出 0。",
  starterCode:
    "def normalize_scores(records):\n    cleaned = []\n    for record in records:\n        next_record = dict(record)\n        try:\n            next_record[\"score\"] = int(float(next_record.get(\"score\", 0) or 0))\n        except (TypeError, ValueError):\n            next_record[\"score\"] = 0\n        cleaned.append(next_record)\n    return cleaned\n",
  testsText: JSON.stringify(
    [
      {
        name: "Sample 1",
        visibility: "public",
        args: [[{ name: "Amy", score: "91" }, { name: "Ben", score: null }]],
        expected: [{ name: "Amy", score: 91 }, { name: "Ben", score: 0 }],
        comparator: "exact"
      },
      {
        name: "Sample 2",
        visibility: "public",
        args: [[{ name: "Cara", score: "bad", class: "A" }]],
        expected: [{ name: "Cara", score: 0, class: "A" }],
        comparator: "exact"
      },
      {
        name: "Hidden 1",
        visibility: "hidden",
        args: [[{ name: "Dan", score: 88 }, { name: "Eva", score: "" }]],
        expected: [{ name: "Dan", score: 88 }, { name: "Eva", score: 0 }],
        comparator: "exact"
      }
    ],
    null,
    2
  ),
  isOpen: true
};

function App() {
  const [view, setView] = useState<View>("problems");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [attemptState, setAttemptState] = useState<AttemptState | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardExplanation, setLeaderboardExplanation] = useState<LeaderboardExplanation | null>(null);
  const [code, setCode] = useState("");
  const [sampleInputs, setSampleInputs] = useState<Record<number, string>>({});
  const [sampleOutputs, setSampleOutputs] = useState<Record<number, string>>({});
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);
  const [runResult, setRunResult] = useState<GradeResult | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [adminProblems, setAdminProblems] = useState<Problem[]>([]);
  const [uploadForm, setUploadForm] = useState<ProblemForm>(DEFAULT_PROBLEM_FORM);
  const [authForm, setAuthForm] = useState({ name: "", studentId: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [focusWarning, setFocusWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [workspaceSplit, setWorkspaceSplit] = useState(43);
  const [testSplit, setTestSplit] = useState(64);

  const timeoutInFlight = useRef(false);
  const focusViolationInFlight = useRef(false);
  const lastFocusViolationAt = useRef(0);
  const forceSubmitInFlight = useRef(false);

  const activeAttempt = attemptState?.activeAttempt ?? null;
  const canEdit = Boolean(activeAttempt && activeAttempt.status === "active" && remainingMs > 0);
  const canSubmit = canEdit && Boolean(attemptState?.canSubmit);
  const selectedIndex = problems.findIndex((problem) => problem.slug === selectedSlug);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (selectedSlug) void loadProblem(selectedSlug);
    else setSelectedProblem(null);
  }, [selectedSlug, token]);

  useEffect(() => {
    if (view === "leaderboard") void loadLeaderboard();
    if (view === "progress" && token) void loadProgress();
    if (view === "teacher" && user?.role === "admin") void loadAdmin();
  }, [view, token, user]);

  useEffect(() => {
    const tests = selectedProblem?.publicTests || [];
    if (!tests.length) {
      setActiveCaseId(null);
      return;
    }
    setActiveCaseId((current) => (current && tests.some((test) => test.id === current) ? current : tests[0].id));
  }, [selectedProblem?.id]);

  useEffect(() => {
    const attempt = attemptState?.activeAttempt;
    if (!attempt) {
      setRemainingMs(0);
      timeoutInFlight.current = false;
      return;
    }

    const tick = () => {
      const nextRemaining = Math.max(0, new Date(attempt.expiresAt).getTime() - Date.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0 && !timeoutInFlight.current) {
        timeoutInFlight.current = true;
        void markAttemptTimedOut(attempt.id);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [attemptState?.activeAttempt?.id, attemptState?.activeAttempt?.expiresAt]);

  useEffect(() => {
    const attempt = attemptState?.activeAttempt;
    if (!attempt || !token) return;
    const handlePageHide = () => sendAbandonBeacon(attempt.id, token);
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [attemptState?.activeAttempt?.id, token]);

  useEffect(() => {
    if (!canEdit) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [canEdit]);

  useEffect(() => {
    const attempt = attemptState?.activeAttempt;
    if (!attempt || !token) return;

    const report = () => {
      const now = Date.now();
      if (now - lastFocusViolationAt.current < 1200) return;
      lastFocusViolationAt.current = now;
      void reportFocusViolation(attempt.id);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) report();
    };

    window.addEventListener("blur", report);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", report);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptState?.activeAttempt?.id, token]);

  async function bootstrap() {
    setLoading(true);
    try {
      let usableToken = token;
      if (usableToken) {
        try {
          const me = await api<{ user: User }>("/api/auth/me", {}, usableToken);
          setUser(me.user);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setUser(null);
          setAttemptState(null);
          usableToken = "";
        }
      }

      const [problemResponse, leaderboardResponse] = await Promise.all([
        api<{ problems: Problem[] }>("/api/problems", {}, usableToken),
        api<{ leaderboard: LeaderboardEntry[]; explanation: LeaderboardExplanation }>("/api/leaderboard")
      ]);
      setProblems(problemResponse.problems);
      setLeaderboard(leaderboardResponse.leaderboard);
      setLeaderboardExplanation(leaderboardResponse.explanation);
      setSelectedSlug((current) => {
        if (problemResponse.problems.some((problem) => problem.slug === current)) return current;
        return problemResponse.problems[0]?.slug || "";
      });
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadProblem(slug: string) {
    try {
      const response = await api<{ problem: Problem }>(`/api/problems/${slug}`, {}, token);
      setSelectedProblem(response.problem);
      setCode(response.problem.starterCode);
      setRunResult(null);
      setFocusWarning("");
      setSampleInputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.args)])));
      setSampleOutputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.expected)])));
      if (token) await loadAttemptState(slug);
      else setAttemptState(null);
    } catch (error) {
      setSelectedProblem(null);
      setAttemptState(null);
      setStatus(readError(error));
    }
  }

  async function loadAttemptState(slug = selectedSlug) {
    if (!slug || !token) {
      setAttemptState(null);
      return;
    }
    const response = await api<{ attemptState: AttemptState }>(`/api/problems/${slug}/attempt-state`, {}, token);
    setAttemptState(response.attemptState);
  }

  async function loadLeaderboard() {
    const response = await api<{ leaderboard: LeaderboardEntry[]; explanation: LeaderboardExplanation }>("/api/leaderboard");
    setLeaderboard(response.leaderboard);
    setLeaderboardExplanation(response.explanation);
  }

  async function loadProgress() {
    const response = await api<{ progress: ProgressRow[] }>("/api/me/progress", {}, token);
    setProgress(response.progress);
  }

  async function loadAdmin() {
    const [dashboardResponse, problemsResponse] = await Promise.all([
      api<Dashboard>("/api/admin/dashboard", {}, token),
      api<{ problems: Problem[] }>("/api/admin/problems", {}, token)
    ]);
    setDashboard(dashboardResponse);
    setAdminProblems(problemsResponse.problems);
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const response = await api<{ user: User; token: string }>(path, {
        method: "POST",
        body: JSON.stringify(body)
      });
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      setStatus(`已登入：${response.user.name}`);

      const problemResponse = await api<{ problems: Problem[] }>("/api/problems", {}, response.token);
      setProblems(problemResponse.problems);
      setSelectedSlug((current) => current || problemResponse.problems[0]?.slug || "");
      setView(response.user.role === "admin" ? "teacher" : "problems");
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (canEdit) {
      setStatus("作答中不能登出。請先 Submit 或等待本次作答結束。");
      return;
    }
    await abandonActiveAttempt();
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setAttemptState(null);
    setProgress([]);
    setDashboard(null);
    setView("problems");
    setStatus("已登出");

    const [problemResponse, leaderboardResponse] = await Promise.all([
      api<{ problems: Problem[] }>("/api/problems"),
      api<{ leaderboard: LeaderboardEntry[]; explanation: LeaderboardExplanation }>("/api/leaderboard")
    ]);
    setProblems(problemResponse.problems);
    setLeaderboard(leaderboardResponse.leaderboard);
    setLeaderboardExplanation(leaderboardResponse.explanation);
    setSelectedSlug((current) => {
      if (problemResponse.problems.some((problem) => problem.slug === current)) return current;
      return problemResponse.problems[0]?.slug || "";
    });
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setStatus("");
    setView("auth");
  }

  function openProblem(slug: string) {
    setSelectedSlug(slug);
    setStatus("");
    setView("workspace");
  }

  function goView(nextView: View) {
    if (nextView === "progress" && !token) {
      openAuth("login");
      setStatus("請先登入後查看 Progress。");
      return;
    }
    if (nextView === "teacher" && user?.role !== "admin") {
      setStatus("只有老師帳號可以進入 Teacher。");
      return;
    }
    setStatus("");
    setView(nextView);
  }

  async function startAttempt() {
    if (!selectedProblem) return;
    if (!token) {
      openAuth("login");
      setStatus("請先登入後開始作答。");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api<{ attempt: Attempt; attemptState: AttemptState }>(
        `/api/problems/${selectedProblem.slug}/attempts/start`,
        { method: "POST", body: JSON.stringify({}) },
        token
      );
      timeoutInFlight.current = false;
      lastFocusViolationAt.current = 0;
      setFocusWarning("");
      setAttemptState(response.attemptState);
      setRemainingMs(Math.max(0, new Date(response.attempt.expiresAt).getTime() - Date.now()));
      setRunResult(null);
      setStatus("已開始作答。Run 只測公開測資，Submit 會送出公開與隱藏測資。");
    } catch (error) {
      setStatus(readError(error));
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      setLoading(false);
    }
  }

  async function runCode() {
    if (!selectedProblem) return;
    if (!canEdit) {
      setStatus("請先按 Start 開始作答，才能 Run。");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api<{ result: GradeResult; attempt: Attempt }>(
        `/api/problems/${selectedProblem.slug}/run`,
        {
          method: "POST",
          body: JSON.stringify({
            code,
            sampleCases: buildSampleCases(selectedProblem, sampleInputs, sampleOutputs)
          })
        },
        token
      );
      setRunResult(response.result);
      setStatus(response.result.passed ? "Run 通過公開測資。" : "Run 未通過，請查看 Test Result。");
    } catch (error) {
      setStatus(readError(error));
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(force = false) {
    if (!selectedProblem) return;
    if (!force && !canSubmit) {
      setStatus("請先 Start，且本題今日仍有 Submit 次數時才能送出。");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api<{ result: GradeResult; submission: Submission; attempt: Attempt }>(
        `/api/problems/${selectedProblem.slug}/submit`,
        { method: "POST", body: JSON.stringify({ code }) },
        token
      );
      setRunResult(response.result);
      setStatus(response.result.passed ? "Submit Accepted。" : "Submit 已送出，但尚未通過全部測資。");
      await Promise.all([loadAttemptState(), bootstrap()]);
    } catch (error) {
      setStatus(readError(error));
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      setLoading(false);
    }
  }

  async function abandonActiveAttempt(showMessage = false) {
    const attempt = attemptState?.activeAttempt;
    if (!attempt || !token) return;
    try {
      await api<{ attempt: Attempt }>(
        `/api/attempts/${attempt.id}/abandon`,
        { method: "POST", body: JSON.stringify({}) },
        token
      );
      setAttemptState((current) => current ? { ...current, activeAttempt: null, canStart: true } : current);
      if (showMessage) setStatus("已放棄本次作答。");
    } catch {
      // Navigation cleanup should not block the user.
    }
  }

  async function markAttemptTimedOut(attemptId: number) {
    try {
      await api<{ attempt: Attempt }>(`/api/attempts/${attemptId}/timeout`, { method: "POST", body: JSON.stringify({}) }, token);
      setStatus("作答時間已結束。");
      await loadAttemptState();
    } catch (error) {
      setStatus(readError(error));
    }
  }

  async function reportFocusViolation(attemptId: number) {
    if (!token || focusViolationInFlight.current || forceSubmitInFlight.current) return;
    focusViolationInFlight.current = true;
    try {
      const response = await api<{
        attemptState: AttemptState;
        violationCount: number;
        maxWarnings: number;
        shouldForceSubmit: boolean;
      }>(
        `/api/attempts/${attemptId}/focus-violation`,
        { method: "POST", body: JSON.stringify({}) },
        token
      );
      setAttemptState(response.attemptState);
      if (response.shouldForceSubmit) {
        const message = `離開作答畫面 ${response.violationCount} 次，系統將自動 Submit。`;
        setFocusWarning(message);
        setStatus(message);
        forceSubmitInFlight.current = true;
        await submitCode(true);
        forceSubmitInFlight.current = false;
        return;
      }
      const message = `請勿離開作答畫面：${response.violationCount}/${response.maxWarnings}`;
      setFocusWarning(message);
      setStatus(message);
    } catch (error) {
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      focusViolationInFlight.current = false;
    }
  }

  async function toggleProblemOpen(problem: Problem) {
    setLoading(true);
    setStatus("");
    try {
      await api<{ problem: Problem }>(
        `/api/admin/problems/${problem.id}`,
        { method: "PATCH", body: JSON.stringify({ isOpen: !problem.isOpen }) },
        token
      );
      setStatus(!problem.isOpen ? "題目已開放給學生。" : "題目已關閉，學生列表不會再看到。");
      await Promise.all([loadAdmin(), bootstrap()]);
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  async function createProblem(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const payload = problemFormToPayload(uploadForm);
      const response = await api<{ problem: Problem }>(
        "/api/admin/problems",
        { method: "POST", body: JSON.stringify(payload) },
        token
      );
      setStatus(`已建立題目：${displayProblemTitle(response.problem)}`);
      setSelectedSlug(response.problem.slug);
      await Promise.all([loadAdmin(), bootstrap()]);
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Topbar
        view={view}
        user={user}
        onView={goView}
        onAuth={openAuth}
        onLogout={logout}
      />

      {status && <div className="notice" role="status">{status}</div>}

      <main className={view === "workspace" ? "workspace-main" : "main-shell"}>
        {view === "auth" && (
          <AuthPage
            mode={authMode}
            form={authForm}
            loading={loading}
            onMode={setAuthMode}
            onForm={setAuthForm}
            onSubmit={handleAuth}
          />
        )}

        {view === "problems" && (
          <ProblemListView
            user={user}
            problems={problems}
            loading={loading}
            search={search}
            difficultyFilter={difficultyFilter}
            onSearch={setSearch}
            onDifficultyFilter={setDifficultyFilter}
            onOpenProblem={openProblem}
          />
        )}

        {view === "workspace" && (
          <ProblemWorkspace
            problem={selectedProblem}
            problems={problems}
            selectedIndex={selectedIndex}
            selectedSlug={selectedSlug}
            code={code}
            sampleInputs={sampleInputs}
            sampleOutputs={sampleOutputs}
            activeCaseId={activeCaseId}
            runResult={runResult}
            attemptState={attemptState}
            remainingMs={remainingMs}
            canEdit={canEdit}
            canSubmit={canSubmit}
            loading={loading}
            workspaceSplit={workspaceSplit}
            testSplit={testSplit}
            onBack={() => goView("problems")}
            onOpenProblem={openProblem}
            onCodeChange={setCode}
            onSampleInputChange={(id, value) => setSampleInputs((current) => ({ ...current, [id]: value }))}
            onSampleOutputChange={(id, value) => setSampleOutputs((current) => ({ ...current, [id]: value }))}
            onActiveCase={setActiveCaseId}
            onStart={startAttempt}
            onRun={runCode}
            onSubmit={() => void submitCode(false)}
            onWorkspaceSplit={setWorkspaceSplit}
            onTestSplit={setTestSplit}
          />
        )}

        {view === "tutorial" && <TutorialView />}
        {view === "leaderboard" && <LeaderboardView leaderboard={leaderboard} explanation={leaderboardExplanation} />}
        {view === "progress" && <ProgressView user={user} progress={progress} />}
        {view === "teacher" && (
          <TeacherView
            user={user}
            dashboard={dashboard}
            problems={adminProblems}
            form={uploadForm}
            loading={loading}
            onToggleProblem={toggleProblemOpen}
            onFormChange={setUploadForm}
            onCreateProblem={createProblem}
            onResetTemplate={() => setUploadForm(DEFAULT_PROBLEM_FORM)}
          />
        )}
      </main>

      {focusWarning && activeAttempt && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <section className="warning-modal">
            <h2>作答提醒</h2>
            <p>{focusWarning}</p>
            <button className="primary-button" onClick={() => setFocusWarning("")}>我知道了</button>
          </section>
        </div>
      )}
    </div>
  );
}

function Topbar({
  view,
  user,
  onView,
  onAuth,
  onLogout
}: {
  view: View;
  user: User | null;
  onView: (view: View) => void;
  onAuth: (mode: AuthMode) => void;
  onLogout: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand-logo" onClick={() => onView("problems")} aria-label="Data Arena">
          <span className="brand-data">Data</span>
          <span className="brand-arena">Arena</span>
        </button>

        <nav className="nav" aria-label="主選單">
          <button className={view === "problems" || view === "workspace" ? "nav-link active" : "nav-link"} onClick={() => onView("problems")}>
            Problems
          </button>
          <button className={view === "leaderboard" ? "nav-link active" : "nav-link"} onClick={() => onView("leaderboard")}>
            Leaderboard
          </button>
          <button className={view === "progress" ? "nav-link active" : "nav-link"} onClick={() => onView("progress")}>
            Progress
          </button>
          <button className={view === "tutorial" ? "nav-link active" : "nav-link"} onClick={() => onView("tutorial")}>
            Guide
          </button>
          {user?.role === "admin" && (
            <button className={view === "teacher" ? "nav-link active" : "nav-link"} onClick={() => onView("teacher")}>
              Teacher
            </button>
          )}
        </nav>

        <div className="topbar-spacer" />

        {user ? (
          <div className="account-area">
            <span className="user-chip">{user.name}</span>
            <button className="ghost-button compact" onClick={onLogout}>登出</button>
          </div>
        ) : (
          <div className="topbar-auth" aria-label="登入註冊">
            <button onClick={() => onAuth("login")}>登入</button>
            <button onClick={() => onAuth("register")}>註冊</button>
          </div>
        )}
      </div>
    </header>
  );
}

function AuthPage({
  mode,
  form,
  loading,
  onMode,
  onForm,
  onSubmit
}: {
  mode: AuthMode;
  form: { name: string; studentId: string; email: string; password: string };
  loading: boolean;
  onMode: (mode: AuthMode) => void;
  onForm: (form: { name: string; studentId: string; email: string; password: string }) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-logo-row">
          <span className="brand-data">Data</span>
          <span className="brand-arena">Arena</span>
        </div>
        <div className="auth-tabs" role="tablist" aria-label="登入或註冊">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => onMode("login")}>登入</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => onMode("register")}>註冊</button>
        </div>

        {mode === "register" && (
          <>
            <label>
              姓名
              <input value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} autoComplete="name" />
            </label>
            <label>
              學號
              <input value={form.studentId} onChange={(event) => onForm({ ...form, studentId: event.target.value })} autoComplete="off" />
            </label>
          </>
        )}

        <label>
          Email
          <input value={form.email} onChange={(event) => onForm({ ...form, email: event.target.value })} autoComplete="email" />
        </label>
        <label>
          密碼
          <input type="password" value={form.password} onChange={(event) => onForm({ ...form, password: event.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        <button className="primary-button auth-submit" disabled={loading}>
          {mode === "login" ? "登入" : "建立學生帳號"}
        </button>
      </form>
    </section>
  );
}

function ProblemListView({
  user,
  problems,
  loading,
  search,
  difficultyFilter,
  onSearch,
  onDifficultyFilter,
  onOpenProblem
}: {
  user: User | null;
  problems: Problem[];
  loading: boolean;
  search: string;
  difficultyFilter: DifficultyFilter;
  onSearch: (value: string) => void;
  onDifficultyFilter: (value: DifficultyFilter) => void;
  onOpenProblem: (slug: string) => void;
}) {
  const filteredProblems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return problems.filter((problem) => {
      const title = displayProblemTitle(problem).toLowerCase();
      const category = displayCategory(problem).toLowerCase();
      const matchesSearch = !normalizedSearch || title.includes(normalizedSearch) || category.includes(normalizedSearch) || problem.functionName.includes(normalizedSearch);
      const matchesDifficulty = difficultyFilter === "all" || String(problem.difficulty) === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, search, difficultyFilter]);

  const solved = problems.filter((problem) => Number(problem.bestScore ?? 0) >= 100).length;

  return (
    <section className="problem-list-shell">
      <section className="problem-center">
        <div className="problem-list-heading">
          <div>
            <h1>Problem List</h1>
            <p>{user ? `${user.name}，選擇一題開始練習。` : "選擇題目開始練習；登入後可以記錄進度與分數。"}</p>
          </div>
          <span>{filteredProblems.length}/{problems.length} 題</span>
        </div>

        <div className="list-toolbar">
          <label className="problem-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search questions" />
          </label>
          <select value={difficultyFilter} onChange={(event) => onDifficultyFilter(event.target.value as DifficultyFilter)} aria-label="難度篩選">
            <option value="all">All</option>
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>
          <div className="solved-counter">
            <span className="progress-ring" />
            {solved}/{problems.length} Solved
          </div>
        </div>

        <div className="question-list" aria-busy={loading}>
          {filteredProblems.length === 0 ? (
            <div className="empty-state padded">目前沒有符合條件的題目。</div>
          ) : (
            filteredProblems.map((problem, index) => (
              <button className="question-row" key={problem.slug} onClick={() => onOpenProblem(problem.slug)}>
                <span className={Number(problem.bestScore ?? 0) >= 100 ? "row-status solved" : "row-status"}>{Number(problem.bestScore ?? 0) >= 100 ? "✓" : ""}</span>
                <strong>{index + 1}. {displayProblemTitle(problem)}</strong>
                <span className="row-category">{displayCategory(problem)}</span>
                <span className={`difficulty d${problem.difficulty}`}>{difficultyLabel(problem.difficulty)}</span>
                <span className={problem.isOpen ? "lock-icon" : "lock-icon closed"}>{problem.isOpen ? "▮▮" : "🔒"}</span>
              </button>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

function ProblemWorkspace({
  problem,
  problems,
  selectedIndex,
  selectedSlug,
  code,
  sampleInputs,
  sampleOutputs,
  activeCaseId,
  runResult,
  attemptState,
  remainingMs,
  canEdit,
  canSubmit,
  loading,
  workspaceSplit,
  testSplit,
  onBack,
  onOpenProblem,
  onCodeChange,
  onSampleInputChange,
  onSampleOutputChange,
  onActiveCase,
  onStart,
  onRun,
  onSubmit,
  onWorkspaceSplit,
  onTestSplit
}: {
  problem: Problem | null;
  problems: Problem[];
  selectedIndex: number;
  selectedSlug: string;
  code: string;
  sampleInputs: Record<number, string>;
  sampleOutputs: Record<number, string>;
  activeCaseId: number | null;
  runResult: GradeResult | null;
  attemptState: AttemptState | null;
  remainingMs: number;
  canEdit: boolean;
  canSubmit: boolean;
  loading: boolean;
  workspaceSplit: number;
  testSplit: number;
  onBack: () => void;
  onOpenProblem: (slug: string) => void;
  onCodeChange: (value: string) => void;
  onSampleInputChange: (id: number, value: string) => void;
  onSampleOutputChange: (id: number, value: string) => void;
  onActiveCase: (id: number) => void;
  onStart: () => void;
  onRun: () => void;
  onSubmit: () => void;
  onWorkspaceSplit: (value: number) => void;
  onTestSplit: (value: number) => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const beginColumnResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const move = (moveEvent: PointerEvent) => {
      const rect = shellRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      onWorkspaceSplit(clamp(next, 28, 66));
    };
    startDocumentDrag(move);
  };

  const beginRowResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const move = (moveEvent: PointerEvent) => {
      const rect = rightRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      onTestSplit(clamp(next, 38, 78));
    };
    startDocumentDrag(move);
  };

  const handleColumnKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") onWorkspaceSplit(clamp(workspaceSplit - 3, 28, 66));
    if (event.key === "ArrowRight") onWorkspaceSplit(clamp(workspaceSplit + 3, 28, 66));
  };

  const handleRowKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") onTestSplit(clamp(testSplit - 3, 38, 78));
    if (event.key === "ArrowDown") onTestSplit(clamp(testSplit + 3, 38, 78));
  };

  if (!problem) {
    return (
      <section className="workspace-empty">
        <button className="ghost-button" onClick={onBack}>返回 Problem List</button>
        <p>目前沒有可顯示的題目。</p>
      </section>
    );
  }

  return (
    <section className="workspace-shell">
      <div className="workspace-toolbar">
        <div className="problem-picker">
          <button className="ghost-button compact" onClick={onBack}>Problem List</button>
          <select value={selectedSlug} onChange={(event) => onOpenProblem(event.target.value)} aria-label="選擇題目">
            {problems.map((item, index) => (
              <option key={item.slug} value={item.slug}>
                {index + 1}. {displayProblemTitle(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-actions">
          <span className={canEdit ? "timer-badge active" : "timer-badge"}>{formatDuration(remainingMs)}</span>
          <button className="ghost-button compact" disabled={loading || canEdit || !attemptState?.canStart} onClick={onStart}>Start</button>
          <button className="ghost-button compact" disabled={loading || !canEdit} onClick={onRun}>Run</button>
          <button className="submit-button" disabled={loading || !canSubmit} onClick={onSubmit}>Submit</button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="workspace-grid"
        style={{ gridTemplateColumns: `${workspaceSplit}% 8px minmax(0, 1fr)` }}
      >
        <ProblemStatement problem={problem} problemNumber={selectedIndex >= 0 ? selectedIndex + 1 : undefined} />
        <div
          className="splitter vertical"
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          onPointerDown={beginColumnResize}
          onKeyDown={handleColumnKey}
        />
        <div
          ref={rightRef}
          className="workspace-right"
          style={{ gridTemplateRows: `${testSplit}% 8px minmax(240px, 1fr)` }}
        >
          <CodePanel code={code} canEdit={canEdit} onCodeChange={onCodeChange} />
          <div
            className="splitter horizontal"
            role="separator"
            aria-orientation="horizontal"
            tabIndex={0}
            onPointerDown={beginRowResize}
            onKeyDown={handleRowKey}
          />
          <TestcasePanel
            problem={problem}
            activeCaseId={activeCaseId}
            sampleInputs={sampleInputs}
            sampleOutputs={sampleOutputs}
            result={runResult}
            onActiveCase={onActiveCase}
            onInputChange={onSampleInputChange}
            onOutputChange={onSampleOutputChange}
          />
        </div>
      </div>
    </section>
  );
}

function ProblemStatement({ problem, problemNumber }: { problem: Problem; problemNumber?: number }) {
  const tests = problem.publicTests || [];

  return (
    <article className="leetcode-panel description-panel">
      <div className="panel-tabs">
        <button className="panel-tab active">Description</button>
        <button className="panel-tab">Editorial</button>
        <button className="panel-tab">Solutions</button>
        <button className="panel-tab">Submissions</button>
      </div>
      <div className="problem-statement">
        <div className="problem-title-row">
          <h1>{problemNumber ? `${problemNumber}. ` : ""}{displayProblemTitle(problem)}</h1>
          {Number(problem.bestSubmission?.score ?? problem.bestScore ?? 0) >= 100 && <span className="solved-chip">Solved ✓</span>}
        </div>
        <div className="problem-meta">
          <span className={`difficulty d${problem.difficulty}`}>{difficultyLabel(problem.difficulty)}</span>
          <span>{displayCategory(problem)}</span>
          <span>{displaySeries(problem)}</span>
          {!problem.isOpen && <span className="closed-chip">Closed</span>}
        </div>

        <p>{displayStatement(problem)}</p>

        {tests.map((test, index) => (
          <section className="example-block" key={test.id}>
            <h3>Example {index + 1}:</h3>
            <pre>{`Input: ${formatFunctionCall(problem.signature, test.args)}
Output: ${prettyJson(test.expected)}`}</pre>
          </section>
        ))}

        <section className="statement-section">
          <h2>Input Format</h2>
          <p>{displayInputFormat(problem)}</p>
        </section>
        <section className="statement-section">
          <h2>Output Format</h2>
          <p>{displayOutputFormat(problem)}</p>
        </section>
        <section className="statement-section">
          <h2>Constraints</h2>
          <pre className="constraint-block">{displayConstraints(problem)}</pre>
        </section>
      </div>
    </article>
  );
}

function CodePanel({
  code,
  canEdit,
  onCodeChange
}: {
  code: string;
  canEdit: boolean;
  onCodeChange: (value: string) => void;
}) {
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);
  const lineNumbers = useMemo(() => {
    const count = Math.max(1, code.split("\n").length);
    return Array.from({ length: count }, (_, index) => String(index + 1)).join("\n");
  }, [code]);

  const syncScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = event.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    applyTab(event.currentTarget, event.shiftKey, onCodeChange);
  };

  return (
    <section className="leetcode-panel code-panel">
      <div className="code-header">
        <strong>Code</strong>
        <span>Python3</span>
        <span>Auto</span>
      </div>
      <div className={canEdit ? "arena-editor" : "arena-editor locked"}>
        <pre className="line-gutter" ref={gutterRef}>{lineNumbers}</pre>
        <div className="code-layer">
          <pre
            ref={highlightRef}
            className="code-highlight"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightPython(code) }}
          />
          <textarea
            className="code-editor"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            disabled={!canEdit}
            aria-label="Python 程式碼編輯器"
          />
        </div>
      </div>
    </section>
  );
}

function TestcasePanel({
  problem,
  activeCaseId,
  sampleInputs,
  sampleOutputs,
  result,
  onActiveCase,
  onInputChange,
  onOutputChange
}: {
  problem: Problem;
  activeCaseId: number | null;
  sampleInputs: Record<number, string>;
  sampleOutputs: Record<number, string>;
  result: GradeResult | null;
  onActiveCase: (id: number) => void;
  onInputChange: (id: number, value: string) => void;
  onOutputChange: (id: number, value: string) => void;
}) {
  const tests = problem.publicTests || [];
  const active = tests.find((test) => test.id === activeCaseId) || tests[0];

  return (
    <section className="leetcode-panel tests-panel">
      <div className="panel-tabs">
        <button className="panel-tab active">Testcase</button>
        <button className="panel-tab">Test Result</button>
      </div>
      <div className="case-tabs">
        {tests.map((test, index) => (
          <button className={test.id === active?.id ? "active" : ""} key={test.id} onClick={() => onActiveCase(test.id)}>
            Case {index + 1}
          </button>
        ))}
      </div>

      {active ? (
        <div className="case-editor">
          <label>
            input args =
            <textarea
              className="sample-input taller"
              value={sampleInputs[active.id] || ""}
              onChange={(event) => onInputChange(active.id, event.target.value)}
              spellCheck={false}
            />
          </label>
          <label>
            output =
            <textarea
              className="sample-input taller"
              value={sampleOutputs[active.id] || ""}
              onChange={(event) => onOutputChange(active.id, event.target.value)}
              spellCheck={false}
            />
          </label>
        </div>
      ) : (
        <p className="result-placeholder">這題尚未設定公開範例測資。</p>
      )}

      <ResultBox result={result} />
    </section>
  );
}

function ResultBox({ result }: { result: GradeResult | null }) {
  if (!result) return <p className="result-placeholder">Run 或 Submit 後會顯示結果。</p>;

  return (
    <section className="result-box">
      <div className="result-header">
        <strong>{result.passed ? "Accepted" : "Wrong Answer"}</strong>
        <span>{result.passedTests}/{result.totalTests} tests · {result.runtimeMs}ms · score {result.score}</span>
      </div>
      <div className="result-list">
        {result.details.map((detail) => (
          <article className={detail.passed ? "test-pass" : "test-fail"} key={`${detail.id}-${detail.name}`}>
            <strong>{detail.passed ? "✓" : "×"} {detail.name} <span>{detail.visibility}</span></strong>
            <p>{detail.message}</p>
            {(detail.args !== undefined || detail.expected !== undefined || detail.actual !== undefined) && (
              <div className="case-debug">
                {detail.args !== undefined && <DebugValue label="args" value={detail.args} />}
                {detail.expected !== undefined && <DebugValue label="expected" value={detail.expected} />}
                {detail.actual !== undefined && <DebugValue label="actual" value={detail.actual} />}
              </div>
            )}
            {detail.error && <pre className="error-output">{detail.error}</pre>}
          </article>
        ))}
      </div>
    </section>
  );
}

function DebugValue({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <small>{label}</small>
      <pre>{prettyJson(value)}</pre>
    </div>
  );
}

function TutorialView() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Guide</h1>
          <p>學生先從 Problem List 選題，按 Start 後編輯 Python function，Run 測公開測資，Submit 送公開與隱藏測資。</p>
        </div>
      </div>
      <section className="tutorial-grid">
        <article className="tutorial-card">
          <h2>1. 選題</h2>
          <p>題目列表只會顯示老師開放的題目。老師關閉後，學生看不到也不能直接開 URL 作答。</p>
        </article>
        <article className="tutorial-card">
          <h2>2. 作答</h2>
          <p>點進題目後可拖曳左右與上下分隔線，調整 Description、Code、Testcase 三個區塊大小。</p>
        </article>
        <article className="tutorial-card">
          <h2>3. 上傳題目</h2>
          <p>老師可在 Teacher 頁面建立題目、測資與 starter function，預設建立後立即開放。</p>
        </article>
      </section>
    </section>
  );
}

function LeaderboardView({
  leaderboard,
  explanation
}: {
  leaderboard: LeaderboardEntry[];
  explanation: LeaderboardExplanation | null;
}) {
  const [showRules, setShowRules] = useState(false);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Leaderboard</h1>
          <p>依每題表現、執行時間與 submit 次數計算排名。</p>
        </div>
        <button className="ghost-button" onClick={() => setShowRules((current) => !current)}>排名規則</button>
      </div>
      {showRules && explanation && (
        <section className="panel ranking-rules">
          <h2>{cleanText(explanation.title, "排名規則")}</h2>
          <p>{cleanText(explanation.summary, "每題都會計算題目分，再取所有開放題目的平均排名。")}</p>
          <p>{cleanText(explanation.perProblemScore, "題目分包含最佳分數、執行時間、submit 次數與失敗次數。")}</p>
          <p>{cleanText(explanation.ranking, "平均排名越低，總排名越前面。")}</p>
          <p>{cleanText(explanation.tieBreakers, "同分時依解題數、平均題目分、總執行時間等項目排序。")}</p>
        </section>
      )}
      <section className="panel table-panel">
        {leaderboard.length === 0 ? (
          <p className="empty-state">目前還沒有排行榜資料。</p>
        ) : (
          <table className="ranking-table global-ranking">
            <thead>
              <tr>
                <th>Rank</th>
                <th>學生</th>
                <th>平均排名</th>
                <th>解題</th>
                <th>平均分</th>
                <th>Submit</th>
                <th>失敗</th>
                <th>總時間</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.studentId}>
                  <td>{entry.rank}</td>
                  <td>{entry.name}<span>{entry.studentId}</span></td>
                  <td>{entry.averageRank}</td>
                  <td>{entry.solvedProblems}/{entry.problemCount}</td>
                  <td>{entry.averageProblemScore}</td>
                  <td>{entry.totalSubmissions}</td>
                  <td>{entry.totalFailures}</td>
                  <td>{formatRuntime(entry.totalRuntimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

function ProgressView({ user, progress }: { user: User | null; progress: ProgressRow[] }) {
  if (!user) return <section className="panel">請先登入。</section>;
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Progress</h1>
          <p>查看每一題的 submit 次數、最佳分數與最後提交時間。</p>
        </div>
      </div>
      <section className="panel table-panel">
        <table className="ranking-table">
          <thead><tr><th>週次</th><th>題目</th><th>Submit</th><th>最佳分數</th><th>最後提交</th></tr></thead>
          <tbody>
            {progress.map((row) => (
              <tr key={row.id}>
                <td>Week {row.week}</td>
                <td>{cleanText(row.title, titleFromSlug(row.slug))}</td>
                <td>{row.submissions}</td>
                <td>{row.best_score == null ? "-" : `${row.best_score}%`}</td>
                <td>{row.last_submission || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function TeacherView({
  user,
  dashboard,
  problems,
  form,
  loading,
  onToggleProblem,
  onFormChange,
  onCreateProblem,
  onResetTemplate
}: {
  user: User | null;
  dashboard: Dashboard | null;
  problems: Problem[];
  form: ProblemForm;
  loading: boolean;
  onToggleProblem: (problem: Problem) => void;
  onFormChange: (form: ProblemForm) => void;
  onCreateProblem: (event: FormEvent) => void;
  onResetTemplate: () => void;
}) {
  const [tab, setTab] = useState<"manage" | "upload">("manage");
  if (user?.role !== "admin") return <section className="panel">只有老師帳號可以進入此頁。</section>;

  return (
    <section className="teacher-dashboard">
      <div className="page-heading">
        <div>
          <h1>Teacher</h1>
          <p>管理題目開放狀態，或上傳新的 Python function 題目與測資。</p>
        </div>
        <div className="segmented">
          <button className={tab === "manage" ? "active" : ""} onClick={() => setTab("manage")}>題目管理</button>
          <button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}>上傳題目</button>
        </div>
      </div>

      <div className="metric-row">
        <MetricCard label="學生" value={String(dashboard?.counts.students ?? 0)} hint="已註冊學生" />
        <MetricCard label="題目" value={String(dashboard?.counts.problems ?? 0)} hint={`${dashboard?.counts.openProblems ?? 0} 題開放中`} />
        <MetricCard label="作答" value={String(dashboard?.counts.attempts ?? 0)} hint="所有 attempt" />
        <MetricCard label="Submit" value={String(dashboard?.counts.submissions ?? 0)} hint={`${dashboard?.counts.passedSubmissions ?? 0} 次通過`} />
      </div>

      {tab === "manage" ? (
        <section className="panel">
          <div className="panel-title-row">
            <h2>題目開放 / 關閉</h2>
            <span>預設所有題目開放；關閉後學生列表會隱藏。</span>
          </div>
          <div className="admin-problem-list">
            {problems.map((problem) => (
              <div className="admin-row" key={problem.id}>
                <span>Week {problem.week}</span>
                <strong>{displayProblemTitle(problem)}</strong>
                <em>{problem.isOpen ? "學生可見" : "已關閉"}</em>
                <button className={problem.isOpen ? "ghost-button compact danger" : "primary-button compact"} onClick={() => onToggleProblem(problem)}>
                  {problem.isOpen ? "關閉題目" : "開放題目"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="teacher-upload-grid">
          <ProblemUploadForm form={form} loading={loading} onFormChange={onFormChange} onSubmit={onCreateProblem} onResetTemplate={onResetTemplate} />
          <UploadGuide />
        </section>
      )}
    </section>
  );
}

function ProblemUploadForm({
  form,
  loading,
  onFormChange,
  onSubmit,
  onResetTemplate
}: {
  form: ProblemForm;
  loading: boolean;
  onFormChange: (form: ProblemForm) => void;
  onSubmit: (event: FormEvent) => void;
  onResetTemplate: () => void;
}) {
  const update = (patch: Partial<ProblemForm>) => onFormChange({ ...form, ...patch });

  return (
    <form className="panel upload-form" onSubmit={onSubmit}>
      <div className="panel-title-row">
        <h2>上傳題目</h2>
        <button className="ghost-button compact" type="button" onClick={onResetTemplate}>載入第 1 週第 1 題範例</button>
      </div>
      <div className="form-grid">
        <label>Slug<input value={form.slug} onChange={(event) => update({ slug: event.target.value })} placeholder="normalize-scores-template" /></label>
        <label>週次<input value={form.week} onChange={(event) => update({ week: event.target.value })} /></label>
        <label>系列名稱<input value={form.seriesTitle} onChange={(event) => update({ seriesTitle: event.target.value })} /></label>
        <label>題目名稱<input value={form.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label>難度
          <select value={form.difficulty} onChange={(event) => update({ difficulty: event.target.value })}>
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>
        </label>
        <label>分類<input value={form.category} onChange={(event) => update({ category: event.target.value })} /></label>
        <label>作答秒數<input value={form.timeLimitSeconds} onChange={(event) => update({ timeLimitSeconds: event.target.value })} /></label>
        <label>Function name<input value={form.functionName} onChange={(event) => update({ functionName: event.target.value })} /></label>
        <label className="wide">Signature<input value={form.signature} onChange={(event) => update({ signature: event.target.value })} placeholder="nums, target" /></label>
        <label className="wide">題目敘述<textarea value={form.statement} onChange={(event) => update({ statement: event.target.value })} /></label>
        <label className="wide">Input Format<textarea value={form.inputFormat} onChange={(event) => update({ inputFormat: event.target.value })} /></label>
        <label className="wide">Output Format<textarea value={form.outputFormat} onChange={(event) => update({ outputFormat: event.target.value })} /></label>
        <label className="wide">Constraints<textarea value={form.constraintsText} onChange={(event) => update({ constraintsText: event.target.value })} /></label>
        <label className="wide">Starter Code / 範例 func<textarea className="code-textarea" value={form.starterCode} onChange={(event) => update({ starterCode: event.target.value })} /></label>
        <label className="wide">測資 JSON<textarea className="code-textarea tall" value={form.testsText} onChange={(event) => update({ testsText: event.target.value })} /></label>
        <label className="checkbox-row wide">
          <input type="checkbox" checked={form.isOpen} onChange={(event) => update({ isOpen: event.target.checked })} />
          建立後立即開放給學生
        </label>
      </div>
      <div className="form-actions">
        <button className="primary-button" disabled={loading}>建立題目</button>
      </div>
    </form>
  );
}

function UploadGuide() {
  return (
    <aside className="panel upload-guide">
      <h2>老師上傳題目教學</h2>
      <ol>
        <li><strong>Function name：</strong>填學生必須實作的函式名稱，例如第一週第一題使用 <code>normalize_scores</code>。</li>
        <li><strong>Signature：</strong>填參數順序並用逗號分隔，例如 <code>records</code>。系統會用 <code>normalize_scores(*args)</code> 呼叫。</li>
        <li><strong>Starter Code：</strong>必須包含同名函式。可以給 <code>pass</code>，也可以給提示版本。</li>
        <li><strong>測資 args：</strong>一定要是 JSON array，順序對應 signature。第一週第一題只有 <code>records</code> 一個參數，所以 args 會是 <code>[[{"{"}"name":"Amy","score":"91"{"}"}]]</code>。</li>
        <li><strong>public / hidden：</strong>public 會顯示在 Testcase；hidden 只在 Submit 評分，不會把輸入與答案顯示給學生。</li>
        <li><strong>comparator：</strong><code>exact</code> 比對完全相同；<code>number</code> 比對數字誤差；<code>deepNumber</code> 比對 list/dict 裡的數字誤差。</li>
      </ol>
      <h3>測資 JSON 範例</h3>
      <pre>{DEFAULT_PROBLEM_FORM.testsText}</pre>
      <h3>最小 Starter Code</h3>
      <pre>{`def normalize_scores(records):
    # TODO: write your solution
    pass`}</pre>
    </aside>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

async function api<T>(path: string, options: RequestInit = {}, token = ""): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`) as ApiError;
    error.attemptState = data.attemptState;
    throw error;
  }
  return data as T;
}

function problemFormToPayload(form: ProblemForm) {
  const tests = JSON.parse(form.testsText);
  if (!Array.isArray(tests)) throw new Error("測資 JSON 必須是 array。");
  return {
    slug: form.slug,
    week: Number(form.week),
    seriesTitle: form.seriesTitle,
    title: form.title,
    difficulty: Number(form.difficulty),
    category: form.category,
    timeLimitSeconds: Number(form.timeLimitSeconds),
    functionName: form.functionName,
    signature: form.signature.split(",").map((item) => item.trim()).filter(Boolean),
    statement: form.statement,
    inputFormat: form.inputFormat,
    outputFormat: form.outputFormat,
    constraintsText: form.constraintsText,
    starterCode: form.starterCode,
    tests,
    isOpen: form.isOpen
  };
}

function buildSampleCases(problem: Problem, inputs: Record<number, string>, outputs: Record<number, string>): SampleCasePayload[] {
  return (problem.publicTests || []).map((test) => {
    const inputText = inputs[test.id] || "[]";
    const outputText = outputs[test.id] || "";
    const args = JSON.parse(inputText);
    if (!Array.isArray(args)) throw new Error(`${test.name} args 必須是 JSON array。`);
    const expected = outputText.trim() ? JSON.parse(outputText) : undefined;
    return {
      id: test.id,
      name: test.name,
      args,
      ...(outputText.trim() ? { expected, comparator: test.comparator } : {})
    };
  });
}

function startDocumentDrag(onMove: (event: PointerEvent) => void) {
  document.body.classList.add("is-resizing");
  const stop = () => {
    document.body.classList.remove("is-resizing");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
}

function highlightPython(code: string) {
  return code
    .split("\n")
    .map((line) => `${highlightPythonLine(line)}\n`)
    .join("") || "\n";
}

function highlightPythonLine(line: string) {
  let html = "";
  let codeChunk = "";
  let index = 0;

  const flushCode = () => {
    if (!codeChunk) return;
    html += highlightPythonCodeChunk(codeChunk);
    codeChunk = "";
  };

  while (index < line.length) {
    const char = line[index];
    if (char === "#") {
      flushCode();
      html += `<span class="code-comment">${escapeHtml(line.slice(index))}</span>`;
      return html;
    }
    if (char === "\"" || char === "'") {
      flushCode();
      const quote = char;
      let end = index + 1;
      while (end < line.length) {
        if (line[end] === "\\" && end + 1 < line.length) {
          end += 2;
          continue;
        }
        if (line[end] === quote) {
          end += 1;
          break;
        }
        end += 1;
      }
      html += `<span class="code-string">${escapeHtml(line.slice(index, end))}</span>`;
      index = end;
      continue;
    }
    codeChunk += char;
    index += 1;
  }

  flushCode();
  return html;
}

function highlightPythonCodeChunk(chunk: string) {
  const tokenPattern = /\b[A-Za-z_]\w*\b|\b\d+(?:\.\d+)?\b|[+\-*/%=<>!&|^~:.,()[\]{}]/g;
  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(chunk)) !== null) {
    const token = match[0];
    html += escapeHtml(chunk.slice(lastIndex, match.index));
    if (/^\d/.test(token)) {
      html += `<span class="code-number">${escapeHtml(token)}</span>`;
    } else if (PYTHON_KEYWORDS.has(token)) {
      html += `<span class="code-keyword">${escapeHtml(token)}</span>`;
    } else if (PYTHON_BUILTINS.has(token)) {
      html += `<span class="code-builtin">${escapeHtml(token)}</span>`;
    } else if (/^[A-Za-z_]/.test(token) && /^\s*\(/.test(chunk.slice(tokenPattern.lastIndex))) {
      html += `<span class="code-function">${escapeHtml(token)}</span>`;
    } else if (/^[+\-*/%=<>!&|^~:.,()[\]{}]$/.test(token)) {
      html += `<span class="code-operator">${escapeHtml(token)}</span>`;
    } else {
      html += escapeHtml(token);
    }
    lastIndex = tokenPattern.lastIndex;
  }

  return html + escapeHtml(chunk.slice(lastIndex));
}

function applyTab(textarea: HTMLTextAreaElement, shiftKey: boolean, onCodeChange: (value: string) => void) {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;

  if (shiftKey) {
    const beforeLine = value.slice(0, lineStart);
    const selected = value.slice(lineStart, end);
    const unindented = selected.replace(/(^|\n)( {1,4}|\t)/g, "$1");
    const next = beforeLine + unindented + value.slice(end);
    const removed = selected.length - unindented.length;
    onCodeChange(next);
    requestAnimationFrame(() => {
      textarea.selectionStart = Math.max(lineStart, start - Math.min(4, removed));
      textarea.selectionEnd = Math.max(textarea.selectionStart, end - removed);
    });
    return;
  }

  if (start !== end) {
    const beforeLine = value.slice(0, lineStart);
    const selected = value.slice(lineStart, end);
    const indented = selected.replace(/^/gm, "    ");
    const next = beforeLine + indented + value.slice(end);
    onCodeChange(next);
    requestAnimationFrame(() => {
      textarea.selectionStart = start + 4;
      textarea.selectionEnd = end + (indented.length - selected.length);
    });
    return;
  }

  const next = value.slice(0, start) + "    " + value.slice(end);
  onCodeChange(next);
  requestAnimationFrame(() => {
    textarea.selectionStart = start + 4;
    textarea.selectionEnd = start + 4;
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "attemptState" in error;
}

type ApiError = Error & { attemptState?: AttemptState };

function sendAbandonBeacon(attemptId: number, token: string) {
  const body = new Blob([JSON.stringify({ token })], { type: "application/json" });
  navigator.sendBeacon(`${API_BASE}/api/attempts/${attemptId}/abandon`, body);
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function difficultyLabel(value: number) {
  if (value === 1) return "Easy";
  if (value === 2) return "Med.";
  return "Hard";
}

function formatFunctionCall(signature: string[], args: unknown[]) {
  return signature.map((name, index) => `${name} = ${JSON.stringify(args[index])}`).join(", ");
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function formatRuntime(ms: number) {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function readError(error: unknown) {
  return error instanceof Error ? cleanText(error.message, error.message) : "發生未知錯誤";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isCorruptText(value?: string | null) {
  if (!value) return false;
  return /[�\uE000-\uF8FF]|蝚|嚗|摮|雿|憿|銝|隢|甈|鞈|蝑|撌|餃|芷|曆/.test(value);
}

function cleanText(value: string | null | undefined, fallback: string) {
  if (!value || isCorruptText(value)) return fallback;
  return value;
}

function displayProblemTitle(problem: Problem) {
  return cleanText(problem.title, titleFromSlug(problem.slug));
}

function displaySeries(problem: Problem) {
  return cleanText(problem.seriesTitle, `Week ${problem.week}`);
}

function displayCategory(problem: Problem) {
  return cleanText(problem.category, problem.functionName.includes("_") ? titleCase(problem.functionName.split("_")[0]) : "Python");
}

function displayStatement(problem: Problem) {
  return cleanText(
    problem.statement,
    `Implement ${problem.functionName}(${problem.signature.join(", ")}) in Python. Return the value required by the examples and hidden tests.`
  );
}

function displayInputFormat(problem: Problem) {
  return cleanText(problem.inputFormat, `args follows signature order: ${problem.signature.join(", ")}.`);
}

function displayOutputFormat(problem: Problem) {
  return cleanText(problem.outputFormat, "Return a JSON-serializable Python value.");
}

function displayConstraints(problem: Problem) {
  return cleanText(problem.constraintsText, "Use pure Python. Match the public examples and hidden tests.");
}

function titleFromSlug(slug: string) {
  const stripped = slug.replace(/^week-\d+-\d+-/, "");
  return titleCase(stripped.replace(/-/g, " "));
}

function titleCase(value: string) {
  return value
    .split(/[\s_/-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default App;
