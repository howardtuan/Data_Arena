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
type Language = "zh" | "en";
type ProblemPanelTab = "description" | "submissions";

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
  seriesTitleEn?: string;
  title: string;
  titleEn?: string;
  difficulty: number;
  category: string;
  categoryEn?: string;
  timeLimitSeconds: number;
  functionName: string;
  signature: string[];
  statement: string;
  statementEn?: string;
  inputFormat: string;
  inputFormatEn?: string;
  outputFormat: string;
  outputFormatEn?: string;
  constraintsText: string;
  constraintsTextEn?: string;
  starterCode: string;
  isOpen: boolean;
  bestScore?: number | null;
  submissions?: number;
  publicTests?: PublicTest[];
  bestSubmission?: Submission | null;
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
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  perProblemScore: string;
  perProblemScoreEn?: string;
  ranking: string;
  rankingEn?: string;
  tieBreakers: string;
  tieBreakersEn?: string;
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
  seriesTitleEn: string;
  title: string;
  titleEn: string;
  difficulty: string;
  category: string;
  categoryEn: string;
  timeLimitSeconds: string;
  functionName: string;
  signature: string;
  statement: string;
  statementEn: string;
  inputFormat: string;
  inputFormatEn: string;
  outputFormat: string;
  outputFormatEn: string;
  constraintsText: string;
  constraintsTextEn: string;
  starterCode: string;
  publicTestsText: string;
  hiddenTestsText: string;
  isOpen: boolean;
};

type TestVisibility = "public" | "hidden";

type ProgressRow = {
  id: number;
  slug: string;
  title: string;
  title_en?: string;
  week: number;
  submissions: number;
  best_score: number | null;
  last_submission: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "dataarena_token";
const LANGUAGE_KEY = "dataarena_language";

const COPY = {
  zh: {
    languageButton: "EN",
    languageLabel: "切換成英文",
    nav: {
      problems: "題庫",
      leaderboard: "排行榜",
      progress: "進度",
      guide: "指南",
      teacher: "教師後台",
      menu: "主選單"
    },
    auth: {
      authArea: "登入註冊",
      login: "登入",
      logout: "登出",
      register: "註冊",
      name: "姓名",
      studentId: "學號",
      password: "密碼",
      submitRegister: "建立學生帳號",
      tabsLabel: "登入或註冊"
    },
    common: {
      week: "週次",
      problem: "題目",
      submit: "Submit",
      run: "Run",
      closed: "已關閉",
      solved: "已解出",
      loading: "載入中",
      noData: "目前沒有資料",
      unknownError: "發生未知錯誤"
    },
    difficulties: {
      1: "簡單",
      2: "中等",
      3: "困難"
    },
    status: {
      loggedIn: (name: string) => `已登入：${name}`,
      loggedOut: "已登出",
      loginForProgress: "請先登入後查看 Progress。",
      teacherOnly: "只有老師帳號可以進入 Teacher。",
      loginRequired: "請先登入後 Run 或 Submit。",
      startBeforeRun: "此題目前不可作答。",
      runPassed: "Run 通過公開測資。",
      runFailed: "Run 未通過，請查看 Test Result。",
      startBeforeSubmit: "此題目前不可提交。",
      submitAccepted: "Submit Accepted。",
      submitFailed: "Submit 已送出，但尚未通過全部測資。",
      openedProblem: "題目已開放給學生。",
      closedProblem: "題目已關閉，學生列表不會再看到。",
      createdProblem: (title: string) => `已建立題目：${title}`
    },
    problems: {
      title: "題庫",
      signedInHint: (name: string) => `${name}，選擇一題開始練習。`,
      guestHint: "選擇題目開始練習；登入後可以記錄進度與分數。",
      count: (shown: number, total: number) => `${shown}/${total} 題`,
      searchPlaceholder: "搜尋題目",
      difficultyLabel: "難度篩選",
      all: "全部",
      solved: (solved: number, total: number) => `${solved}/${total} 已解`,
      empty: "目前沒有符合條件的題目。"
    },
    workspace: {
      back: "返回題庫",
      pickerLabel: "選擇題目",
      empty: "目前沒有可顯示的題目。",
      description: "題目敘述",
      submissions: "提交紀錄",
      submissionLogin: "請先登入，就可以查看這題的提交紀錄。",
      submissionEmpty: "目前還沒有提交紀錄。完成一次 Submit 後，紀錄會顯示在這裡。",
      submissionLoadFailed: "提交紀錄載入失敗，請稍後再試。",
      submissionDetails: "測資結果",
      submissionHeaders: ["時間", "結果", "分數", "測資", "執行時間"],
      accepted: "通過",
      notAccepted: "未通過",
      example: (index: number) => `範例 ${index}:`,
      inputFormat: "輸入格式",
      outputFormat: "輸出格式",
      constraints: "限制條件",
      code: "程式碼",
      auto: "自動",
      editorLabel: "Python 程式碼編輯器",
      testcase: "測資",
      testResult: "測試結果",
      case: (index: number) => `案例 ${index}`,
      inputArgs: "input args =",
      output: "output =",
      noPublicTests: "這題尚未設定公開範例測資。",
      resultPlaceholder: "Run 或 Submit 後會顯示結果。",
      score: (passed: number, total: number, runtime: number, score: number) => `${passed}/${total} tests · ${runtime}ms · score ${score}`
    },
    guide: {
      title: "指南",
      intro: "學生從題庫選題後可直接編輯 Python function，Run 測公開測資，Submit 送公開與隱藏測資。",
      cards: [
        ["1. 選題", "題目列表只會顯示老師開放的題目。老師關閉後，學生看不到也不能直接開 URL 作答。"],
        ["2. 作答", "點進題目後可直接編輯程式碼，也可拖曳左右與上下分隔線調整題目敘述、程式碼、測資三個區塊大小。"],
        ["3. 上傳題目", "老師可在教師後台建立中英文題目、測資與 starter function，預設建立後立即開放。"]
      ]
    },
    leaderboard: {
      title: "排行榜",
      intro: "依每題得分、submit 次數與失敗次數計算排名。",
      rules: "排名規則",
      empty: "目前還沒有排行榜資料。",
      fallbackTitle: "排名規則",
      fallbackSummary: "每題都會計算題目分，再取所有開放題目的平均排名。",
      fallbackScore: "題目分包含最佳分數、submit 次數效率與失敗次數效率。",
      fallbackRanking: "平均排名越低，總排名越前面。",
      fallbackTie: "同分時依解題數、平均題目分、總 submit 次數與總失敗次數排序。",
      headers: ["排名", "學生", "平均排名", "解題", "平均分", "Submit", "失敗"]
    },
    progress: {
      title: "進度",
      login: "請先登入。",
      intro: "查看每一題的 submit 次數、最佳分數與最後提交時間。",
      headers: ["週次", "題目", "Submit", "最佳分數", "最後提交"]
    },
    teacher: {
      title: "教師後台",
      denied: "只有老師帳號可以進入此頁。",
      intro: "管理題目開放狀態，或上傳新的雙語 Python function 題目與測資。",
      manage: "題目管理",
      upload: "上傳題目",
      metrics: {
        students: "學生",
        studentsHint: "已註冊學生",
        problems: "題目",
        problemsHint: (count: number) => `${count} 題開放中`,
        submissions: "Submit",
        submissionsHint: (count: number) => `${count} 次通過`
      },
      manageTitle: "題目開放 / 關閉",
      manageHint: "預設所有題目開放；關閉後學生列表會隱藏。",
      visible: "學生可見",
      closed: "已關閉",
      close: "關閉題目",
      open: "開放題目"
    },
    upload: {
      title: "上傳題目",
      reset: "載入雙語範例題目",
      slug: "Slug",
      week: "週次",
      seriesTitle: "系列名稱（中文）",
      seriesTitleEn: "系列名稱（英文）",
      titleZh: "題目名稱（中文）",
      titleEn: "題目名稱（英文）",
      difficulty: "難度",
      category: "分類（中文）",
      categoryEn: "分類（英文）",
      functionName: "Function name",
      signature: "Signature",
      statement: "題目敘述（中文）",
      statementEn: "題目敘述（英文）",
      inputFormat: "Input Format（中文）",
      inputFormatEn: "Input Format（英文）",
      outputFormat: "Output Format（中文）",
      outputFormatEn: "Output Format（英文）",
      constraints: "Constraints（中文）",
      constraintsEn: "Constraints（英文）",
      starter: "Starter Code / 範例 func",
      publicTests: "公開測資 JSON",
      hiddenTests: "隱藏測資 JSON",
      openNow: "建立後立即開放給學生",
      submit: "建立題目",
      guideTitle: "老師上傳題目教學",
      guideItems: [
        ["Function name：", "填學生必須實作的函式名稱，例如 normalize_scores。"],
        ["Signature：", "填參數順序並用逗號分隔，例如 records。系統會用 function(*args) 呼叫。"],
        ["雙語欄位：", "中文與英文題名、敘述、輸入格式、輸出格式、限制條件都要填，語言切換時才有完整內容。"],
        ["Starter Code：", "必須包含同名函式。可以給 pass，也可以給提示版本。"],
        ["測資 args：", "一定要是 JSON array，順序對應 signature。"],
        ["公開測資：", "會顯示在學生 Testcase，也會在 Run 時執行。"],
        ["隱藏測資：", "只在 Submit 評分時執行，不會把輸入與答案顯示給學生。"],
        ["Visibility：", "不用在 JSON 裡填 visibility；系統會依所在區塊自動寫入 public 或 hidden。"]
      ],
      publicTestsExample: "公開測資 JSON 範例",
      hiddenTestsExample: "隱藏測資 JSON 範例",
      starterExample: "最小 Starter Code"
    }
  },
  en: {
    languageButton: "中文",
    languageLabel: "Switch to Chinese",
    nav: {
      problems: "Problems",
      leaderboard: "Leaderboard",
      progress: "Progress",
      guide: "Guide",
      teacher: "Teacher",
      menu: "Main menu"
    },
    auth: {
      authArea: "Login and registration",
      login: "Log in",
      logout: "Log out",
      register: "Register",
      name: "Name",
      studentId: "Student ID",
      password: "Password",
      submitRegister: "Create student account",
      tabsLabel: "Login or register"
    },
    common: {
      week: "Week",
      problem: "Problem",
      submit: "Submit",
      run: "Run",
      closed: "Closed",
      solved: "Solved",
      loading: "Loading",
      noData: "No data yet",
      unknownError: "Unknown error"
    },
    difficulties: {
      1: "Easy",
      2: "Medium",
      3: "Hard"
    },
    status: {
      loggedIn: (name: string) => `Signed in as ${name}`,
      loggedOut: "Signed out",
      loginForProgress: "Please log in to view Progress.",
      teacherOnly: "Only teacher accounts can enter Teacher.",
      loginRequired: "Please log in before Run or Submit.",
      startBeforeRun: "This problem is not available for solving.",
      runPassed: "Run passed the public cases.",
      runFailed: "Run failed. Check Test Result.",
      startBeforeSubmit: "This problem is not available for submission.",
      submitAccepted: "Submit Accepted.",
      submitFailed: "Submitted, but not all tests passed.",
      openedProblem: "The problem is now visible to students.",
      closedProblem: "The problem is closed and hidden from student lists.",
      createdProblem: (title: string) => `Problem created: ${title}`
    },
    problems: {
      title: "Problem List",
      signedInHint: (name: string) => `${name}, choose a problem to practice.`,
      guestHint: "Choose a problem to practice. Log in to track progress and scores.",
      count: (shown: number, total: number) => `${shown}/${total} problems`,
      searchPlaceholder: "Search problems",
      difficultyLabel: "Difficulty filter",
      all: "All",
      solved: (solved: number, total: number) => `${solved}/${total} Solved`,
      empty: "No problems match the current filters."
    },
    workspace: {
      back: "Back to Problems",
      pickerLabel: "Choose problem",
      empty: "No problem is available.",
      description: "Description",
      submissions: "Submissions",
      submissionLogin: "Please log in to view your submissions for this problem.",
      submissionEmpty: "No submissions yet. Submit once and your record will appear here.",
      submissionLoadFailed: "Could not load submissions. Please try again later.",
      submissionDetails: "Test details",
      submissionHeaders: ["Time", "Result", "Score", "Tests", "Runtime"],
      accepted: "Accepted",
      notAccepted: "Not accepted",
      example: (index: number) => `Example ${index}:`,
      inputFormat: "Input Format",
      outputFormat: "Output Format",
      constraints: "Constraints",
      code: "Code",
      auto: "Auto",
      editorLabel: "Python code editor",
      testcase: "Testcase",
      testResult: "Test Result",
      case: (index: number) => `Case ${index}`,
      inputArgs: "input args =",
      output: "output =",
      noPublicTests: "This problem has no public sample cases yet.",
      resultPlaceholder: "Results appear after Run or Submit.",
      score: (passed: number, total: number, runtime: number, score: number) => `${passed}/${total} tests · ${runtime}ms · score ${score}`
    },
    guide: {
      title: "Guide",
      intro: "Students choose a problem, edit a Python function directly, Run public cases, and Submit public plus hidden cases.",
      cards: [
        ["1. Choose", "The list only shows problems opened by the teacher. Closed problems are hidden from students and cannot be opened directly."],
        ["2. Solve", "Inside a problem, edit code directly and drag the splitters to resize Description, Code, and Testcase panels."],
        ["3. Upload", "Teachers can create bilingual problems, test cases, and starter functions in Teacher. New problems are open by default."]
      ]
    },
    leaderboard: {
      title: "Leaderboard",
      intro: "Ranks are calculated from per-problem score, submit count, and failure count.",
      rules: "Ranking rules",
      empty: "No leaderboard data yet.",
      fallbackTitle: "Ranking Rules",
      fallbackSummary: "Each open problem gets a problem score, then average rank is calculated across all open problems.",
      fallbackScore: "Problem score includes best score, submit efficiency, and failure efficiency.",
      fallbackRanking: "Lower average rank means a higher global rank.",
      fallbackTie: "Ties compare solved count, average problem score, total submissions, and total failures.",
      headers: ["Rank", "Student", "Avg. rank", "Solved", "Avg. score", "Submit", "Failures"]
    },
    progress: {
      title: "Progress",
      login: "Please log in.",
      intro: "Review submit count, best score, and last submission time for each problem.",
      headers: ["Week", "Problem", "Submit", "Best score", "Last submission"]
    },
    teacher: {
      title: "Teacher",
      denied: "Only teacher accounts can enter this page.",
      intro: "Manage problem visibility, or upload new bilingual Python function problems and test cases.",
      manage: "Manage",
      upload: "Upload",
      metrics: {
        students: "Students",
        studentsHint: "Registered students",
        problems: "Problems",
        problemsHint: (count: number) => `${count} open`,
        submissions: "Submit",
        submissionsHint: (count: number) => `${count} passed`
      },
      manageTitle: "Open / Close Problems",
      manageHint: "Problems are open by default. Closed problems are hidden from students.",
      visible: "Visible",
      closed: "Closed",
      close: "Close",
      open: "Open"
    },
    upload: {
      title: "Upload Problem",
      reset: "Load bilingual sample",
      slug: "Slug",
      week: "Week",
      seriesTitle: "Series title (Chinese)",
      seriesTitleEn: "Series title (English)",
      titleZh: "Problem title (Chinese)",
      titleEn: "Problem title (English)",
      difficulty: "Difficulty",
      category: "Category (Chinese)",
      categoryEn: "Category (English)",
      functionName: "Function name",
      signature: "Signature",
      statement: "Statement (Chinese)",
      statementEn: "Statement (English)",
      inputFormat: "Input Format (Chinese)",
      inputFormatEn: "Input Format (English)",
      outputFormat: "Output Format (Chinese)",
      outputFormatEn: "Output Format (English)",
      constraints: "Constraints (Chinese)",
      constraintsEn: "Constraints (English)",
      starter: "Starter Code / sample func",
      publicTests: "Public test cases JSON",
      hiddenTests: "Hidden test cases JSON",
      openNow: "Open to students immediately",
      submit: "Create problem",
      guideTitle: "Teacher Upload Guide",
      guideItems: [
        ["Function name: ", "Use the Python function students must implement, such as normalize_scores."],
        ["Signature: ", "List parameters in call order, separated by commas. The system calls function(*args)."],
        ["Bilingual fields: ", "Fill Chinese and English titles, statements, input/output formats, and constraints so language switching has complete content."],
        ["Starter Code: ", "Must include the same function name. You can provide pass or a hinted version."],
        ["Test args: ", "Must be a JSON array matching the signature order."],
        ["Public tests: ", "Shown in the student Testcase panel and executed by Run."],
        ["Hidden tests: ", "Executed only by Submit and never reveal input or expected output to students."],
        ["Visibility: ", "Do not add visibility in JSON. The system assigns public or hidden from the section."]
      ],
      publicTestsExample: "Public Test JSON Example",
      hiddenTestsExample: "Hidden Test JSON Example",
      starterExample: "Minimal Starter Code"
    }
  }
} as const;

type Copy = (typeof COPY)[Language];

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
  slug: "dataset-shape-template",
  week: "1",
  seriesTitle: "資料科學與 KDD 基礎",
  seriesTitleEn: "Data Science and KDD Foundations",
  title: "盤點資料表規模",
  titleEn: "Inspect Dataset Shape",
  difficulty: "1",
  category: "資料科學基礎",
  categoryEn: "Data Science Foundations",
  timeLimitSeconds: "1800",
  functionName: "dataset_shape",
  signature: "records",
  statement:
    "在開始任何資料探勘任務前，資料科學家需要先確認資料集的基本規模。你會拿到以 list[dict] 表示的資料表，每個 dict 是一列資料。因為真實資料可能來自不同來源，不同列不一定有完全相同的欄位。請回傳列數與所有曾出現過的欄位數。",
  statementEn:
    "Before any data mining task, a data scientist first checks the basic size of the dataset. You receive a table represented as list[dict], where each dict is one row. Real data may come from multiple sources, so different rows may not contain the same keys. Return the row count and the number of distinct columns observed across all rows.",
  inputFormat: "records: list[dict]，每個 dict 代表一列資料。",
  inputFormatEn: "records: list[dict], where each dict represents one data row.",
  outputFormat: "dict，格式為 {\"rows\": int, \"columns\": int}。",
  outputFormatEn: "dict in the form {\"rows\": int, \"columns\": int}.",
  constraintsText: "不要修改輸入資料。\n欄位數以所有列的 key 聯集計算。\n空資料集的 rows 與 columns 都為 0。",
  constraintsTextEn: "Do not mutate the input.\nThe column count is the union of keys across rows.\nAn empty dataset has 0 rows and 0 columns.",
  starterCode:
    "def dataset_shape(records):\n    # TODO: implement your solution.\n    pass\n",
  publicTestsText: JSON.stringify(
    [
      {
        name: "Sample 1",
        args: [[{ age: 20, city: "TPE" }, { age: 21, score: 80 }]],
        expected: { rows: 2, columns: 3 },
        comparator: "exact"
      },
      {
        name: "Sample 2",
        args: [[]],
        expected: { rows: 0, columns: 0 },
        comparator: "exact"
      }
    ],
    null,
    2
  ),
  hiddenTestsText: JSON.stringify(
    [
      {
        name: "Hidden 1",
        args: [[{ a: 1 }, { b: 2, c: 3 }, { a: 4, c: 5 }]],
        expected: { rows: 3, columns: 3 },
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
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "zh"));
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [workspaceSplit, setWorkspaceSplit] = useState(43);
  const [testSplit, setTestSplit] = useState(64);
  const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);

  const canEdit = Boolean(selectedProblem && (selectedProblem.isOpen || user?.role === "admin"));
  const canSubmit = canEdit;
  const selectedIndex = problems.findIndex((problem) => problem.slug === selectedSlug);
  const copy = COPY[language];

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

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
      setStatus(readError(error, copy.common.unknownError));
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
      setSampleInputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.args)])));
      setSampleOutputs(Object.fromEntries((response.problem.publicTests || []).map((test) => [test.id, prettyJson(test.expected)])));
    } catch (error) {
      setSelectedProblem(null);
      setStatus(readError(error, copy.common.unknownError));
    }
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
      setStatus(copy.status.loggedIn(response.user.name));

      const problemResponse = await api<{ problems: Problem[] }>("/api/problems", {}, response.token);
      setProblems(problemResponse.problems);
      setSelectedSlug((current) => current || problemResponse.problems[0]?.slug || "");
      setView(response.user.role === "admin" ? "teacher" : "problems");
    } catch (error) {
      setStatus(readError(error, copy.common.unknownError));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setProgress([]);
    setDashboard(null);
    setView("problems");
    setStatus(copy.status.loggedOut);

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
      setStatus(copy.status.loginForProgress);
      return;
    }
    if (nextView === "teacher" && user?.role !== "admin") {
      setStatus(copy.status.teacherOnly);
      return;
    }
    setStatus("");
    setView(nextView);
  }

  async function runCode() {
    if (!selectedProblem) return;
    if (!token) {
      openAuth("login");
      setStatus(copy.status.loginRequired);
      return;
    }
    if (!canEdit) {
      setStatus(copy.status.startBeforeRun);
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api<{ result: GradeResult }>(
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
      setStatus(response.result.passed ? copy.status.runPassed : copy.status.runFailed);
    } catch (error) {
      setStatus(readError(error, copy.common.unknownError));
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(force = false) {
    if (!selectedProblem) return;
    if (!token) {
      openAuth("login");
      setStatus(copy.status.loginRequired);
      return;
    }
    if (!force && !canSubmit) {
      setStatus(copy.status.startBeforeSubmit);
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api<{ result: GradeResult; submission: Submission }>(
        `/api/problems/${selectedProblem.slug}/submit`,
        { method: "POST", body: JSON.stringify({ code }) },
        token
      );
      setRunResult(response.result);
      setSubmissionRefreshKey((current) => current + 1);
      setStatus(response.result.passed ? copy.status.submitAccepted : copy.status.submitFailed);
      await bootstrap();
    } catch (error) {
      setStatus(readError(error, copy.common.unknownError));
    } finally {
      setLoading(false);
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
      setStatus(!problem.isOpen ? copy.status.openedProblem : copy.status.closedProblem);
      await Promise.all([loadAdmin(), bootstrap()]);
    } catch (error) {
      setStatus(readError(error, copy.common.unknownError));
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
      setStatus(copy.status.createdProblem(displayProblemTitle(response.problem, language)));
      setSelectedSlug(response.problem.slug);
      await Promise.all([loadAdmin(), bootstrap()]);
    } catch (error) {
      setStatus(readError(error, copy.common.unknownError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Topbar
        view={view}
        user={user}
        language={language}
        copy={copy}
        onView={goView}
        onAuth={openAuth}
        onLogout={logout}
        onLanguageChange={() => setLanguage((current) => (current === "zh" ? "en" : "zh"))}
      />

      {status && <div className="notice" role="status">{status}</div>}

      <main className={view === "workspace" ? "workspace-main" : "main-shell"}>
        {view === "auth" && (
          <AuthPage
            mode={authMode}
            form={authForm}
            loading={loading}
            copy={copy}
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
            language={language}
            copy={copy}
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
            canEdit={canEdit}
            canSubmit={canSubmit}
            loading={loading}
            token={token}
            language={language}
            copy={copy}
            submissionRefreshKey={submissionRefreshKey}
            workspaceSplit={workspaceSplit}
            testSplit={testSplit}
            onBack={() => goView("problems")}
            onOpenProblem={openProblem}
            onCodeChange={setCode}
            onSampleInputChange={(id, value) => setSampleInputs((current) => ({ ...current, [id]: value }))}
            onSampleOutputChange={(id, value) => setSampleOutputs((current) => ({ ...current, [id]: value }))}
            onActiveCase={setActiveCaseId}
            onRun={runCode}
            onSubmit={() => void submitCode(false)}
            onWorkspaceSplit={setWorkspaceSplit}
            onTestSplit={setTestSplit}
          />
        )}

        {view === "tutorial" && <TutorialView copy={copy} />}
        {view === "leaderboard" && <LeaderboardView leaderboard={leaderboard} explanation={leaderboardExplanation} language={language} copy={copy} />}
        {view === "progress" && <ProgressView user={user} progress={progress} language={language} copy={copy} />}
        {view === "teacher" && (
          <TeacherView
            user={user}
            dashboard={dashboard}
            problems={adminProblems}
            form={uploadForm}
            loading={loading}
            language={language}
            copy={copy}
            onToggleProblem={toggleProblemOpen}
            onFormChange={setUploadForm}
            onCreateProblem={createProblem}
            onResetTemplate={() => setUploadForm(DEFAULT_PROBLEM_FORM)}
          />
        )}
      </main>
    </div>
  );
}

function Topbar({
  view,
  user,
  language,
  copy,
  onView,
  onAuth,
  onLogout,
  onLanguageChange
}: {
  view: View;
  user: User | null;
  language: Language;
  copy: Copy;
  onView: (view: View) => void;
  onAuth: (mode: AuthMode) => void;
  onLogout: () => void;
  onLanguageChange: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand-logo" onClick={() => onView("problems")} aria-label="Data Arena">
          <span className="brand-data">Data</span>
          <span className="brand-arena">Arena</span>
        </button>

        <nav className="nav" aria-label={copy.nav.menu}>
          <button className={view === "problems" || view === "workspace" ? "nav-link active" : "nav-link"} onClick={() => onView("problems")}>
            {copy.nav.problems}
          </button>
          <button className={view === "leaderboard" ? "nav-link active" : "nav-link"} onClick={() => onView("leaderboard")}>
            {copy.nav.leaderboard}
          </button>
          <button className={view === "progress" ? "nav-link active" : "nav-link"} onClick={() => onView("progress")}>
            {copy.nav.progress}
          </button>
          <button className={view === "tutorial" ? "nav-link active" : "nav-link"} onClick={() => onView("tutorial")}>
            {copy.nav.guide}
          </button>
          {user?.role === "admin" && (
            <button className={view === "teacher" ? "nav-link active" : "nav-link"} onClick={() => onView("teacher")}>
              {copy.nav.teacher}
            </button>
          )}
        </nav>

        <div className="topbar-spacer" />

        <button className="language-toggle" type="button" onClick={onLanguageChange} aria-label={copy.languageLabel} aria-pressed={language === "en"}>
          {copy.languageButton}
        </button>

        {user ? (
          <div className="account-area">
            <span className="user-chip">{user.name}</span>
            <button className="ghost-button compact" onClick={onLogout}>{copy.auth.logout}</button>
          </div>
        ) : (
          <div className="topbar-auth" aria-label={copy.auth.authArea}>
            <button onClick={() => onAuth("login")}>{copy.auth.login}</button>
            <button onClick={() => onAuth("register")}>{copy.auth.register}</button>
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
  copy,
  onMode,
  onForm,
  onSubmit
}: {
  mode: AuthMode;
  form: { name: string; studentId: string; email: string; password: string };
  loading: boolean;
  copy: Copy;
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
        <div className="auth-tabs" role="tablist" aria-label={copy.auth.tabsLabel}>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => onMode("login")}>{copy.auth.login}</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => onMode("register")}>{copy.auth.register}</button>
        </div>

        {mode === "register" && (
          <>
            <label>
              {copy.auth.name}
              <input value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} autoComplete="name" />
            </label>
            <label>
              {copy.auth.studentId}
              <input value={form.studentId} onChange={(event) => onForm({ ...form, studentId: event.target.value })} autoComplete="off" />
            </label>
          </>
        )}

        <label>
          Email
          <input value={form.email} onChange={(event) => onForm({ ...form, email: event.target.value })} autoComplete="email" />
        </label>
        <label>
          {copy.auth.password}
          <input type="password" value={form.password} onChange={(event) => onForm({ ...form, password: event.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        <button className="primary-button auth-submit" disabled={loading}>
          {mode === "login" ? copy.auth.login : copy.auth.submitRegister}
        </button>
      </form>
    </section>
  );
}

function ProblemListView({
  user,
  problems,
  loading,
  language,
  copy,
  search,
  difficultyFilter,
  onSearch,
  onDifficultyFilter,
  onOpenProblem
}: {
  user: User | null;
  problems: Problem[];
  loading: boolean;
  language: Language;
  copy: Copy;
  search: string;
  difficultyFilter: DifficultyFilter;
  onSearch: (value: string) => void;
  onDifficultyFilter: (value: DifficultyFilter) => void;
  onOpenProblem: (slug: string) => void;
}) {
  const filteredProblems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return problems.filter((problem) => {
      const title = `${displayProblemTitle(problem, language)} ${displayProblemTitle(problem, language === "zh" ? "en" : "zh")}`.toLowerCase();
      const category = `${displayCategory(problem, language)} ${displayCategory(problem, language === "zh" ? "en" : "zh")}`.toLowerCase();
      const matchesSearch = !normalizedSearch || title.includes(normalizedSearch) || category.includes(normalizedSearch) || problem.functionName.includes(normalizedSearch);
      const matchesDifficulty = difficultyFilter === "all" || String(problem.difficulty) === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, search, difficultyFilter, language]);

  const solved = problems.filter((problem) => Number(problem.bestScore ?? 0) >= 100).length;

  return (
    <section className="problem-list-shell">
      <section className="problem-center">
        <div className="problem-list-heading">
          <div>
            <h1>{copy.problems.title}</h1>
            <p>{user ? copy.problems.signedInHint(user.name) : copy.problems.guestHint}</p>
          </div>
          <span>{copy.problems.count(filteredProblems.length, problems.length)}</span>
        </div>

        <div className="list-toolbar">
          <label className="problem-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={copy.problems.searchPlaceholder} />
          </label>
          <select value={difficultyFilter} onChange={(event) => onDifficultyFilter(event.target.value as DifficultyFilter)} aria-label={copy.problems.difficultyLabel}>
            <option value="all">{copy.problems.all}</option>
            <option value="1">{copy.difficulties[1]}</option>
            <option value="2">{copy.difficulties[2]}</option>
            <option value="3">{copy.difficulties[3]}</option>
          </select>
          <div className="solved-counter">
            <span className="progress-ring" />
            {copy.problems.solved(solved, problems.length)}
          </div>
        </div>

        <div className="question-list" aria-busy={loading}>
          {filteredProblems.length === 0 ? (
            <div className="empty-state padded">{copy.problems.empty}</div>
          ) : (
            filteredProblems.map((problem, index) => (
              <button className="question-row" key={problem.slug} onClick={() => onOpenProblem(problem.slug)}>
                <span className={Number(problem.bestScore ?? 0) >= 100 ? "row-status solved" : "row-status"}>{Number(problem.bestScore ?? 0) >= 100 ? "✓" : ""}</span>
                <strong>{index + 1}. {displayProblemTitle(problem, language)}</strong>
                <span className="row-category">{displayCategory(problem, language)}</span>
                <span className={`difficulty d${problem.difficulty}`}>{difficultyLabel(problem.difficulty, copy)}</span>
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
  canEdit,
  canSubmit,
  loading,
  token,
  language,
  copy,
  submissionRefreshKey,
  workspaceSplit,
  testSplit,
  onBack,
  onOpenProblem,
  onCodeChange,
  onSampleInputChange,
  onSampleOutputChange,
  onActiveCase,
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
  canEdit: boolean;
  canSubmit: boolean;
  loading: boolean;
  token: string;
  language: Language;
  copy: Copy;
  submissionRefreshKey: number;
  workspaceSplit: number;
  testSplit: number;
  onBack: () => void;
  onOpenProblem: (slug: string) => void;
  onCodeChange: (value: string) => void;
  onSampleInputChange: (id: number, value: string) => void;
  onSampleOutputChange: (id: number, value: string) => void;
  onActiveCase: (id: number) => void;
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
        <button className="ghost-button" onClick={onBack}>{copy.workspace.back}</button>
        <p>{copy.workspace.empty}</p>
      </section>
    );
  }

  return (
    <section className="workspace-shell">
      <div className="workspace-toolbar">
        <div className="problem-picker">
          <button className="ghost-button compact" onClick={onBack}>{copy.workspace.back}</button>
          <select value={selectedSlug} onChange={(event) => onOpenProblem(event.target.value)} aria-label={copy.workspace.pickerLabel}>
            {problems.map((item, index) => (
              <option key={item.slug} value={item.slug}>
                {index + 1}. {displayProblemTitle(item, language)}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-actions">
          <button className="ghost-button compact" disabled={loading || !canEdit} onClick={onRun}>{copy.common.run}</button>
          <button className="submit-button" disabled={loading || !canSubmit} onClick={onSubmit}>{copy.common.submit}</button>
        </div>
      </div>

      <div
        ref={shellRef}
        className="workspace-grid"
        style={{ gridTemplateColumns: `${workspaceSplit}% 8px minmax(0, 1fr)` }}
      >
        <ProblemStatement
          problem={problem}
          problemNumber={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
          token={token}
          language={language}
          copy={copy}
          submissionRefreshKey={submissionRefreshKey}
        />
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
          <CodePanel code={code} canEdit={canEdit} copy={copy} onCodeChange={onCodeChange} />
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
            copy={copy}
            onActiveCase={onActiveCase}
            onInputChange={onSampleInputChange}
            onOutputChange={onSampleOutputChange}
          />
        </div>
      </div>
    </section>
  );
}

function ProblemStatement({
  problem,
  problemNumber,
  token,
  language,
  copy,
  submissionRefreshKey
}: {
  problem: Problem;
  problemNumber?: number;
  token: string;
  language: Language;
  copy: Copy;
  submissionRefreshKey: number;
}) {
  const tests = problem.publicTests || [];
  const [activeTab, setActiveTab] = useState<ProblemPanelTab>("description");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsState, setSubmissionsState] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  useEffect(() => {
    setActiveTab("description");
    setSubmissions([]);
    setSubmissionsState("idle");
  }, [problem.id, token]);

  useEffect(() => {
    if (activeTab !== "submissions") return;
    if (!token) {
      setSubmissions([]);
      setSubmissionsState("idle");
      return;
    }

    let cancelled = false;
    setSubmissionsState("loading");
    api<{ submissions: Submission[] }>(`/api/problems/${problem.slug}/submissions`, {}, token)
      .then((response) => {
        if (cancelled) return;
        setSubmissions(response.submissions);
        setSubmissionsState("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setSubmissions([]);
        setSubmissionsState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, problem.slug, token, submissionRefreshKey]);

  return (
    <article className="leetcode-panel description-panel">
      <div className="panel-tabs" role="tablist" aria-label={copy.workspace.description}>
        <button
          className={activeTab === "description" ? "panel-tab active" : "panel-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "description"}
          onClick={() => setActiveTab("description")}
        >
          {copy.workspace.description}
        </button>
        <button
          className={activeTab === "submissions" ? "panel-tab active" : "panel-tab"}
          type="button"
          role="tab"
          aria-selected={activeTab === "submissions"}
          onClick={() => setActiveTab("submissions")}
        >
          {copy.workspace.submissions}
        </button>
      </div>
      {activeTab === "description" ? (
        <div className="problem-statement">
          <div className="problem-title-row">
            <h1>{problemNumber ? `${problemNumber}. ` : ""}{displayProblemTitle(problem, language)}</h1>
            {Number(problem.bestSubmission?.score ?? problem.bestScore ?? 0) >= 100 && <span className="solved-chip">{copy.common.solved} ✓</span>}
          </div>
          <div className="problem-meta">
            <span className={`difficulty d${problem.difficulty}`}>{difficultyLabel(problem.difficulty, copy)}</span>
            <span>{displayCategory(problem, language)}</span>
            <span>{displaySeries(problem, language)}</span>
            {!problem.isOpen && <span className="closed-chip">{copy.common.closed}</span>}
          </div>

          <p>{displayStatement(problem, language)}</p>

          {tests.map((test, index) => (
            <section className="example-block" key={test.id}>
              <h3>{copy.workspace.example(index + 1)}</h3>
              <pre>{`Input: ${formatFunctionCall(problem.signature, test.args)}
Output: ${prettyJson(test.expected)}`}</pre>
            </section>
          ))}

          <section className="statement-section">
            <h2>{copy.workspace.inputFormat}</h2>
            <p>{displayInputFormat(problem, language)}</p>
          </section>
          <section className="statement-section">
            <h2>{copy.workspace.outputFormat}</h2>
            <p>{displayOutputFormat(problem, language)}</p>
          </section>
          <section className="statement-section">
            <h2>{copy.workspace.constraints}</h2>
            <pre className="constraint-block">{displayConstraints(problem, language)}</pre>
          </section>
        </div>
      ) : (
        <SubmissionHistory
          token={token}
          submissions={submissions}
          submissionsState={submissionsState}
          copy={copy}
        />
      )}
    </article>
  );
}

function SubmissionHistory({
  token,
  submissions,
  submissionsState,
  copy
}: {
  token: string;
  submissions: Submission[];
  submissionsState: "idle" | "loading" | "loaded" | "error";
  copy: Copy;
}) {
  if (!token) {
    return <div className="submission-empty">{copy.workspace.submissionLogin}</div>;
  }

  if (submissionsState === "loading") {
    return <div className="submission-empty">{copy.common.loading}</div>;
  }

  if (submissionsState === "error") {
    return <div className="submission-empty">{copy.workspace.submissionLoadFailed}</div>;
  }

  if (!submissions.length) {
    return <div className="submission-empty">{copy.workspace.submissionEmpty}</div>;
  }

  const [timeHeader, resultHeader, scoreHeader, testsHeader, runtimeHeader] = copy.workspace.submissionHeaders;

  return (
    <div className="submission-history">
      <div className="submission-header-row" aria-hidden="true">
        <span>{timeHeader}</span>
        <span>{resultHeader}</span>
        <span>{scoreHeader}</span>
        <span>{testsHeader}</span>
        <span>{runtimeHeader}</span>
      </div>
      {submissions.map((submission) => (
        <details className="submission-row" key={submission.id}>
          <summary>
            <span>{formatDateTime(submission.createdAt)}</span>
            <span className={submission.passed ? "submission-result accepted" : "submission-result failed"}>
              {submission.passed ? copy.workspace.accepted : copy.workspace.notAccepted}
            </span>
            <span>{submission.score}</span>
            <span>{submission.passedTests}/{submission.totalTests}</span>
            <span>{formatRuntime(submission.runtimeMs)}</span>
          </summary>
          <div className="submission-details">
            <h3>{copy.workspace.submissionDetails}</h3>
            {submission.details.map((detail) => (
              <article className={detail.passed ? "test-pass" : "test-fail"} key={`${submission.id}-${detail.id}-${detail.name}`}>
                <strong>{detail.passed ? "✓" : "×"} {detail.name} <span>{detail.visibility}</span></strong>
                <p>{detail.message}</p>
              </article>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function CodePanel({
  code,
  canEdit,
  copy,
  onCodeChange
}: {
  code: string;
  canEdit: boolean;
  copy: Copy;
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
        <strong>{copy.workspace.code}</strong>
        <span>Python3</span>
        <span>{copy.workspace.auto}</span>
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
            aria-label={copy.workspace.editorLabel}
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
  copy,
  onActiveCase,
  onInputChange,
  onOutputChange
}: {
  problem: Problem;
  activeCaseId: number | null;
  sampleInputs: Record<number, string>;
  sampleOutputs: Record<number, string>;
  result: GradeResult | null;
  copy: Copy;
  onActiveCase: (id: number) => void;
  onInputChange: (id: number, value: string) => void;
  onOutputChange: (id: number, value: string) => void;
}) {
  const tests = problem.publicTests || [];
  const active = tests.find((test) => test.id === activeCaseId) || tests[0];

  return (
    <section className="leetcode-panel tests-panel">
      <div className="panel-tabs">
        <button className="panel-tab active">{copy.workspace.testcase}</button>
        <button className="panel-tab">{copy.workspace.testResult}</button>
      </div>
      <div className="case-tabs">
        {tests.map((test, index) => (
          <button className={test.id === active?.id ? "active" : ""} key={test.id} onClick={() => onActiveCase(test.id)}>
            {copy.workspace.case(index + 1)}
          </button>
        ))}
      </div>

      {active ? (
        <div className="case-editor">
          <label>
            {copy.workspace.inputArgs}
            <textarea
              className="sample-input taller"
              value={sampleInputs[active.id] || ""}
              onChange={(event) => onInputChange(active.id, event.target.value)}
              spellCheck={false}
            />
          </label>
          <label>
            {copy.workspace.output}
            <textarea
              className="sample-input taller"
              value={sampleOutputs[active.id] || ""}
              onChange={(event) => onOutputChange(active.id, event.target.value)}
              spellCheck={false}
            />
          </label>
        </div>
      ) : (
        <p className="result-placeholder">{copy.workspace.noPublicTests}</p>
      )}

      <ResultBox result={result} copy={copy} />
    </section>
  );
}

function ResultBox({ result, copy }: { result: GradeResult | null; copy: Copy }) {
  if (!result) return <p className="result-placeholder">{copy.workspace.resultPlaceholder}</p>;

  return (
    <section className="result-box">
      <div className="result-header">
        <strong>{result.passed ? "Accepted" : "Wrong Answer"}</strong>
        <span>{copy.workspace.score(result.passedTests, result.totalTests, result.runtimeMs, result.score)}</span>
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

function TutorialView({ copy }: { copy: Copy }) {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>{copy.guide.title}</h1>
          <p>{copy.guide.intro}</p>
        </div>
      </div>
      <section className="tutorial-grid">
        {copy.guide.cards.map(([title, body]) => (
          <article className="tutorial-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </section>
  );
}

function LeaderboardView({
  leaderboard,
  explanation,
  language,
  copy
}: {
  leaderboard: LeaderboardEntry[];
  explanation: LeaderboardExplanation | null;
  language: Language;
  copy: Copy;
}) {
  const [showRules, setShowRules] = useState(false);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>{copy.leaderboard.title}</h1>
          <p>{copy.leaderboard.intro}</p>
        </div>
        <button className="ghost-button" onClick={() => setShowRules((current) => !current)}>{copy.leaderboard.rules}</button>
      </div>
      {showRules && explanation && (
        <section className="panel ranking-rules">
          <h2>{leaderboardText(explanation, "title", language, copy.leaderboard.fallbackTitle)}</h2>
          <p>{leaderboardText(explanation, "summary", language, copy.leaderboard.fallbackSummary)}</p>
          <p>{leaderboardText(explanation, "perProblemScore", language, copy.leaderboard.fallbackScore)}</p>
          <p>{leaderboardText(explanation, "ranking", language, copy.leaderboard.fallbackRanking)}</p>
          <p>{leaderboardText(explanation, "tieBreakers", language, copy.leaderboard.fallbackTie)}</p>
        </section>
      )}
      <section className="panel table-panel">
        {leaderboard.length === 0 ? (
          <p className="empty-state">{copy.leaderboard.empty}</p>
        ) : (
          <table className="ranking-table global-ranking">
            <thead>
              <tr>
                {copy.leaderboard.headers.map((header) => <th key={header}>{header}</th>)}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

function ProgressView({
  user,
  progress,
  language,
  copy
}: {
  user: User | null;
  progress: ProgressRow[];
  language: Language;
  copy: Copy;
}) {
  if (!user) return <section className="panel">{copy.progress.login}</section>;
  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <h1>{copy.progress.title}</h1>
          <p>{copy.progress.intro}</p>
        </div>
      </div>
      <section className="panel table-panel">
        <table className="ranking-table">
          <thead><tr>{copy.progress.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
          <tbody>
            {progress.map((row) => (
              <tr key={row.id}>
                <td>{copy.common.week} {row.week}</td>
                <td>{progressTitle(row, language)}</td>
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
  language,
  copy,
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
  language: Language;
  copy: Copy;
  onToggleProblem: (problem: Problem) => void;
  onFormChange: (form: ProblemForm) => void;
  onCreateProblem: (event: FormEvent) => void;
  onResetTemplate: () => void;
}) {
  const [tab, setTab] = useState<"manage" | "upload">("manage");
  if (user?.role !== "admin") return <section className="panel">{copy.teacher.denied}</section>;

  return (
    <section className="teacher-dashboard">
      <div className="page-heading">
        <div>
          <h1>{copy.teacher.title}</h1>
          <p>{copy.teacher.intro}</p>
        </div>
        <div className="segmented">
          <button className={tab === "manage" ? "active" : ""} onClick={() => setTab("manage")}>{copy.teacher.manage}</button>
          <button className={tab === "upload" ? "active" : ""} onClick={() => setTab("upload")}>{copy.teacher.upload}</button>
        </div>
      </div>

      <div className="metric-row">
        <MetricCard label={copy.teacher.metrics.students} value={String(dashboard?.counts.students ?? 0)} hint={copy.teacher.metrics.studentsHint} />
        <MetricCard label={copy.teacher.metrics.problems} value={String(dashboard?.counts.problems ?? 0)} hint={copy.teacher.metrics.problemsHint(dashboard?.counts.openProblems ?? 0)} />
        <MetricCard label={copy.teacher.metrics.submissions} value={String(dashboard?.counts.submissions ?? 0)} hint={copy.teacher.metrics.submissionsHint(dashboard?.counts.passedSubmissions ?? 0)} />
      </div>

      {tab === "manage" ? (
        <section className="panel">
          <div className="panel-title-row">
            <h2>{copy.teacher.manageTitle}</h2>
            <span>{copy.teacher.manageHint}</span>
          </div>
          <div className="admin-problem-list">
            {problems.map((problem) => (
              <div className="admin-row" key={problem.id}>
                <span>Week {problem.week}</span>
                <strong>{displayProblemTitle(problem, language)}</strong>
                <em>{problem.isOpen ? copy.teacher.visible : copy.teacher.closed}</em>
                <button className={problem.isOpen ? "ghost-button compact danger" : "primary-button compact"} onClick={() => onToggleProblem(problem)}>
                  {problem.isOpen ? copy.teacher.close : copy.teacher.open}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="teacher-upload-grid">
          <ProblemUploadForm form={form} loading={loading} copy={copy} onFormChange={onFormChange} onSubmit={onCreateProblem} onResetTemplate={onResetTemplate} />
          <UploadGuide copy={copy} />
        </section>
      )}
    </section>
  );
}

function ProblemUploadForm({
  form,
  loading,
  copy,
  onFormChange,
  onSubmit,
  onResetTemplate
}: {
  form: ProblemForm;
  loading: boolean;
  copy: Copy;
  onFormChange: (form: ProblemForm) => void;
  onSubmit: (event: FormEvent) => void;
  onResetTemplate: () => void;
}) {
  const update = (patch: Partial<ProblemForm>) => onFormChange({ ...form, ...patch });

  return (
    <form className="panel upload-form" onSubmit={onSubmit}>
      <div className="panel-title-row">
        <h2>{copy.upload.title}</h2>
        <button className="ghost-button compact" type="button" onClick={onResetTemplate}>{copy.upload.reset}</button>
      </div>
      <div className="form-grid">
        <label>{copy.upload.slug}<input value={form.slug} onChange={(event) => update({ slug: event.target.value })} placeholder="source-inventory-template" /></label>
        <label>{copy.upload.week}<input value={form.week} onChange={(event) => update({ week: event.target.value })} /></label>
        <label>{copy.upload.seriesTitle}<input value={form.seriesTitle} onChange={(event) => update({ seriesTitle: event.target.value })} /></label>
        <label>{copy.upload.seriesTitleEn}<input value={form.seriesTitleEn} onChange={(event) => update({ seriesTitleEn: event.target.value })} /></label>
        <label>{copy.upload.titleZh}<input value={form.title} onChange={(event) => update({ title: event.target.value })} /></label>
        <label>{copy.upload.titleEn}<input value={form.titleEn} onChange={(event) => update({ titleEn: event.target.value })} /></label>
        <label>{copy.upload.difficulty}
          <select value={form.difficulty} onChange={(event) => update({ difficulty: event.target.value })}>
            <option value="1">{copy.difficulties[1]}</option>
            <option value="2">{copy.difficulties[2]}</option>
            <option value="3">{copy.difficulties[3]}</option>
          </select>
        </label>
        <label>{copy.upload.category}<input value={form.category} onChange={(event) => update({ category: event.target.value })} /></label>
        <label>{copy.upload.categoryEn}<input value={form.categoryEn} onChange={(event) => update({ categoryEn: event.target.value })} /></label>
        <label>{copy.upload.functionName}<input value={form.functionName} onChange={(event) => update({ functionName: event.target.value })} /></label>
        <label className="wide">{copy.upload.signature}<input value={form.signature} onChange={(event) => update({ signature: event.target.value })} placeholder="sources" /></label>
        <label className="wide">{copy.upload.statement}<textarea value={form.statement} onChange={(event) => update({ statement: event.target.value })} /></label>
        <label className="wide">{copy.upload.statementEn}<textarea value={form.statementEn} onChange={(event) => update({ statementEn: event.target.value })} /></label>
        <label className="wide">{copy.upload.inputFormat}<textarea value={form.inputFormat} onChange={(event) => update({ inputFormat: event.target.value })} /></label>
        <label className="wide">{copy.upload.inputFormatEn}<textarea value={form.inputFormatEn} onChange={(event) => update({ inputFormatEn: event.target.value })} /></label>
        <label className="wide">{copy.upload.outputFormat}<textarea value={form.outputFormat} onChange={(event) => update({ outputFormat: event.target.value })} /></label>
        <label className="wide">{copy.upload.outputFormatEn}<textarea value={form.outputFormatEn} onChange={(event) => update({ outputFormatEn: event.target.value })} /></label>
        <label className="wide">{copy.upload.constraints}<textarea value={form.constraintsText} onChange={(event) => update({ constraintsText: event.target.value })} /></label>
        <label className="wide">{copy.upload.constraintsEn}<textarea value={form.constraintsTextEn} onChange={(event) => update({ constraintsTextEn: event.target.value })} /></label>
        <label className="wide">{copy.upload.starter}<textarea className="code-textarea" value={form.starterCode} onChange={(event) => update({ starterCode: event.target.value })} /></label>
        <div className="wide test-case-grid">
          <label>{copy.upload.publicTests}<textarea className="code-textarea tall" value={form.publicTestsText} onChange={(event) => update({ publicTestsText: event.target.value })} /></label>
          <label>{copy.upload.hiddenTests}<textarea className="code-textarea tall" value={form.hiddenTestsText} onChange={(event) => update({ hiddenTestsText: event.target.value })} /></label>
        </div>
        <label className="checkbox-row wide">
          <input type="checkbox" checked={form.isOpen} onChange={(event) => update({ isOpen: event.target.checked })} />
          {copy.upload.openNow}
        </label>
      </div>
      <div className="form-actions">
        <button className="primary-button" disabled={loading}>{copy.upload.submit}</button>
      </div>
    </form>
  );
}

function UploadGuide({ copy }: { copy: Copy }) {
  return (
    <aside className="panel upload-guide">
      <h2>{copy.upload.guideTitle}</h2>
      <ol>
        {copy.upload.guideItems.map(([title, body]) => (
          <li key={title}><strong>{title}</strong>{body}</li>
        ))}
      </ol>
      <h3>{copy.upload.publicTestsExample}</h3>
      <pre>{DEFAULT_PROBLEM_FORM.publicTestsText}</pre>
      <h3>{copy.upload.hiddenTestsExample}</h3>
      <pre>{DEFAULT_PROBLEM_FORM.hiddenTestsText}</pre>
      <h3>{copy.upload.starterExample}</h3>
      <pre>{`def summarize_sources(sources):
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
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data as T;
}

function problemFormToPayload(form: ProblemForm) {
  const publicTests = parseTestCasesText(form.publicTestsText, "公開測資 JSON", "public");
  const hiddenTests = parseTestCasesText(form.hiddenTestsText, "隱藏測資 JSON", "hidden");
  const tests = [...publicTests, ...hiddenTests];
  return {
    slug: form.slug,
    week: Number(form.week),
    seriesTitle: form.seriesTitle,
    seriesTitleEn: form.seriesTitleEn,
    title: form.title,
    titleEn: form.titleEn,
    difficulty: Number(form.difficulty),
    category: form.category,
    categoryEn: form.categoryEn,
    timeLimitSeconds: Number(form.timeLimitSeconds),
    functionName: form.functionName,
    signature: form.signature.split(",").map((item) => item.trim()).filter(Boolean),
    statement: form.statement,
    statementEn: form.statementEn,
    inputFormat: form.inputFormat,
    inputFormatEn: form.inputFormatEn,
    outputFormat: form.outputFormat,
    outputFormatEn: form.outputFormatEn,
    constraintsText: form.constraintsText,
    constraintsTextEn: form.constraintsTextEn,
    starterCode: form.starterCode,
    tests,
    isOpen: form.isOpen
  };
}

function parseTestCasesText(text: string, label: string, visibility: TestVisibility) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error(`${label} 必須是 JSON array。`);
  if (!parsed.length) throw new Error(`${label} 至少需要一筆測資。`);
  return parsed.map((testCase, index) => {
    if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) {
      throw new Error(`${label} 第 ${index + 1} 筆必須是 JSON object。`);
    }
    return {
      ...(testCase as Record<string, unknown>),
      visibility
    };
  });
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

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function difficultyLabel(value: number, copy: Copy) {
  if (value === 1) return copy.difficulties[1];
  if (value === 2) return copy.difficulties[2];
  return copy.difficulties[3];
}

function formatFunctionCall(signature: string[], args: unknown[]) {
  return signature.map((name, index) => `${name} = ${JSON.stringify(args[index])}`).join(", ");
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatRuntime(ms: number) {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error ? cleanText(error.message, error.message) : fallback;
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

function displayProblemTitle(problem: Problem, language: Language) {
  return localizedProblemText(problem, "title", "titleEn", language, titleFromSlug(problem.slug));
}

function displaySeries(problem: Problem, language: Language) {
  return localizedProblemText(problem, "seriesTitle", "seriesTitleEn", language, `Week ${problem.week}`);
}

function displayCategory(problem: Problem, language: Language) {
  return localizedProblemText(problem, "category", "categoryEn", language, problem.functionName.includes("_") ? titleCase(problem.functionName.split("_")[0]) : "Python");
}

function displayStatement(problem: Problem, language: Language) {
  return localizedProblemText(
    problem,
    "statement",
    "statementEn",
    language,
    `Implement ${problem.functionName}(${problem.signature.join(", ")}) in Python. Return the value required by the examples and hidden tests.`
  );
}

function displayInputFormat(problem: Problem, language: Language) {
  return localizedProblemText(problem, "inputFormat", "inputFormatEn", language, `args follows signature order: ${problem.signature.join(", ")}.`);
}

function displayOutputFormat(problem: Problem, language: Language) {
  return localizedProblemText(problem, "outputFormat", "outputFormatEn", language, "Return a JSON-serializable Python value.");
}

function displayConstraints(problem: Problem, language: Language) {
  return localizedProblemText(problem, "constraintsText", "constraintsTextEn", language, "Use pure Python. Match the public examples and hidden tests.");
}

function localizedProblemText(
  problem: Problem,
  zhKey: keyof Problem,
  enKey: keyof Problem,
  language: Language,
  fallback: string
) {
  const primary = language === "en" ? problem[enKey] : problem[zhKey];
  const secondary = language === "en" ? problem[zhKey] : problem[enKey];
  return cleanText(
    typeof primary === "string" ? primary : "",
    cleanText(typeof secondary === "string" ? secondary : "", fallback)
  );
}

function progressTitle(row: ProgressRow, language: Language) {
  if (language === "en") return cleanText(row.title_en, cleanText(row.title, titleFromSlug(row.slug)));
  return cleanText(row.title, cleanText(row.title_en, titleFromSlug(row.slug)));
}

function leaderboardText(
  explanation: LeaderboardExplanation,
  key: "title" | "summary" | "perProblemScore" | "ranking" | "tieBreakers",
  language: Language,
  fallback: string
) {
  const enKey = `${key}En` as keyof LeaderboardExplanation;
  const primary = language === "en" ? explanation[enKey] : explanation[key];
  const secondary = language === "en" ? explanation[key] : explanation[enKey];
  return cleanText(
    typeof primary === "string" ? primary : "",
    cleanText(typeof secondary === "string" ? secondary : "", fallback)
  );
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

