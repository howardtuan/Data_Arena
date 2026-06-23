import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent, UIEvent } from "react";

type View = "problems" | "tutorial" | "leaderboard" | "progress" | "teacher";
type AuthMode = "login" | "register";

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
  visibility: "public";
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
    submissions: number;
    attempts?: number;
    passedSubmissions: number;
  };
  weekStats: Array<{ week: number; problems: number; submissions: number; average_score: number | null }>;
  recentSubmissions: Array<{
    id: number;
    score: number;
    passed: number;
    created_at: string;
    name: string;
    student_id: string;
    title: string;
    week: number;
  }>;
};

type SampleCasePayload = {
  id: number;
  name: string;
  args: unknown[];
  expected?: unknown;
  comparator?: string;
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

const TUTORIAL_STEPS = [
  {
    title: "註冊或登入",
    body: "學生先用姓名、學號、Email 與密碼註冊。教師使用管理員帳號登入後台管理題目開放狀態。"
  },
  {
    title: "選題後按開始",
    body: "題目可以先閱讀，但必須按下開始作答後，編輯器、Sample Input 與 Expected 才會解鎖並開始倒數。"
  },
  {
    title: "先用 Test 驗證 sample",
    body: "Test 不限次數，使用畫面上可自行修改的 sample 測資，不會消耗每日 Submit 次數。"
  },
  {
    title: "Submit 才列入正式紀錄",
    body: "Submit 會使用該題全部公開測資批改。每位學生每題每天最多 3 次，午夜自動重置。"
  },
  {
    title: "測驗中留在本題",
    body: "開始後會鎖定導覽、題目切換與登出。切換視窗或分頁會警告，超過 2 次會強制送出目前程式碼。"
  },
  {
    title: "查看總排行榜",
    body: "排行榜以全部題目的平均題目排名計算，會綜合通過率、時間、Submit 次數與失敗次數。"
  }
];

const TUTORIAL_SOLUTIONS = [
  {
    title: "Week 1-1 整理成績型別",
    functionName: "normalize_scores(records)",
    note: "複製每筆資料，將可轉換的 score 轉成整數；空值與錯誤值設為 0。",
    code: `def normalize_scores(records):
    result = []
    for row in records:
        new_row = dict(row)
        value = new_row.get("score")
        try:
            new_row["score"] = int(float(value))
        except (TypeError, ValueError):
            new_row["score"] = 0
        result.append(new_row)
    return result`
  },
  {
    title: "Week 1-2 找出最高分學生",
    functionName: "top_student(records)",
    note: "用目前最佳資料列逐筆比較，遇到同分不更新，就會保留較早出現者。",
    code: `def top_student(records):
    best = records[0]
    for row in records[1:]:
        if row["score"] > best["score"]:
            best = row
    return best["name"]`
  },
  {
    title: "Week 1-3 擷取欄位有效值",
    functionName: "column_values(records, column)",
    note: "缺欄位、None 與空字串都略過，其餘值保留原順序。",
    code: `def column_values(records, column):
    values = []
    for row in records:
        value = row.get(column)
        if value is not None and value != "":
            values.append(value)
    return values`
  },
  {
    title: "Week 1-4 建立通過標記",
    functionName: "pass_flags(scores, threshold)",
    note: "逐一判斷分數是否大於等於門檻，回傳布林值清單。",
    code: `def pass_flags(scores, threshold):
    return [score >= threshold for score in scores]`
  },
  {
    title: "Week 1-5 依班級分組名單",
    functionName: "group_names_by_class(records)",
    note: "先依班級收集姓名，再依班級與姓名字典序排序。",
    code: `def group_names_by_class(records):
    groups = {}
    for row in records:
        class_name = row["class"]
        groups.setdefault(class_name, []).append(row["name"])

    result = {}
    for class_name in sorted(groups):
        result[class_name] = sorted(groups[class_name])
    return result`
  }
];

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
  const [runResult, setRunResult] = useState<GradeResult | null>(null);
  const [progress, setProgress] = useState<unknown[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [adminProblems, setAdminProblems] = useState<Problem[]>([]);
  const [authForm, setAuthForm] = useState({ name: "", studentId: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [focusWarning, setFocusWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutInFlight = useRef(false);
  const focusViolationInFlight = useRef(false);
  const lastFocusViolationAt = useRef(0);
  const forceSubmitInFlight = useRef(false);

  const activeAttempt = attemptState?.activeAttempt ?? null;
  const canEdit = Boolean(activeAttempt && activeAttempt.status === "active" && remainingMs > 0);
  const canSubmit = canEdit && Boolean(attemptState?.canSubmit);
  const isAttemptLocked = canEdit;

  const groupedProblems = useMemo(() => {
    const groups = new Map<number, Problem[]>();
    for (const problem of problems) {
      groups.set(problem.week, [...(groups.get(problem.week) || []), problem]);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [problems]);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (selectedSlug) void loadProblem(selectedSlug);
  }, [selectedSlug, token]);

  useEffect(() => {
    if (view === "leaderboard") void loadLeaderboard();
    if (view === "progress" && token) void loadProgress();
    if (view === "teacher" && user?.role === "admin") void loadAdmin();
  }, [view, token, user]);

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
    if (!isAttemptLocked) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAttemptLocked]);

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
      setSelectedSlug((current) => current || problemResponse.problems[0]?.slug || "");
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  async function loadProblem(slug: string) {
    const response = await api<{ problem: Problem }>(`/api/problems/${slug}`, {}, token);
    setSelectedProblem(response.problem);
    setCode(response.problem.starterCode);
    setRunResult(null);
    setFocusWarning("");
    setSampleInputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.args)])));
    setSampleOutputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.expected)])));
    if (token) await loadAttemptState(slug);
    else setAttemptState(null);
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
    const response = await api<{ progress: unknown[] }>("/api/me/progress", {}, token);
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
      const body = authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm;
      const response = await api<{ user: User; token: string }>(path, {
        method: "POST",
        body: JSON.stringify(body)
      });
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      setStatus(`${response.user.name} 已登入`);
      const problemResponse = await api<{ problems: Problem[] }>("/api/problems", {}, response.token);
      setProblems(problemResponse.problems);
    } catch (error) {
      setStatus(readError(error));
    } finally {
      setLoading(false);
    }
  }

  async function logout(showMessage = true) {
    if (isAttemptLocked) {
      setStatus("測驗進行中，請先 Submit 或等時間結束，期間不能登出或離開本題。");
      return;
    }
    await abandonActiveAttempt();
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setAttemptState(null);
    setProgress([]);
    setDashboard(null);
    if (showMessage) setStatus("已登出");
  }

  async function startAttempt() {
    if (!selectedProblem) return;
    if (!token) {
      setStatus("請先註冊或登入學生帳號");
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
      setStatus("已開始作答。Test 不限次數，Submit 每題每天最多 3 次。");
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
      if (showMessage) setStatus("已記錄本次離開作答");
    } catch {
      // Navigation cleanup should not block the user.
    }
  }

  async function markAttemptTimedOut(attemptId: number) {
    try {
      await api<{ attempt: Attempt }>(`/api/attempts/${attemptId}/timeout`, { method: "POST", body: JSON.stringify({}) }, token);
      setStatus("作答時間已到，本次作答已記錄為逾時。你可以重新開始作答，Submit 次數不會因逾時消耗。");
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
        const message = `偵測到切換視窗 ${response.violationCount} 次，已超過 ${response.maxWarnings} 次警告，系統正在強制送出。`;
        setFocusWarning(message);
        setStatus(message);
        await forceSubmitActiveAttempt(attemptId);
        return;
      }
      const message = `警告：測驗中禁止切換視窗。已偵測 ${response.violationCount}/${response.maxWarnings} 次，超過 ${response.maxWarnings} 次會強制送出。`;
      setFocusWarning(message);
      setStatus(message);
    } catch (error) {
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      focusViolationInFlight.current = false;
    }
  }

  async function forceSubmitActiveAttempt(attemptId: number) {
    if (!selectedProblem || !token || forceSubmitInFlight.current) return;
    forceSubmitInFlight.current = true;
    setLoading(true);
    try {
      const response = await api<{ result: GradeResult; submission?: Submission; attempt?: Attempt }>(
        `/api/problems/${selectedProblem.slug}/submit`,
        { method: "POST", body: JSON.stringify({ code, attemptId }) },
        token
      );
      setRunResult(response.result);
      setStatus(response.result.passed ? "切換視窗超過限制，系統已強制送出並通過。" : "切換視窗超過限制，系統已強制送出並計入今日 Submit。");
      await Promise.all([loadLeaderboard(), loadAttemptState(selectedProblem.slug), bootstrap()]);
    } catch (error) {
      setStatus(readError(error));
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      forceSubmitInFlight.current = false;
      setLoading(false);
    }
  }

  async function runCode(isSubmit: boolean) {
    if (!selectedProblem) return;
    if (!token) {
      setStatus("請先註冊或登入學生帳號");
      return;
    }
    if (!activeAttempt) {
      setStatus("請先按開始作答，開始後才可編輯與執行");
      return;
    }
    if (isSubmit && !attemptState?.canSubmit) {
      setStatus("今日本題 Submit 次數已用完，請等午夜重置");
      return;
    }
    setStatus("");
    setLoading(true);
    try {
      const path = isSubmit ? "submit" : "run";
      const body = isSubmit
        ? { code, attemptId: activeAttempt.id }
        : { code, attemptId: activeAttempt.id, sampleCases: buildSampleCases(selectedProblem, sampleInputs, sampleOutputs) };
      const response = await api<{ result: GradeResult; submission?: Submission; attempt?: Attempt }>(
        `/api/problems/${selectedProblem.slug}/${path}`,
        { method: "POST", body: JSON.stringify(body) },
        token
      );
      setRunResult(response.result);
      if (isSubmit) {
        setStatus(response.result.passed ? "提交通過" : "提交未通過，本次 Submit 已計入今日次數");
        await Promise.all([loadLeaderboard(), loadAttemptState(selectedProblem.slug), bootstrap()]);
      }
    } catch (error) {
      setStatus(readError(error));
      if (isApiError(error) && error.attemptState) setAttemptState(error.attemptState);
    } finally {
      setLoading(false);
    }
  }

  async function toggleProblem(problem: Problem) {
    await api<{ problem: Problem }>(
      `/api/admin/problems/${problem.id}`,
      { method: "PATCH", body: JSON.stringify({ isOpen: !problem.isOpen }) },
      token
    );
    await Promise.all([bootstrap(), loadAdmin()]);
  }

  async function navigate(nextView: View) {
    if (isAttemptLocked && nextView !== view) {
      setStatus("測驗進行中，不能切換頁面。請留在本題完成 Test 或 Submit。");
      return;
    }
    if (nextView !== "problems") await abandonActiveAttempt(true);
    setView(nextView);
  }

  async function selectProblem(slug: string) {
    if (slug === selectedSlug) return;
    if (isAttemptLocked) {
      setStatus("測驗進行中，不能切換題目。請完成本題 Submit 或等時間結束。");
      return;
    }
    await abandonActiveAttempt(true);
    setAttemptState(null);
    setSelectedSlug(slug);
  }

  return (
    <div className="app">
      <Header user={user} activeView={view} locked={isAttemptLocked} onNavigate={(next) => void navigate(next)} onLogout={() => void logout()} />
      <main className="main-shell">
        {status && <div className="notice">{status}</div>}
        {focusWarning && <FocusWarningModal message={focusWarning} onClose={() => setFocusWarning("")} />}
        {!user && (
          <AuthPanel
            mode={authMode}
            form={authForm}
            loading={loading}
            onModeChange={setAuthMode}
            onFormChange={setAuthForm}
            onSubmit={handleAuth}
          />
        )}
        {view === "problems" && (
          <ProblemWorkspace
            problems={groupedProblems}
            selectedSlug={selectedSlug}
            selectedProblem={selectedProblem}
            attemptState={attemptState}
            remainingMs={remainingMs}
            canEdit={canEdit}
            canSubmit={canSubmit}
            locked={isAttemptLocked}
            code={code}
            sampleInputs={sampleInputs}
            sampleOutputs={sampleOutputs}
            result={runResult}
            loading={loading}
            onSelectProblem={(slug) => void selectProblem(slug)}
            onCodeChange={setCode}
            onSampleInputChange={(id, value) => setSampleInputs((current) => ({ ...current, [id]: value }))}
            onSampleOutputChange={(id, value) => setSampleOutputs((current) => ({ ...current, [id]: value }))}
            onStart={() => void startAttempt()}
            onRun={() => void runCode(false)}
            onSubmit={() => void runCode(true)}
            onEditorBlocked={(message) => setStatus(message)}
          />
        )}
        {view === "tutorial" && (
          <TutorialView />
        )}
        {view === "leaderboard" && (
          <LeaderboardView leaderboard={leaderboard} explanation={leaderboardExplanation} />
        )}
        {view === "progress" && (
          <ProgressView user={user} progress={progress} />
        )}
        {view === "teacher" && (
          <TeacherView user={user} dashboard={dashboard} problems={adminProblems} onToggleProblem={toggleProblem} />
        )}
      </main>
    </div>
  );
}

function Header({
  user,
  activeView,
  locked,
  onNavigate,
  onLogout
}: {
  user: User | null;
  activeView: View;
  locked: boolean;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}) {
  const navItems: Array<{ id: View; label: string; adminOnly?: boolean; authOnly?: boolean }> = [
    { id: "problems", label: "題庫" },
    { id: "tutorial", label: "使用教學" },
    { id: "leaderboard", label: "總排行榜" },
    { id: "progress", label: "我的進度", authOnly: true },
    { id: "teacher", label: "教師後台", adminOnly: true }
  ];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" disabled={locked} title={locked ? "測驗中不能切換頁面" : undefined} onClick={() => onNavigate("problems")}>DataArena</button>
        <nav className="nav" aria-label="主要導覽">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === "admin")
            .filter((item) => !item.authOnly || user)
            .map((item) => (
              <button
                key={item.id}
                className={activeView === item.id ? "nav-link active" : "nav-link"}
                disabled={locked}
                title={locked ? "測驗中不能切換頁面" : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
        </nav>
        <div className="teacher-area">
          {user ? (
            <>
              <span className="user-chip">{user.role === "admin" ? "管理員" : "學生"}：{user.name}</span>
              <button className="secondary-button compact" disabled={locked} title={locked ? "測驗中不能登出" : undefined} onClick={onLogout}>登出</button>
            </>
          ) : (
            <span className="user-chip">請登入或註冊</span>
          )}
        </div>
      </div>
    </header>
  );
}

function FocusWarningModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-label="測驗警告">
      <div className="warning-modal">
        <h2>測驗警告</h2>
        <p>{message}</p>
        <button className="primary-button" data-testid="focus-warning-close" onClick={onClose}>我知道了</button>
      </div>
    </div>
  );
}

function AuthPanel({
  mode,
  form,
  loading,
  onModeChange,
  onFormChange,
  onSubmit
}: {
  mode: AuthMode;
  form: { name: string; studentId: string; email: string; password: string };
  loading: boolean;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: (form: { name: string; studentId: string; email: string; password: string }) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <section className="panel auth-panel">
      <div>
        <h1>{mode === "login" ? "登入 DataArena" : "註冊學生帳號"}</h1>
        <p>學生可自行註冊。教師請使用管理員帳密登入。</p>
      </div>
      <form className="auth-form" onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <label>姓名<input data-testid="auth-name" value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} /></label>
            <label>學號<input data-testid="auth-student-id" value={form.studentId} onChange={(event) => onFormChange({ ...form, studentId: event.target.value })} /></label>
          </>
        )}
        <label>Email<input data-testid="auth-email" type="email" value={form.email} onChange={(event) => onFormChange({ ...form, email: event.target.value })} /></label>
        <label>密碼<input data-testid="auth-password" type="password" value={form.password} onChange={(event) => onFormChange({ ...form, password: event.target.value })} /></label>
        <div className="auth-actions">
          <button className="primary-button" data-testid="auth-submit" disabled={loading}>{mode === "login" ? "登入" : "建立帳號"}</button>
          <button className="secondary-button" data-testid="auth-mode-toggle" type="button" onClick={() => onModeChange(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "我要註冊學生帳號" : "已有帳號，改登入"}
          </button>
        </div>
      </form>
    </section>
  );
}

function ProblemWorkspace({
  problems,
  selectedSlug,
  selectedProblem,
  attemptState,
  remainingMs,
  canEdit,
  canSubmit,
  locked,
  code,
  sampleInputs,
  sampleOutputs,
  result,
  loading,
  onSelectProblem,
  onCodeChange,
  onSampleInputChange,
  onSampleOutputChange,
  onStart,
  onRun,
  onSubmit,
  onEditorBlocked
}: {
  problems: Array<[number, Problem[]]>;
  selectedSlug: string;
  selectedProblem: Problem | null;
  attemptState: AttemptState | null;
  remainingMs: number;
  canEdit: boolean;
  canSubmit: boolean;
  locked: boolean;
  code: string;
  sampleInputs: Record<number, string>;
  sampleOutputs: Record<number, string>;
  result: GradeResult | null;
  loading: boolean;
  onSelectProblem: (slug: string) => void;
  onCodeChange: (value: string) => void;
  onSampleInputChange: (id: number, value: string) => void;
  onSampleOutputChange: (id: number, value: string) => void;
  onStart: () => void;
  onRun: () => void;
  onSubmit: () => void;
  onEditorBlocked: (message: string) => void;
}) {
  return (
    <div className="workspace-grid arena-page">
      <aside className="problem-sidebar panel">
        <h2>題目列表</h2>
        <p>1-10 週，每週 5 題。Submit 每題每天最多 3 次，Test 不限次數。</p>
        {problems.map(([week, weekProblems]) => (
          <div className="week-group" key={week}>
            <h3>Week {week}</h3>
            {weekProblems.map((problem) => (
              <button
                key={problem.slug}
                className={selectedSlug === problem.slug ? "problem-link active" : "problem-link"}
                disabled={locked}
                title={locked ? "測驗中不能切換題目" : undefined}
                onClick={() => onSelectProblem(problem.slug)}
              >
                <span>{problem.title}</span>
                <small>{problem.bestScore == null ? "未提交" : `最佳 ${problem.bestScore}%`}</small>
              </button>
            ))}
          </div>
        ))}
      </aside>
      {selectedProblem ? (
        <section className="arena-workspace">
          <div className="problem-pane">
            <ProblemStatement problem={selectedProblem} />
            <Samples
              tests={selectedProblem.publicTests || []}
              sampleInputs={sampleInputs}
              sampleOutputs={sampleOutputs}
              canEdit={canEdit}
              onSampleInputChange={onSampleInputChange}
              onSampleOutputChange={onSampleOutputChange}
            />
          </div>
          <div className="code-pane">
            <AttemptPanel problem={selectedProblem} attemptState={attemptState} remainingMs={remainingMs} loading={loading} onStart={onStart} />
            <Editor
              code={code}
              canEdit={canEdit}
              canSubmit={canSubmit}
              loading={loading}
              result={result}
              onCodeChange={onCodeChange}
              onRun={onRun}
              onSubmit={onSubmit}
              onBlocked={onEditorBlocked}
            />
          </div>
        </section>
      ) : (
        <div className="panel empty-state">目前沒有題目。</div>
      )}
    </div>
  );
}

function ProblemStatement({ problem }: { problem: Problem }) {
  return (
    <section className="problem-card statement-card">
      <div className="problem-title-row">
        <div>
          <h1>{problem.title}</h1>
          <div className="problem-meta">
            <span>難度：{"★".repeat(problem.difficulty)}{"☆".repeat(3 - problem.difficulty)}</span>
            <span>|</span>
            <span>{problem.category}</span>
            <span>|</span>
            <span>{problem.isOpen ? "開放作答" : "暫停作答"}</span>
          </div>
        </div>
        <div className="time-limit">時限：{Math.round(problem.timeLimitSeconds / 60)} 分鐘</div>
      </div>
      <div className="rule" />
      <h2>題目描述</h2>
      <p>{problem.statement}</p>
      <h2>輸入格式</h2>
      <p>{problem.inputFormat}</p>
      <h2>輸出格式</h2>
      <p>{problem.outputFormat}</p>
      <h2>限制</h2>
      <p>{problem.constraintsText}</p>
      <p>請實作函式 <code>{problem.functionName}({problem.signature.join(", ")})</code>。</p>
    </section>
  );
}

function AttemptPanel({
  problem,
  attemptState,
  remainingMs,
  loading,
  onStart
}: {
  problem: Problem;
  attemptState: AttemptState | null;
  remainingMs: number;
  loading: boolean;
  onStart: () => void;
}) {
  const active = attemptState?.activeAttempt;
  const used = attemptState?.dailyUsed ?? 0;
  const limit = attemptState?.dailyLimit ?? 3;
  return (
    <section className="panel attempt-panel">
      <div>
        <h2>作答</h2>
        <p>按開始後才可編輯。Test 不限次數；Submit 每題每天最多 3 次。作答中會鎖定導覽與題目切換。</p>
      </div>
      <div className="attempt-controls">
        <div className={active ? "timer-badge active" : "timer-badge"}>{active ? formatDuration(remainingMs) : "尚未開始"}</div>
        <span>今日 Submit {used}/{limit}</span>
        <button className="primary-button" data-testid="start-attempt" disabled={loading || !problem.isOpen || !attemptState?.canStart} onClick={onStart}>
          開始
        </button>
      </div>
      {attemptState && !attemptState.canSubmit && <p className="empty-state">今日 Submit 次數已用完，仍可 Test，但不能再 Submit。</p>}
    </section>
  );
}

function Samples({
  tests,
  sampleInputs,
  sampleOutputs,
  canEdit,
  onSampleInputChange,
  onSampleOutputChange
}: {
  tests: PublicTest[];
  sampleInputs: Record<number, string>;
  sampleOutputs: Record<number, string>;
  canEdit: boolean;
  onSampleInputChange: (id: number, value: string) => void;
  onSampleOutputChange: (id: number, value: string) => void;
}) {
  return (
    <section className="panel sample-panel">
      <h2>Sample Testcase</h2>
      <p className="empty-state">題目頁只顯示 sample。按開始後可編輯 sample input 與 expected output，再按 Test 測試。</p>
      <div className="sample-grid editable">
        {tests.map((test) => (
          <article className="sample-item" key={test.id}>
            <strong>{test.name}</strong>
            <label>
              Input
              <textarea
                className="sample-input"
                data-testid={`sample-input-${test.id}`}
                value={sampleInputs[test.id] || ""}
                disabled={!canEdit}
                onChange={(event) => onSampleInputChange(test.id, event.target.value)}
              />
            </label>
            <label>
              Expected
              <textarea
                className="sample-input sample-output"
                data-testid={`sample-output-${test.id}`}
                value={sampleOutputs[test.id] || ""}
                disabled={!canEdit}
                onChange={(event) => onSampleOutputChange(test.id, event.target.value)}
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

function Editor({
  code,
  canEdit,
  canSubmit,
  loading,
  result,
  onCodeChange,
  onRun,
  onSubmit,
  onBlocked
}: {
  code: string;
  canEdit: boolean;
  canSubmit: boolean;
  loading: boolean;
  result: GradeResult | null;
  onCodeChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onBlocked: (message: string) => void;
}) {
  const lineNumbers = useMemo(() => code.split("\n").map((_, index) => index + 1).join("\n"), [code]);
  const highlightedCode = useMemo(() => highlightPython(code), [code]);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!canEdit) {
      event.preventDefault();
      onBlocked("請先按開始作答");
      return;
    }
    if (event.key !== "Tab") return;
    event.preventDefault();
    applyTab(event.currentTarget, event.shiftKey, onCodeChange);
  }

  function blockClipboard(event: ClipboardEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    onBlocked("競賽模式禁止在編輯器內複製、剪下或貼上");
  }

  function syncEditorScroll(event: UIEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = target.scrollTop;
      highlightRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  }

  return (
    <section className="editor-section">
      <div className="editor-heading">
        <h2>Code</h2>
        <span>Python 3｜Tab 可縮排｜禁止複製貼上</span>
      </div>
      <div className={canEdit ? "arena-editor" : "arena-editor locked"}>
        <pre ref={gutterRef} className="line-gutter" aria-hidden="true">{lineNumbers}</pre>
        <div className="code-layer">
          <pre ref={highlightRef} className="code-highlight" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          <textarea
            className="code-editor"
            data-testid="code-editor"
            spellCheck={false}
            wrap="off"
            value={code}
            readOnly={!canEdit}
            onChange={(event) => onCodeChange(event.target.value)}
            onScroll={syncEditorScroll}
            onKeyDown={handleKeyDown}
            onCopy={blockClipboard}
            onCut={blockClipboard}
            onPaste={blockClipboard}
            onContextMenu={(event) => event.preventDefault()}
            onFocus={() => {
              if (!canEdit) onBlocked("請先按開始作答，倒數開始後才可編輯");
            }}
          />
        </div>
      </div>
      <div className="editor-actions">
        <button className="secondary-button" data-testid="run-tests" disabled={loading || !canEdit} onClick={onRun}>Test</button>
        <button className="primary-button" data-testid="submit-code" disabled={loading || !canSubmit} onClick={onSubmit}>Submit</button>
      </div>
      <ResultBox result={result} />
    </section>
  );
}

function ResultBox({ result }: { result: GradeResult | null }) {
  return (
    <div className="result-box">
      <div className="result-header">
        <strong>Result</strong>
        <span>{result ? `${result.passedTests}/${result.totalTests}` : "尚未執行"}</span>
      </div>
      {result ? (
        <div className="result-list">
          {result.details.map((detail) => (
            <div className={detail.passed ? "test-pass" : "test-fail"} key={detail.id}>
              <strong>{detail.passed ? "通過" : "失敗"}：{detail.name}</strong>
              <span>{detail.message}</span>
              <div className="case-debug">
                {detail.args !== undefined && <DebugBlock label="Input" value={detail.args} />}
                {detail.expected !== undefined && <DebugBlock label="Expected" value={detail.expected} />}
                {detail.actual !== undefined && <DebugBlock label="Actual" value={detail.actual} />}
                {detail.error && <DebugBlock label="Error" value={detail.error} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="result-placeholder">按 Test 執行 sample；按 Submit 送出全部測資。</p>
      )}
    </div>
  );
}

function DebugBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <small>{label}</small>
      <pre>{typeof value === "string" ? value : prettyJson(value)}</pre>
    </div>
  );
}

function TutorialView() {
  return (
    <section className="tutorial-page">
      <section className="tutorial-hero">
        <div>
          <span className="eyebrow">Student Guide</span>
          <h1>使用教學</h1>
          <p>
            依照這個流程完成作答：先讀題、按開始、用 Test 驗證 sample，最後再 Submit。
            開始後請留在本題，系統會計時並記錄離開與切換視窗。
          </p>
        </div>
        <div className="tutorial-callout">
          <strong>重點規則</strong>
          <span>Test 不限次數，Submit 每題每天 3 次。</span>
        </div>
      </section>

      <section className="tutorial-grid" aria-label="作答流程">
        {TUTORIAL_STEPS.map((step, index) => (
          <article className="tutorial-card" key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="panel tutorial-section">
        <div className="panel-heading split">
          <div>
            <h1>作答時要注意</h1>
            <p>這些規則和正式競賽紀錄直接相關。</p>
          </div>
        </div>
        <div className="tutorial-rules">
          <div>
            <strong>Sample 可編輯</strong>
            <p>按開始後，Sample Input 與 Expected Output 都可以自行改，用來驗證自己的想法。</p>
          </div>
          <div>
            <strong>錯誤會顯示測資</strong>
            <p>Submit 失敗時會顯示造成錯誤的公開測資、Expected、Actual 與錯誤訊息。</p>
          </div>
          <div>
            <strong>編輯器限制</strong>
            <p>支援 Tab 縮排與 Python 顏色標示，但不能複製、剪下、貼上或開右鍵選單。</p>
          </div>
        </div>
      </section>

      {/* <section className="panel tutorial-section">
        <div className="panel-heading split">
          <div>
            <h1>範例題目答案</h1>
            <p>以下提供 Week 1 五題的參考寫法，適合第一次使用平台時練習輸入、Test 與 Submit 流程。</p>
          </div>
        </div>
        <div className="answer-list">
          {TUTORIAL_SOLUTIONS.map((solution) => (
            <article className="answer-card" key={solution.functionName}>
              <div className="answer-heading">
                <div>
                  <h2>{solution.title}</h2>
                  <code>{solution.functionName}</code>
                </div>
                <p>{solution.note}</p>
              </div>
              <pre
                className="tutorial-code"
                dangerouslySetInnerHTML={{ __html: highlightPython(solution.code) }}
              />
            </article>
          ))}
        </div>
      </section> */}
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
    <section className="leaderboard-page">
      <div className="leaderboard-heading">
        <div>
          <h1>全站總排行榜</h1>
          <p>此排名針對全部題目，不是單題排行榜。核心指標是每題排名的平均值。</p>
        </div>
        <button className="secondary-button" data-testid="leaderboard-rules" onClick={() => setShowRules((current) => !current)}>
          排名說明
        </button>
      </div>
      {showRules && explanation && (
        <section className="panel ranking-rules">
          <h2>{explanation.title}</h2>
          <p>{explanation.summary}</p>
          <p>{explanation.perProblemScore}</p>
          <p>{explanation.ranking}</p>
          <p>{explanation.tieBreakers}</p>
        </section>
      )}
      <section className="panel">
        {leaderboard.length === 0 ? (
          <p className="empty-state">目前尚無學生提交，排行榜歸零。</p>
        ) : (
          <table className="ranking-table global-ranking">
            <thead>
              <tr>
                <th>排名</th>
                <th>學生</th>
                <th>平均題目排名</th>
                <th>解題</th>
                <th>平均題目分</th>
                <th>Submit</th>
                <th>失敗</th>
                <th>總時間</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.studentId}>
                  <td>{entry.rank}</td>
                  <td>{entry.name}<span>學號：{entry.studentId}</span></td>
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

function ProgressView({ user, progress }: { user: User | null; progress: unknown[] }) {
  if (!user) return <section className="panel">請先登入。</section>;
  return (
    <section className="panel">
      <h1>我的進度</h1>
      <p>所有進度由 submissions 資料表即時計算。</p>
      <table className="ranking-table">
        <thead><tr><th>週次</th><th>題目</th><th>Submit</th><th>最佳分數</th><th>最後提交</th></tr></thead>
        <tbody>
          {progress.map((row: any) => (
            <tr key={row.id}>
              <td>Week {row.week}</td>
              <td>{row.title}</td>
              <td>{row.submissions}</td>
              <td>{row.best_score == null ? "-" : `${row.best_score}%`}</td>
              <td>{row.last_submission || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TeacherView({
  user,
  dashboard,
  problems,
  onToggleProblem
}: {
  user: User | null;
  dashboard: Dashboard | null;
  problems: Problem[];
  onToggleProblem: (problem: Problem) => void;
}) {
  if (user?.role !== "admin") return <section className="panel">需要管理員帳號。</section>;
  return (
    <section className="teacher-dashboard">
      <div className="panel-heading">
        <h1>教師後台</h1>
        <p>所有統計都來自資料庫。</p>
      </div>
      <div className="metric-row">
        <MetricCard label="學生數" value={String(dashboard?.counts.students ?? 0)} hint="註冊學生帳號" />
        <MetricCard label="題目數" value={String(dashboard?.counts.problems ?? 0)} hint="1-10 週，每週 5 題" />
        <MetricCard label="作答紀錄" value={String(dashboard?.counts.attempts ?? 0)} hint="開始、逾時、離開紀錄" />
        <MetricCard label="Submit" value={String(dashboard?.counts.submissions ?? 0)} hint="實際提交紀錄" />
      </div>
      <section className="panel">
        <h2>題目開放管理</h2>
        <div className="admin-problem-list">
          {problems.map((problem) => (
            <div className="admin-row" key={problem.id}>
              <span>Week {problem.week}</span>
              <strong>{problem.title}</strong>
              <button className={problem.isOpen ? "secondary-button compact" : "primary-button compact"} onClick={() => onToggleProblem(problem)}>
                {problem.isOpen ? "關閉作答" : "開放作答"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
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

function buildSampleCases(problem: Problem, inputs: Record<number, string>, outputs: Record<number, string>): SampleCasePayload[] {
  return (problem.publicTests || []).map((test) => {
    const inputText = inputs[test.id] || "[]";
    const outputText = outputs[test.id] || "";
    const args = JSON.parse(inputText);
    if (!Array.isArray(args)) throw new Error(`${test.name} Input 必須是 JSON array`);
    const expected = outputText.trim() ? JSON.parse(outputText) : undefined;
    return {
      id: test.id,
      name: test.name,
      args,
      ...(outputText.trim() ? { expected, comparator: test.comparator } : {})
    };
  });
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

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
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
  return error instanceof Error ? error.message : "未知錯誤";
}

export default App;
