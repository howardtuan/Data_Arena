const weekTitles = {
  1: "Introduction / Pandas 操作入門",
  2: "Data mining & Knowledge discovery",
  3: "CRISP-DM / Data Visualization",
  4: "Data Preprocessing 1: Cleaning & Integration",
  5: "Data Preprocessing 2: Transformation & Feature Selection",
  6: "Classify I: Decision Trees",
  7: "Classify II: Ensemble & Bayesian",
  8: "Classify III: Artificial Neural Network",
  9: "Associations: Apriori / FP-growth",
  10: "Clustering: K-Means / Hierarchical"
};

function slug(week, index, name) {
  return `week-${String(week).padStart(2, "0")}-${index}-${name}`;
}

function starter(functionName, signature) {
  return `def ${functionName}(${signature.join(", ")}):\n    # 在這裡撰寫你的解法\n    pass\n`;
}

function problem({
  week,
  index,
  name,
  title,
  difficulty = 1,
  category,
  functionName,
  signature,
  statement,
  inputFormat,
  outputFormat,
  constraintsText,
  tests
}) {
  return {
    slug: slug(week, index, name),
    week,
    seriesTitle: weekTitles[week],
    title: `第 ${week} 週-${index}：${title}`,
    difficulty,
    category,
    timeLimitSeconds: difficulty === 1 ? 1800 : difficulty === 2 ? 2400 : 3600,
    functionName,
    signature,
    statement,
    inputFormat,
    outputFormat,
    constraintsText,
    starterCode: starter(functionName, signature),
    tests
  };
}

function publicCase(name, args, expected, comparator = "exact") {
  return { name, visibility: "public", args, expected, comparator, points: 1 };
}

function hiddenCase(name, args, expected, comparator = "exact") {
  return publicCase(name.replace(/^Hidden\b/, "Test"), args, expected, comparator);
}

export function buildProblemBank() {
  return [
    problem({
      week: 1,
      index: 1,
      name: "normalize-scores",
      title: "整理成績型別",
      category: "Python / Pandas 基礎",
      functionName: "normalize_scores",
      signature: ["records"],
      statement: "給定學生資料列，將 score 轉成整數；空值、None、無法轉換的值皆視為 0。回傳保持原順序的新資料列。",
      inputFormat: "records: list[dict]，每筆包含 name 與 score。",
      outputFormat: "list[dict]，score 必須為 int。",
      constraintsText: "不得修改輸入物件本身；需保留其他欄位。",
      tests: [
        publicCase("Sample 1", [[{ name: "Amy", score: "91" }, { name: "Ben", score: null }]], [
          { name: "Amy", score: 91 },
          { name: "Ben", score: 0 }
        ]),
        publicCase("Sample 2", [[{ name: "Cara", score: "bad", class: "A" }]], [
          { name: "Cara", score: 0, class: "A" }
        ]),
        hiddenCase("Hidden 1", [[{ name: "Dan", score: 88 }, { name: "Eva", score: "" }]], [
          { name: "Dan", score: 88 },
          { name: "Eva", score: 0 }
        ]),
        hiddenCase("Hidden 2", [[{ name: "Fox", score: "73.8" }]], [{ name: "Fox", score: 73 }])
      ]
    }),
    problem({
      week: 1,
      index: 2,
      name: "top-student",
      title: "找出最高分學生",
      category: "Python / Pandas 基礎",
      functionName: "top_student",
      signature: ["records"],
      statement: "給定學生資料列，回傳 score 最高者的 name。若分數相同，回傳原資料中較早出現者。",
      inputFormat: "records: list[dict]，每筆包含 name 與 score。",
      outputFormat: "str。",
      constraintsText: "score 皆為數值；records 至少一筆。",
      tests: [
        publicCase("Sample 1", [[{ name: "Amy", score: 90 }, { name: "Ben", score: 95 }]], "Ben"),
        publicCase("Sample 2", [[{ name: "A", score: 10 }, { name: "B", score: 10 }]], "A"),
        hiddenCase("Hidden 1", [[{ name: "C", score: -1 }, { name: "D", score: 0 }]], "D"),
        hiddenCase("Hidden 2", [[{ name: "Only", score: 100 }]], "Only")
      ]
    }),
    problem({
      week: 1,
      index: 3,
      name: "column-values",
      title: "擷取欄位有效值",
      category: "Python / Pandas 基礎",
      functionName: "column_values",
      signature: ["records", "column"],
      statement: "回傳指定欄位中不是 None 且不是空字串的值，保留原始順序。",
      inputFormat: "records: list[dict], column: str。",
      outputFormat: "list。",
      constraintsText: "缺少欄位視為無效值。",
      tests: [
        publicCase("Sample 1", [[{ age: 20 }, { age: null }, { age: 22 }], "age"], [20, 22]),
        publicCase("Sample 2", [[{ city: "Taichung" }, { city: "" }, { other: "x" }], "city"], ["Taichung"]),
        hiddenCase("Hidden 1", [[{ x: 0 }, { x: false }, { x: "" }], "x"], [0, false]),
        hiddenCase("Hidden 2", [[{ a: "A" }, { a: "B" }], "a"], ["A", "B"])
      ]
    }),
    problem({
      week: 1,
      index: 4,
      name: "pass-flags",
      title: "建立通過標記",
      category: "Python / Pandas 基礎",
      functionName: "pass_flags",
      signature: ["scores", "threshold"],
      statement: "依序判斷每個分數是否大於等於 threshold，回傳布林陣列。",
      inputFormat: "scores: list[number], threshold: number。",
      outputFormat: "list[bool]。",
      constraintsText: "空陣列需回傳空陣列。",
      tests: [
        publicCase("Sample 1", [[60, 59, 100], 60], [true, false, true]),
        publicCase("Sample 2", [[], 70], []),
        hiddenCase("Hidden 1", [[0, -1, 1], 0], [true, false, true]),
        hiddenCase("Hidden 2", [[80, 80, 79], 80], [true, true, false])
      ]
    }),
    problem({
      week: 1,
      index: 5,
      name: "group-names",
      title: "依班級分組名單",
      category: "Python / Pandas 基礎",
      functionName: "group_names_by_class",
      signature: ["records"],
      statement: "將學生依 class 欄位分組，回傳每個班級對應的姓名清單；班級與姓名都需排序。",
      inputFormat: "records: list[dict]，每筆包含 class 與 name。",
      outputFormat: "dict[str, list[str]]。",
      constraintsText: "排序採字典序。",
      tests: [
        publicCase("Sample 1", [[{ class: "B", name: "Bob" }, { class: "A", name: "Amy" }, { class: "B", name: "Cara" }]], {
          A: ["Amy"],
          B: ["Bob", "Cara"]
        }),
        publicCase("Sample 2", [[]], {}),
        hiddenCase("Hidden 1", [[{ class: "A", name: "Zoe" }, { class: "A", name: "Ann" }]], { A: ["Ann", "Zoe"] }),
        hiddenCase("Hidden 2", [[{ class: "C", name: "Kai" }]], { C: ["Kai"] })
      ]
    }),
    problem({
      week: 2,
      index: 1,
      name: "mean-value",
      title: "平均值計算",
      category: "描述性統計",
      functionName: "mean_value",
      signature: ["values"],
      statement: "回傳 values 的算術平均，四捨五入至小數第 4 位。",
      inputFormat: "values: list[number]。",
      outputFormat: "number。",
      constraintsText: "values 至少一筆。",
      tests: [
        publicCase("Sample 1", [[1, 2, 3]], 2, "number"),
        publicCase("Sample 2", [[1, 2]], 1.5, "number"),
        hiddenCase("Hidden 1", [[-1, 1, 2]], 0.6667, "number"),
        hiddenCase("Hidden 2", [[10]], 10, "number")
      ]
    }),
    problem({
      week: 2,
      index: 2,
      name: "median-value",
      title: "中位數計算",
      category: "描述性統計",
      functionName: "median_value",
      signature: ["values"],
      statement: "回傳 values 的中位數。偶數筆時取中間兩數平均。",
      inputFormat: "values: list[number]。",
      outputFormat: "number。",
      constraintsText: "輸入不一定排序。",
      tests: [
        publicCase("Sample 1", [[3, 1, 2]], 2, "number"),
        publicCase("Sample 2", [[4, 1, 2, 3]], 2.5, "number"),
        hiddenCase("Hidden 1", [[10, -2]], 4, "number"),
        hiddenCase("Hidden 2", [[5, 5, 7]], 5, "number")
      ]
    }),
    problem({
      week: 2,
      index: 3,
      name: "mode-value",
      title: "眾數與平手規則",
      category: "描述性統計",
      functionName: "mode_value",
      signature: ["values"],
      statement: "回傳出現次數最多的值；若平手，回傳數值較小者。",
      inputFormat: "values: list[number]。",
      outputFormat: "number。",
      constraintsText: "values 至少一筆。",
      tests: [
        publicCase("Sample 1", [[1, 2, 2, 3]], 2),
        publicCase("Sample 2", [[3, 1, 3, 1]], 1),
        hiddenCase("Hidden 1", [[9, 9, 8, 8, 8]], 8),
        hiddenCase("Hidden 2", [[4]], 4)
      ]
    }),
    problem({
      week: 2,
      index: 4,
      name: "describe-values",
      title: "五項摘要",
      category: "描述性統計",
      functionName: "describe_values",
      signature: ["values"],
      statement: "回傳 count、min、max、mean 四個欄位；mean 四捨五入至小數第 2 位。",
      inputFormat: "values: list[number]。",
      outputFormat: "dict，包含 count/min/max/mean。",
      constraintsText: "values 至少一筆。",
      tests: [
        publicCase("Sample 1", [[1, 2, 3]], { count: 3, min: 1, max: 3, mean: 2 }),
        publicCase("Sample 2", [[2, 2, 5]], { count: 3, min: 2, max: 5, mean: 3 }),
        hiddenCase("Hidden 1", [[-1, 1]], { count: 2, min: -1, max: 1, mean: 0 }),
        hiddenCase("Hidden 2", [[10]], { count: 1, min: 10, max: 10, mean: 10 })
      ]
    }),
    problem({
      week: 2,
      index: 5,
      name: "sample-variance",
      title: "樣本變異數",
      category: "描述性統計",
      functionName: "sample_variance",
      signature: ["values"],
      statement: "回傳樣本變異數，分母為 n-1，四捨五入至小數第 4 位。",
      inputFormat: "values: list[number]。",
      outputFormat: "number。",
      constraintsText: "values 至少兩筆。",
      tests: [
        publicCase("Sample 1", [[1, 2, 3]], 1, "number"),
        publicCase("Sample 2", [[2, 4]], 2, "number"),
        hiddenCase("Hidden 1", [[10, 10, 10]], 0, "number"),
        hiddenCase("Hidden 2", [[1, 2, 4, 7]], 7.5, "number")
      ]
    }),
    problem({
      week: 3,
      index: 1,
      name: "bar-counts",
      title: "長條圖類別計數",
      category: "資料視覺化",
      functionName: "bar_counts",
      signature: ["labels"],
      statement: "將類別標籤整理成長條圖資料，回傳依類別名稱排序的 {label, count} 清單。",
      inputFormat: "labels: list[str]。",
      outputFormat: "list[dict]。",
      constraintsText: "空輸入回傳空清單。",
      tests: [
        publicCase("Sample 1", [["B", "A", "B"]], [{ label: "A", count: 1 }, { label: "B", count: 2 }]),
        publicCase("Sample 2", [[]], []),
        hiddenCase("Hidden 1", [["x", "x", "a"]], [{ label: "a", count: 1 }, { label: "x", count: 2 }]),
        hiddenCase("Hidden 2", [["C"]], [{ label: "C", count: 1 }])
      ]
    }),
    problem({
      week: 3,
      index: 2,
      name: "line-points",
      title: "折線圖座標排序",
      category: "資料視覺化",
      functionName: "line_points",
      signature: ["records", "x_key", "y_key"],
      statement: "從資料列取出 x/y 欄位並依 x 遞增排序，回傳 {x, y} 清單。",
      inputFormat: "records: list[dict], x_key: str, y_key: str。",
      outputFormat: "list[dict]。",
      constraintsText: "資料列皆有指定欄位。",
      tests: [
        publicCase("Sample 1", [[{ month: 2, sales: 20 }, { month: 1, sales: 10 }], "month", "sales"], [{ x: 1, y: 10 }, { x: 2, y: 20 }]),
        publicCase("Sample 2", [[{ t: "b", v: 1 }, { t: "a", v: 3 }], "t", "v"], [{ x: "a", y: 3 }, { x: "b", y: 1 }]),
        hiddenCase("Hidden 1", [[{ x: 0, y: 0 }], "x", "y"], [{ x: 0, y: 0 }]),
        hiddenCase("Hidden 2", [[{ d: 3, z: 9 }, { d: 2, z: 4 }, { d: 1, z: 1 }], "d", "z"], [{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 9 }])
      ]
    }),
    problem({
      week: 3,
      index: 3,
      name: "histogram-bins",
      title: "直方圖分箱",
      difficulty: 2,
      category: "資料視覺化",
      functionName: "histogram_bins",
      signature: ["values", "bin_size"],
      statement: "以 bin_size 分箱，回傳每個箱子的起點與筆數。箱起點為 floor(value / bin_size) * bin_size。",
      inputFormat: "values: list[number], bin_size: number。",
      outputFormat: "list[dict]，欄位為 start/count，依 start 排序。",
      constraintsText: "bin_size > 0。",
      tests: [
        publicCase("Sample 1", [[0, 1, 2, 5], 2], [{ start: 0, count: 2 }, { start: 2, count: 1 }, { start: 4, count: 1 }]),
        publicCase("Sample 2", [[10, 11, 19], 10], [{ start: 10, count: 3 }]),
        hiddenCase("Hidden 1", [[-1, 0, 1], 2], [{ start: -2, count: 1 }, { start: 0, count: 2 }]),
        hiddenCase("Hidden 2", [[], 5], [])
      ]
    }),
    problem({
      week: 3,
      index: 4,
      name: "scatter-pairs",
      title: "散佈圖有效點",
      category: "資料視覺化",
      functionName: "scatter_pairs",
      signature: ["records", "x_key", "y_key"],
      statement: "取出 x/y 數值都存在的資料點，回傳 [x, y] 清單。",
      inputFormat: "records: list[dict], x_key: str, y_key: str。",
      outputFormat: "list[list[number]]。",
      constraintsText: "None 或缺少欄位需跳過。",
      tests: [
        publicCase("Sample 1", [[{ a: 1, b: 2 }, { a: null, b: 3 }], "a", "b"], [[1, 2]]),
        publicCase("Sample 2", [[{ x: 0, y: 0 }], "x", "y"], [[0, 0]]),
        hiddenCase("Hidden 1", [[{ x: 1 }, { x: 2, y: 4 }], "x", "y"], [[2, 4]]),
        hiddenCase("Hidden 2", [[], "x", "y"], [])
      ]
    }),
    problem({
      week: 3,
      index: 5,
      name: "category-share",
      title: "圓餅圖比例",
      category: "資料視覺化",
      functionName: "category_share",
      signature: ["labels"],
      statement: "計算各類別比例，回傳依 label 排序的 {label, share}，share 四捨五入至小數第 4 位。",
      inputFormat: "labels: list[str]。",
      outputFormat: "list[dict]。",
      constraintsText: "空輸入回傳空清單。",
      tests: [
        publicCase("Sample 1", [["A", "B", "B"]], [{ label: "A", share: 0.3333 }, { label: "B", share: 0.6667 }], "deepNumber"),
        publicCase("Sample 2", [[]], []),
        hiddenCase("Hidden 1", [["x", "x"]], [{ label: "x", share: 1 }], "deepNumber"),
        hiddenCase("Hidden 2", [["b", "a", "a", "b"]], [{ label: "a", share: 0.5 }, { label: "b", share: 0.5 }], "deepNumber")
      ]
    }),
    ...buildWeeks4To10()
  ];
}

function buildWeeks4To10() {
  return [
    problem({ week: 4, index: 1, name: "drop-sparse-columns", title: "移除高缺失欄位", difficulty: 2, category: "資料清理", functionName: "drop_sparse_columns", signature: ["records", "max_missing_ratio"], statement: "移除缺失比例大於 max_missing_ratio 的欄位，回傳保留欄位後的新資料列。缺失值為 None 或空字串。", inputFormat: "records: list[dict], max_missing_ratio: number。", outputFormat: "list[dict]。", constraintsText: "需保留原資料列順序。", tests: [publicCase("Sample 1", [[{ a: 1, b: null }, { a: 2, b: "" }], 0.5], [{ a: 1 }, { a: 2 }]), publicCase("Sample 2", [[{ a: 1, b: 2 }], 0], [{ a: 1, b: 2 }]), hiddenCase("Hidden 1", [[{ x: null }, { x: 1 }], 0.5], [{ x: null }, { x: 1 }]), hiddenCase("Hidden 2", [[], 0.5], [])] }),
    problem({ week: 4, index: 2, name: "fill-numeric-mean", title: "平均值補缺失", difficulty: 2, category: "資料清理", functionName: "fill_numeric_mean", signature: ["records", "column"], statement: "將指定數值欄位的 None 以該欄非缺失平均值補上，平均值四捨五入至小數第 4 位。", inputFormat: "records: list[dict], column: str。", outputFormat: "list[dict]。", constraintsText: "若沒有可用數值，補 0。", tests: [publicCase("Sample 1", [[{ score: 10 }, { score: null }, { score: 20 }], "score"], [{ score: 10 }, { score: 15 }, { score: 20 }], "deepNumber"), publicCase("Sample 2", [[{ x: null }], "x"], [{ x: 0 }]), hiddenCase("Hidden 1", [[{ x: 1 }, { x: null }, { x: 2 }], "x"], [{ x: 1 }, { x: 1.5 }, { x: 2 }], "deepNumber"), hiddenCase("Hidden 2", [[], "x"], [])] }),
    problem({ week: 4, index: 3, name: "inner-join", title: "內連接資料表", difficulty: 2, category: "資料整合", functionName: "inner_join", signature: ["left", "right", "key"], statement: "依 key 將 left 與 right 做 inner join。若欄位重名，以 right 覆蓋，key 只保留一份。", inputFormat: "left/right: list[dict], key: str。", outputFormat: "list[dict]，依 left 原順序。", constraintsText: "right key 唯一。", tests: [publicCase("Sample 1", [[{ id: 1, a: "A" }, { id: 2, a: "B" }], [{ id: 2, b: "X" }], "id"], [{ id: 2, a: "B", b: "X" }]), publicCase("Sample 2", [[], [{ id: 1 }], "id"], []), hiddenCase("Hidden 1", [[{ id: 1, v: 1 }], [{ id: 1, v: 9, z: 0 }], "id"], [{ id: 1, v: 9, z: 0 }]), hiddenCase("Hidden 2", [[{ k: "a" }], [{ k: "b" }], "k"], [])] }),
    problem({ week: 4, index: 4, name: "dedupe-by-key", title: "重複資料去除", category: "資料清理", functionName: "dedupe_by_key", signature: ["records", "key"], statement: "依指定 key 去除重複資料，只保留第一次出現的資料列。", inputFormat: "records: list[dict], key: str。", outputFormat: "list[dict]。", constraintsText: "缺少 key 的資料列也視為同一組 None。", tests: [publicCase("Sample 1", [[{ id: 1 }, { id: 1 }, { id: 2 }], "id"], [{ id: 1 }, { id: 2 }]), publicCase("Sample 2", [[{ a: 1 }, { b: 2 }], "id"], [{ a: 1 }]), hiddenCase("Hidden 1", [[], "id"], []), hiddenCase("Hidden 2", [[{ id: "x", v: 1 }, { id: "x", v: 2 }], "id"], [{ id: "x", v: 1 }])] }),
    problem({ week: 4, index: 5, name: "standardize-category", title: "類別欄位標準化", category: "資料清理", functionName: "standardize_category", signature: ["records", "column"], statement: "將指定類別欄位轉成小寫並去除前後空白；None 轉為 'unknown'。", inputFormat: "records: list[dict], column: str。", outputFormat: "list[dict]。", constraintsText: "需保留其他欄位。", tests: [publicCase("Sample 1", [[{ city: " Taichung " }, { city: null }], "city"], [{ city: "taichung" }, { city: "unknown" }]), publicCase("Sample 2", [[{ city: "A", x: 1 }], "city"], [{ city: "a", x: 1 }]), hiddenCase("Hidden 1", [[{ c: " MIX " }], "c"], [{ c: "mix" }]), hiddenCase("Hidden 2", [[], "c"], [])] }),
    problem({ week: 5, index: 1, name: "minmax-scale", title: "Min-Max 特徵縮放", category: "特徵轉換", functionName: "minmax_scale", signature: ["values"], statement: "將數值縮放到 0 到 1；若最大值等於最小值，全部回傳 0。結果四捨五入至小數第 4 位。", inputFormat: "values: list[number]。", outputFormat: "list[number]。", constraintsText: "空陣列回傳空陣列。", tests: [publicCase("Sample 1", [[10, 20, 30]], [0, 0.5, 1], "deepNumber"), publicCase("Sample 2", [[5, 5]], [0, 0]), hiddenCase("Hidden 1", [[-1, 1]], [0, 1]), hiddenCase("Hidden 2", [[]], [])] }),
    problem({ week: 5, index: 2, name: "one-hot", title: "One-Hot 編碼", category: "特徵轉換", functionName: "one_hot", signature: ["values"], statement: "依類別字典序建立 one-hot 編碼，回傳每筆資料的 dict。", inputFormat: "values: list[str]。", outputFormat: "list[dict]。", constraintsText: "類別欄位名稱即原字串。", tests: [publicCase("Sample 1", [["B", "A"]], [{ A: 0, B: 1 }, { A: 1, B: 0 }]), publicCase("Sample 2", [[]], []), hiddenCase("Hidden 1", [["x", "x"]], [{ x: 1 }, { x: 1 }]), hiddenCase("Hidden 2", [["b", "a", "c"]], [{ a: 0, b: 1, c: 0 }, { a: 1, b: 0, c: 0 }, { a: 0, b: 0, c: 1 }])] }),
    problem({ week: 5, index: 3, name: "top-variance", title: "選取高變異特徵", difficulty: 2, category: "特徵選擇", functionName: "select_top_variance", signature: ["table", "k"], statement: "計算每個欄位的母體變異數，回傳變異數最高的 k 個欄位名稱；平手以欄位名稱排序。", inputFormat: "table: dict[str, list[number]], k: int。", outputFormat: "list[str]。", constraintsText: "k 不超過欄位數。", tests: [publicCase("Sample 1", [{ a: [1, 1], b: [1, 3] }, 1], ["b"]), publicCase("Sample 2", [{ a: [1], b: [2] }, 2], ["a", "b"]), hiddenCase("Hidden 1", [{ z: [0, 10], a: [1, 3] }, 2], ["z", "a"]), hiddenCase("Hidden 2", [{ c: [2, 2, 2] }, 1], ["c"])] }),
    problem({ week: 5, index: 4, name: "deterministic-split", title: "固定規則切分資料", category: "特徵轉換", functionName: "train_test_split_ids", signature: ["ids", "test_every"], statement: "依序將每第 test_every 筆放入 test，其餘放入 train，回傳 {train, test}。", inputFormat: "ids: list, test_every: int。", outputFormat: "dict。", constraintsText: "索引從 1 開始計算。", tests: [publicCase("Sample 1", [["a", "b", "c", "d"], 2], { train: ["a", "c"], test: ["b", "d"] }), publicCase("Sample 2", [["x"], 3], { train: ["x"], test: [] }), hiddenCase("Hidden 1", [[1, 2, 3], 1], { train: [], test: [1, 2, 3] }), hiddenCase("Hidden 2", [[], 2], { train: [], test: [] })] }),
    problem({ week: 5, index: 5, name: "zscore-outliers", title: "Z-score 離群值偵測", difficulty: 2, category: "特徵選擇", functionName: "zscore_outliers", signature: ["values", "threshold"], statement: "以母體標準差計算 z-score，回傳絕對 z-score 大於 threshold 的原始索引。", inputFormat: "values: list[number], threshold: number。", outputFormat: "list[int]。", constraintsText: "標準差為 0 時回傳空陣列。", tests: [publicCase("Sample 1", [[10, 10, 100], 1], [2]), publicCase("Sample 2", [[5, 5], 1], []), hiddenCase("Hidden 1", [[1, 2, 3], 10], []), hiddenCase("Hidden 2", [[0, 0, 9, 0], 1.5], [2])] }),
    ...classificationProblems(),
    ...advancedModelProblems(),
    ...neuralProblems(),
    ...associationProblems(),
    ...clusteringProblems()
  ];
}

function classificationProblems() {
  return [
    problem({ week: 6, index: 1, name: "gini", title: "Gini impurity", category: "決策樹", functionName: "gini_impurity", signature: ["labels"], statement: "計算 Gini impurity，四捨五入至小數第 4 位。", inputFormat: "labels: list。", outputFormat: "number。", constraintsText: "空陣列回傳 0。", tests: [publicCase("Sample 1", [["A", "A", "B"]], 0.4444, "number"), publicCase("Sample 2", [[]], 0), hiddenCase("Hidden 1", [["A", "A"]], 0), hiddenCase("Hidden 2", [["A", "B"]], 0.5)] }),
    problem({ week: 6, index: 2, name: "majority-class", title: "多數類別", category: "決策樹", functionName: "majority_class", signature: ["rows", "label_key"], statement: "回傳指定 label 欄位的多數類別；平手時回傳字典序最小者。", inputFormat: "rows: list[dict], label_key: str。", outputFormat: "str。", constraintsText: "rows 至少一筆。", tests: [publicCase("Sample 1", [[{ y: "B" }, { y: "A" }, { y: "B" }], "y"], "B"), publicCase("Sample 2", [[{ y: "B" }, { y: "A" }], "y"], "A"), hiddenCase("Hidden 1", [[{ label: "yes" }], "label"], "yes"), hiddenCase("Hidden 2", [[{ c: "x" }, { c: "x" }, { c: "y" }], "c"], "x")] }),
    problem({ week: 6, index: 3, name: "stump-predict", title: "單層決策樹預測", category: "決策樹", functionName: "decision_stump_predict", signature: ["rows", "feature", "threshold", "left_label", "right_label"], statement: "若 row[feature] <= threshold 則預測 left_label，否則 right_label，回傳預測清單。", inputFormat: "rows: list[dict]。", outputFormat: "list。", constraintsText: "資料列皆有 feature。", tests: [publicCase("Sample 1", [[{ x: 1 }, { x: 5 }], "x", 3, "L", "R"], ["L", "R"]), publicCase("Sample 2", [[], "x", 0, "N", "Y"], []), hiddenCase("Hidden 1", [[{ age: 18 }, { age: 17 }], "age", 17, 0, 1], [1, 0]), hiddenCase("Hidden 2", [[{ v: 2 }], "v", 2, "A", "B"], ["A"])] }),
    problem({ week: 6, index: 4, name: "accuracy", title: "分類準確率", category: "模型評估", functionName: "accuracy_score", signature: ["y_true", "y_pred"], statement: "計算分類準確率，四捨五入至小數第 4 位。", inputFormat: "y_true/y_pred: list。", outputFormat: "number。", constraintsText: "長度相同；空陣列回傳 0。", tests: [publicCase("Sample 1", [["A", "B"], ["A", "A"]], 0.5), publicCase("Sample 2", [[], []], 0), hiddenCase("Hidden 1", [[1, 0, 1], [1, 0, 1]], 1), hiddenCase("Hidden 2", [[1, 1, 0], [0, 1, 1]], 0.3333, "number")] }),
    problem({ week: 6, index: 5, name: "confusion-binary", title: "二元混淆矩陣", category: "模型評估", functionName: "confusion_matrix_binary", signature: ["y_true", "y_pred", "positive_label"], statement: "回傳二元分類混淆矩陣 {tp, fp, tn, fn}。", inputFormat: "y_true/y_pred: list, positive_label。", outputFormat: "dict。", constraintsText: "長度相同。", tests: [publicCase("Sample 1", [[1, 0, 1], [1, 1, 0], 1], { tp: 1, fp: 1, tn: 0, fn: 1 }), publicCase("Sample 2", [[], [], "Y"], { tp: 0, fp: 0, tn: 0, fn: 0 }), hiddenCase("Hidden 1", [["Y", "N"], ["Y", "N"], "Y"], { tp: 1, fp: 0, tn: 1, fn: 0 }), hiddenCase("Hidden 2", [[true, false], [false, false], true], { tp: 0, fp: 0, tn: 1, fn: 1 })] })
  ];
}

function advancedModelProblems() {
  return [
    problem({ week: 7, index: 1, name: "majority-vote", title: "集成多數決", category: "Ensemble", functionName: "majority_vote", signature: ["predictions"], statement: "predictions 是多個模型的預測清單，逐筆以多數決輸出；平手回傳字典序最小者。", inputFormat: "predictions: list[list]。", outputFormat: "list。", constraintsText: "每個模型預測長度相同。", tests: [publicCase("Sample 1", [[["A", "B"], ["A", "A"], ["B", "B"]]], ["A", "B"]), publicCase("Sample 2", [[["B"], ["A"]]], ["A"]), hiddenCase("Hidden 1", [[["x", "y"]]], ["x", "y"]), hiddenCase("Hidden 2", [[["1"], ["2"], ["2"]]], ["2"])] }),
    problem({ week: 7, index: 2, name: "weighted-average", title: "加權平均預測", category: "Ensemble", functionName: "weighted_average", signature: ["predictions", "weights"], statement: "計算多個模型數值預測的加權平均，逐筆四捨五入至小數第 4 位。", inputFormat: "predictions: list[list[number]], weights: list[number]。", outputFormat: "list[number]。", constraintsText: "weights 總和大於 0。", tests: [publicCase("Sample 1", [[[1, 3], [3, 5]], [1, 1]], [2, 4]), publicCase("Sample 2", [[[10], [0]], [0.75, 0.25]], [7.5]), hiddenCase("Hidden 1", [[[1], [2], [3]], [1, 1, 2]], [2.25]), hiddenCase("Hidden 2", [[[]], [1]], [])] }),
    problem({ week: 7, index: 3, name: "posterior-binary", title: "二元 Bayes 後驗比較", difficulty: 2, category: "Bayesian", functionName: "bayes_binary_label", signature: ["prior_positive", "likelihood_positive", "likelihood_negative"], statement: "比較 P(positive)*likelihood_positive 與 P(negative)*likelihood_negative，回傳 'positive' 或 'negative'，平手回傳 'positive'。", inputFormat: "三個 number。", outputFormat: "str。", constraintsText: "prior_positive 介於 0 到 1。", tests: [publicCase("Sample 1", [0.5, 0.8, 0.2], "positive"), publicCase("Sample 2", [0.2, 0.5, 0.9], "negative"), hiddenCase("Hidden 1", [0.5, 0.4, 0.4], "positive"), hiddenCase("Hidden 2", [0.8, 0.1, 0.9], "negative")] }),
    problem({ week: 7, index: 4, name: "precision", title: "Precision 指標", category: "模型評估", functionName: "precision_score", signature: ["y_true", "y_pred", "positive_label"], statement: "計算 precision = TP/(TP+FP)，分母為 0 時回傳 0，四捨五入至小數第 4 位。", inputFormat: "y_true/y_pred: list。", outputFormat: "number。", constraintsText: "長度相同。", tests: [publicCase("Sample 1", [[1, 0, 1], [1, 1, 0], 1], 0.5), publicCase("Sample 2", [[0], [0], 1], 0), hiddenCase("Hidden 1", [["Y", "N"], ["Y", "N"], "Y"], 1), hiddenCase("Hidden 2", [[1, 0, 0], [1, 1, 1], 1], 0.3333, "number")] }),
    problem({ week: 7, index: 5, name: "recall", title: "Recall 指標", category: "模型評估", functionName: "recall_score", signature: ["y_true", "y_pred", "positive_label"], statement: "計算 recall = TP/(TP+FN)，分母為 0 時回傳 0，四捨五入至小數第 4 位。", inputFormat: "y_true/y_pred: list。", outputFormat: "number。", constraintsText: "長度相同。", tests: [publicCase("Sample 1", [[1, 0, 1], [1, 1, 0], 1], 0.5), publicCase("Sample 2", [[0], [1], 1], 0), hiddenCase("Hidden 1", [["Y", "N"], ["Y", "N"], "Y"], 1), hiddenCase("Hidden 2", [[1, 1, 1], [1, 0, 0], 1], 0.3333, "number")] })
  ];
}

function neuralProblems() {
  return [
    problem({ week: 8, index: 1, name: "relu", title: "ReLU activation", category: "Neural Network", functionName: "relu", signature: ["values"], statement: "對每個輸入套用 ReLU=max(0,x)。", inputFormat: "values: list[number]。", outputFormat: "list[number]。", constraintsText: "保留順序。", tests: [publicCase("Sample 1", [[-1, 0, 2]], [0, 0, 2]), publicCase("Sample 2", [[]], []), hiddenCase("Hidden 1", [[3, -5]], [3, 0]), hiddenCase("Hidden 2", [[0]], [0])] }),
    problem({ week: 8, index: 2, name: "sigmoid", title: "Sigmoid activation", category: "Neural Network", functionName: "sigmoid_round", signature: ["values"], statement: "對每個輸入計算 sigmoid=1/(1+exp(-x))，四捨五入至小數第 4 位。", inputFormat: "values: list[number]。", outputFormat: "list[number]。", constraintsText: "可使用 math.exp。", tests: [publicCase("Sample 1", [[0]], [0.5], "deepNumber"), publicCase("Sample 2", [[1, -1]], [0.7311, 0.2689], "deepNumber"), hiddenCase("Hidden 1", [[2]], [0.8808], "deepNumber"), hiddenCase("Hidden 2", [[]], [])] }),
    problem({ week: 8, index: 3, name: "dense-layer", title: "單層神經元輸出", difficulty: 2, category: "Neural Network", functionName: "dense_layer", signature: ["inputs", "weights", "bias"], statement: "計算 dot(inputs, weights)+bias，四捨五入至小數第 4 位。", inputFormat: "inputs/weights: list[number], bias: number。", outputFormat: "number。", constraintsText: "inputs 與 weights 長度相同。", tests: [publicCase("Sample 1", [[1, 2], [3, 4], 1], 12), publicCase("Sample 2", [[0], [9], -1], -1), hiddenCase("Hidden 1", [[0.5, 0.5], [1, 3], 0], 2), hiddenCase("Hidden 2", [[], [], 2], 2)] }),
    problem({ week: 8, index: 4, name: "mse", title: "Mean Squared Error", category: "Neural Network", functionName: "mean_squared_error", signature: ["y_true", "y_pred"], statement: "計算 MSE，四捨五入至小數第 4 位。", inputFormat: "y_true/y_pred: list[number]。", outputFormat: "number。", constraintsText: "空陣列回傳 0。", tests: [publicCase("Sample 1", [[1, 2], [1, 4]], 2), publicCase("Sample 2", [[], []], 0), hiddenCase("Hidden 1", [[0, 1], [1, 1]], 0.5), hiddenCase("Hidden 2", [[3], [1]], 4)] }),
    problem({ week: 8, index: 5, name: "binary-threshold", title: "機率轉分類", category: "Neural Network", functionName: "binary_threshold", signature: ["probabilities", "threshold"], statement: "將機率轉成 0/1；大於等於 threshold 為 1，否則 0。", inputFormat: "probabilities: list[number], threshold: number。", outputFormat: "list[int]。", constraintsText: "機率介於 0 到 1。", tests: [publicCase("Sample 1", [[0.2, 0.5, 0.9], 0.5], [0, 1, 1]), publicCase("Sample 2", [[], 0.5], []), hiddenCase("Hidden 1", [[0.7, 0.69], 0.7], [1, 0]), hiddenCase("Hidden 2", [[0], 0], [1])] })
  ];
}

function associationProblems() {
  return [
    problem({ week: 9, index: 1, name: "support-count", title: "Itemset 支持筆數", category: "Association Rules", functionName: "support_count", signature: ["transactions", "itemset"], statement: "計算同時包含 itemset 所有項目的交易筆數。", inputFormat: "transactions: list[list[str]], itemset: list[str]。", outputFormat: "int。", constraintsText: "空 itemset 視為每筆交易都包含。", tests: [publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"]], 2), publicCase("Sample 2", [[["A"]], []], 1), hiddenCase("Hidden 1", [[["A", "B"], ["A", "B", "C"]], ["A", "B"]], 2), hiddenCase("Hidden 2", [[], ["A"]], 0)] }),
    problem({ week: 9, index: 2, name: "frequent-items", title: "頻繁單項集", category: "Association Rules", functionName: "frequent_items", signature: ["transactions", "min_support"], statement: "回傳支持筆數大於等於 min_support 的單一項目，依字典序排序。", inputFormat: "transactions: list[list[str]], min_support: int。", outputFormat: "list[str]。", constraintsText: "同一交易內重複項目只算一次。", tests: [publicCase("Sample 1", [[["B", "A"], ["A"], ["B"]], 2], ["A", "B"]), publicCase("Sample 2", [[], 1], []), hiddenCase("Hidden 1", [[["A", "A"], ["B"]], 1], ["A", "B"]), hiddenCase("Hidden 2", [[["C"], ["C"], ["A"]], 2], ["C"])] }),
    problem({ week: 9, index: 3, name: "confidence", title: "關聯規則信賴度", difficulty: 2, category: "Association Rules", functionName: "rule_confidence", signature: ["transactions", "antecedent", "consequent"], statement: "計算 antecedent -> consequent 的 confidence，四捨五入至小數第 4 位。", inputFormat: "transactions, antecedent: list[str], consequent: list[str]。", outputFormat: "number。", constraintsText: "antecedent 支持筆數為 0 時回傳 0。", tests: [publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"], ["B"]], 0.5), publicCase("Sample 2", [[["A"]], ["X"], ["A"]], 0), hiddenCase("Hidden 1", [[["A", "B"], ["A", "B"]], ["A"], ["B"]], 1), hiddenCase("Hidden 2", [[["A"], ["A", "C"], ["C"]], ["A"], ["C"]], 0.5)] }),
    problem({ week: 9, index: 4, name: "transaction-matrix", title: "交易布林矩陣", category: "Association Rules", functionName: "transaction_matrix", signature: ["transactions", "items"], statement: "依 items 順序將每筆交易轉為 0/1 矩陣。", inputFormat: "transactions: list[list[str]], items: list[str]。", outputFormat: "list[list[int]]。", constraintsText: "交易內重複項不影響結果。", tests: [publicCase("Sample 1", [[["A"], ["B", "A"]], ["A", "B"]], [[1, 0], [1, 1]]), publicCase("Sample 2", [[], ["A"]], []), hiddenCase("Hidden 1", [[["X", "X"]], ["X", "Y"]], [[1, 0]]), hiddenCase("Hidden 2", [[[]], ["A"]], [[0]])] }),
    problem({ week: 9, index: 5, name: "lift", title: "關聯規則 Lift", difficulty: 2, category: "Association Rules", functionName: "rule_lift", signature: ["transactions", "antecedent", "consequent"], statement: "計算 lift = confidence(A->B) / support(B)，四捨五入至小數第 4 位；分母為 0 回傳 0。", inputFormat: "transactions, antecedent, consequent。", outputFormat: "number。", constraintsText: "support(B) 為包含 consequent 的交易比例。", tests: [publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"], ["B"]], 0.75), publicCase("Sample 2", [[["A"]], ["A"], ["X"]], 0), hiddenCase("Hidden 1", [[["A", "B"], ["A", "B"]], ["A"], ["B"]], 1), hiddenCase("Hidden 2", [[["A", "C"], ["A"], ["C"], []], ["A"], ["C"]], 1)] })
  ];
}

function clusteringProblems() {
  return [
    problem({ week: 10, index: 1, name: "euclidean", title: "歐氏距離", category: "Clustering", functionName: "euclidean_distance", signature: ["a", "b"], statement: "計算兩個向量的歐氏距離，四捨五入至小數第 4 位。", inputFormat: "a/b: list[number]。", outputFormat: "number。", constraintsText: "兩向量長度相同。", tests: [publicCase("Sample 1", [[0, 0], [3, 4]], 5), publicCase("Sample 2", [[1], [4]], 3), hiddenCase("Hidden 1", [[1, 2], [1, 2]], 0), hiddenCase("Hidden 2", [[0, 0, 0], [1, 2, 2]], 3)] }),
    problem({ week: 10, index: 2, name: "assign-centroids", title: "指派最近中心", category: "Clustering", functionName: "assign_centroids", signature: ["points", "centroids"], statement: "將每個 point 指派到最近 centroid 的索引；距離相同取較小索引。", inputFormat: "points/centroids: list[list[number]]。", outputFormat: "list[int]。", constraintsText: "centroids 至少一個。", tests: [publicCase("Sample 1", [[[0], [10]], [[0], [9]]], [0, 1]), publicCase("Sample 2", [[[5]], [[0], [10]]], [0]), hiddenCase("Hidden 1", [[], [[0]]], []), hiddenCase("Hidden 2", [[[2, 0]], [[0, 0], [3, 0]]], [1])] }),
    problem({ week: 10, index: 3, name: "centroid", title: "計算群中心", category: "Clustering", functionName: "centroid", signature: ["points"], statement: "計算多維 points 的平均中心，各維四捨五入至小數第 4 位。", inputFormat: "points: list[list[number]]。", outputFormat: "list[number]。", constraintsText: "points 至少一筆。", tests: [publicCase("Sample 1", [[[0, 0], [2, 4]]], [1, 2]), publicCase("Sample 2", [[[5]]], [5]), hiddenCase("Hidden 1", [[[1, 2], [3, 4], [5, 6]]], [3, 4]), hiddenCase("Hidden 2", [[[0.5, 1.5], [1.5, 2.5]]], [1, 2])] }),
    problem({ week: 10, index: 4, name: "sse", title: "群內平方和 SSE", difficulty: 2, category: "Clustering", functionName: "cluster_sse", signature: ["points", "labels", "centroids"], statement: "計算每個點到其所屬 centroid 的平方距離總和，四捨五入至小數第 4 位。", inputFormat: "points, labels: list[int], centroids。", outputFormat: "number。", constraintsText: "labels 與 points 長度相同。", tests: [publicCase("Sample 1", [[[0], [2]], [0, 0], [[1]]], 2), publicCase("Sample 2", [[], [], [[0]]], 0), hiddenCase("Hidden 1", [[[0, 0], [3, 4]], [0, 1], [[0, 0], [0, 0]]], 25), hiddenCase("Hidden 2", [[[1]], [0], [[1]]], 0)] }),
    problem({ week: 10, index: 5, name: "cluster-sizes", title: "各群大小統計", category: "Clustering", functionName: "cluster_sizes", signature: ["labels"], statement: "統計每個 cluster label 的筆數，回傳 key 為字串的 dict，依比較不要求順序。", inputFormat: "labels: list。", outputFormat: "dict[str, int]。", constraintsText: "空輸入回傳空 dict。", tests: [publicCase("Sample 1", [[0, 1, 0]], { 0: 2, 1: 1 }), publicCase("Sample 2", [[]], {}), hiddenCase("Hidden 1", [["A", "A", "B"]], { A: 2, B: 1 }), hiddenCase("Hidden 2", [[2]], { 2: 1 })] })
  ];
}
