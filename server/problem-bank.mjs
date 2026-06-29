const weekTitles = {
  1: {
    zh: "資料科學與 KDD 基礎",
    en: "Data Science and KDD Foundations"
  },
  2: {
    zh: "資料探勘任務與資料倉儲",
    en: "Data Mining Tasks and Data Warehousing"
  },
  3: {
    zh: "EDA、描述統計與視覺化資料",
    en: "EDA, Descriptive Statistics, and Visualization Data"
  },
  4: {
    zh: "資料前處理：品質、清理、整合與轉換",
    en: "Data Preprocessing: Quality, Cleaning, Integration, and Transformation"
  },
  5: {
    zh: "資料精簡、特徵選擇與資料分割",
    en: "Data Reduction, Feature Selection, and Data Partitioning"
  },
  6: {
    zh: "分類：決策樹與資訊理論",
    en: "Classification: Decision Trees and Information Theory"
  },
  8: {
    zh: "分類：Ensemble、Bayes、KNN 與模型評估",
    en: "Classification: Ensemble, Bayes, KNN, and Model Evaluation"
  },
  9: {
    zh: "ANN、模型訓練與可解釋性",
    en: "ANN, Model Training, and Explainability"
  },
  10: {
    zh: "關聯規則與 Apriori",
    en: "Association Rules and Apriori"
  },
  11: {
    zh: "相似度學習與群集分析",
    en: "Similarity-Based Learning and Clustering"
  }
};

function slug(week, index, name) {
  return `week-${String(week).padStart(2, "0")}-${index}-${name}`;
}

function starter(functionName, signature) {
  return `def ${functionName}(${signature.join(", ")}):\n    # TODO: implement your solution.\n    pass\n`;
}

function problem({
  week,
  index,
  name,
  title,
  titleEn,
  difficulty,
  category,
  categoryEn,
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
  tests
}) {
  return {
    slug: slug(week, index, name),
    week,
    seriesTitle: weekTitles[week].zh,
    seriesTitleEn: weekTitles[week].en,
    title,
    titleEn,
    difficulty,
    category,
    categoryEn,
    timeLimitSeconds: difficulty === 1 ? 1800 : difficulty === 2 ? 2400 : 3600,
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
    starterCode: starter(functionName, signature),
    tests
  };
}

function publicCase(name, args, expected, comparator = "exact") {
  return { name, visibility: "public", args, expected, comparator, points: 1 };
}

function hiddenCase(name, args, expected, comparator = "exact") {
  return { name, visibility: "hidden", args, expected, comparator, points: 1 };
}

export function buildProblemBank() {
  return problemSpecs.map(problem);
}

const problemSpecs = [
  {
    week: 1,
    index: 1,
    name: "dataset-shape",
    title: "盤點資料表規模",
    titleEn: "Inspect Dataset Shape",
    difficulty: 1,
    category: "資料科學基礎",
    categoryEn: "Data Science Foundations",
    functionName: "dataset_shape",
    signature: ["records"],
    statement:
      "在開始任何資料探勘任務前，資料科學家需要先確認資料集的基本規模。你會拿到以 list[dict] 表示的資料表，每個 dict 是一列資料。因為真實資料可能來自不同來源，不同列不一定有完全相同的欄位。請回傳列數與所有曾出現過的欄位數，作為後續資料理解階段的第一份摘要。",
    statementEn:
      "Before any data mining task, a data scientist first checks the basic size of the dataset. You receive a table represented as list[dict], where each dict is one row. Real data may come from multiple sources, so different rows may not contain the same keys. Return the row count and the number of distinct columns observed across all rows.",
    inputFormat: "records: list[dict]，每個 dict 代表一列資料。",
    inputFormatEn: "records: list[dict], where each dict represents one data row.",
    outputFormat: "dict，格式為 {\"rows\": int, \"columns\": int}。",
    outputFormatEn: "dict in the form {\"rows\": int, \"columns\": int}.",
    constraintsText: "不要修改輸入資料。\n欄位數以所有列的 key 聯集計算。\n空資料集的 rows 與 columns 都為 0。",
    constraintsTextEn: "Do not mutate the input.\nThe column count is the union of keys across rows.\nAn empty dataset has 0 rows and 0 columns.",
    tests: [
      publicCase("Sample 1", [[{ age: 20, city: "TPE" }, { age: 21, score: 80 }]], { rows: 2, columns: 3 }),
      publicCase("Sample 2", [[]], { rows: 0, columns: 0 }),
      hiddenCase("Hidden 1", [[{ a: 1 }, { b: 2, c: 3 }, { a: 4, c: 5 }]], { rows: 3, columns: 3 })
    ]
  },
  {
    week: 1,
    index: 2,
    name: "missing-value-report",
    title: "統計欄位缺漏值",
    titleEn: "Report Missing Values",
    difficulty: 1,
    category: "資料理解",
    categoryEn: "Data Understanding",
    functionName: "missing_value_report",
    signature: ["records", "columns"],
    statement:
      "資料品質會直接影響模型與分析結論。請協助助教針對指定欄位建立缺漏值報告：如果某列沒有該欄位，或該欄位值為 None、空字串、字串 NA，就視為缺漏。回傳每個欄位的缺漏筆數，讓後續資料前處理可以判斷是否需要補值或移除欄位。",
    statementEn:
      "Data quality directly affects models and analytical conclusions. Build a missing-value report for selected columns. A value is missing if the key is absent in a row, or if the value is None, an empty string, or the string NA. Return the missing count for each requested column so preprocessing can decide whether to impute or remove fields.",
    inputFormat: "records: list[dict]；columns: list[str]，指定要檢查的欄位。",
    inputFormatEn: "records: list[dict]; columns: list[str] containing fields to check.",
    outputFormat: "dict[str,int]，key 為欄位名稱，value 為缺漏筆數。",
    outputFormatEn: "dict[str,int], mapping each column name to its missing count.",
    constraintsText: "columns 中的欄位即使沒有出現在資料中也要回傳。\n只有 None、\"\"、\"NA\" 與欄位不存在算缺漏。\n不要修改輸入資料。",
    constraintsTextEn: "Return every requested column even if it never appears.\nOnly None, \"\", \"NA\", and absent keys are missing.\nDo not mutate the input.",
    tests: [
      publicCase(
        "Sample 1",
        [[{ age: 20, city: "" }, { city: "TPE" }, { age: null, city: "KHH" }], ["age", "city"]],
        { age: 2, city: 1 }
      ),
      publicCase("Sample 2", [[], ["x"]], { x: 0 }),
      hiddenCase("Hidden 1", [[{ x: "NA" }, { x: 0 }, {}], ["x"]], { x: 2 })
    ]
  },
  {
    week: 1,
    index: 3,
    name: "kdd-stage-order",
    title: "檢查 KDD 流程順序",
    titleEn: "Validate KDD Stage Order",
    difficulty: 2,
    category: "KDD 流程",
    categoryEn: "KDD Process",
    functionName: "kdd_stage_order",
    signature: ["stages"],
    statement:
      "KDD 強調資料探勘不是單一演算法，而是一連串從理解問題到部署知識的流程。給定一份專案紀錄中的階段名稱，請判斷這些階段是否符合合理的非遞減流程順序。允許同一階段重複出現，但不能倒退到較早階段；若出現未知階段，也應視為不合理。",
    statementEn:
      "KDD emphasizes that data mining is not a single algorithm but a process from understanding the problem to deploying knowledge. Given recorded stage names from a project, determine whether they follow a valid non-decreasing process order. Repeated stages are allowed, but returning to an earlier stage is invalid; unknown stages are also invalid.",
    inputFormat: "stages: list[str]，每個值為一個階段名稱。",
    inputFormatEn: "stages: list[str], where each value is a stage name.",
    outputFormat: "bool，若順序合理回傳 True，否則回傳 False。",
    outputFormatEn: "bool, True if the order is valid, otherwise False.",
    constraintsText:
      "合法順序為 business_understanding、data_selection、preprocessing、transformation、mining、evaluation、deployment。\n允許重複同一階段。\n空列表視為合理。",
    constraintsTextEn:
      "The valid order is business_understanding, data_selection, preprocessing, transformation, mining, evaluation, deployment.\nRepeating the same stage is allowed.\nAn empty list is valid.",
    tests: [
      publicCase("Sample 1", [["business_understanding", "data_selection", "preprocessing", "mining", "evaluation"]], true),
      publicCase("Sample 2", [["preprocessing", "data_selection"]], false),
      hiddenCase("Hidden 1", [["data_selection", "data_selection", "mining", "deployment"]], true)
    ]
  },
  {
    week: 1,
    index: 4,
    name: "task-type-classifier",
    title: "從專案目標判斷探勘任務",
    titleEn: "Classify Mining Tasks from Goals",
    difficulty: 2,
    category: "資料探勘任務",
    categoryEn: "Data Mining Tasks",
    functionName: "task_type_classifier",
    signature: ["goals"],
    statement:
      "資料科學專案常從含糊的商業問題開始，資料科學家必須把問題翻譯成明確的資料探勘任務。請根據每句目標描述中的關鍵字，判斷它比較接近 classification、regression、clustering、association、anomaly 或 unknown。這題重點不是自然語言模型，而是把課堂中的任務類型規則化。",
    statementEn:
      "Data science projects often start from vague business questions, and the data scientist must translate them into concrete data mining tasks. Use keywords in each goal statement to classify it as classification, regression, clustering, association, anomaly, or unknown. This problem focuses on rule-based mapping of the task types introduced in class.",
    inputFormat: "goals: list[str]，每個字串是一句專案目標。",
    inputFormatEn: "goals: list[str], each string is a project goal.",
    outputFormat: "list[str]，與 goals 長度相同。",
    outputFormatEn: "list[str] with the same length as goals.",
    constraintsText:
      "不分大小寫。\nclass、label、churn、default 對應 classification。\nforecast、predict value、regression 對應 regression。\nsegment、group、cluster 對應 clustering。\nbasket、together、association 對應 association。\nanomaly、outlier、fraud 對應 anomaly；若都不符合回傳 unknown。",
    constraintsTextEn:
      "Matching is case-insensitive.\nclass, label, churn, default map to classification.\nforecast, predict value, regression map to regression.\nsegment, group, cluster map to clustering.\nbasket, together, association map to association.\nanomaly, outlier, fraud map to anomaly; otherwise return unknown.",
    tests: [
      publicCase(
        "Sample 1",
        [["predict customer churn label", "find products bought together", "group similar customers"]],
        ["classification", "association", "clustering"]
      ),
      publicCase(
        "Sample 2",
        [["forecast next month sales", "detect outlier transactions", "describe field"]],
        ["regression", "anomaly", "unknown"]
      ),
      hiddenCase("Hidden 1", [["classify fraud risk", "market basket association"]], ["classification", "association"])
    ]
  },
  {
    week: 1,
    index: 5,
    name: "dataset-profile",
    title: "建立資料集輪廓摘要",
    titleEn: "Build a Dataset Profile",
    difficulty: 3,
    category: "資料理解",
    categoryEn: "Data Understanding",
    functionName: "dataset_profile",
    signature: ["records", "numeric_columns", "categorical_columns"],
    statement:
      "在資料探勘的資料理解階段，分析者通常會建立 profile 來快速掌握資料狀況。你會收到資料列、數值欄位清單與類別欄位清單。請同時計算列數、各數值欄位的平均值、各類別欄位的非缺漏唯一值數量，以及所有指定欄位的缺漏筆數。這份摘要將協助後續決定清理、轉換與建模策略。",
    statementEn:
      "During the data understanding stage of data mining, analysts often build a profile to understand the dataset quickly. You receive rows, a list of numeric columns, and a list of categorical columns. Compute the row count, means for numeric fields, unique non-missing value counts for categorical fields, and missing counts for all requested fields. This profile will guide cleaning, transformation, and modeling choices.",
    inputFormat: "records: list[dict]；numeric_columns、categorical_columns: list[str]。",
    inputFormatEn: "records: list[dict]; numeric_columns and categorical_columns: list[str].",
    outputFormat:
      "dict，包含 rows、numericMeans、categoricalUnique、missing 四個 key。平均值四捨五入到 4 位小數；沒有有效數值時平均值為 None。",
    outputFormatEn:
      "dict with rows, numericMeans, categoricalUnique, and missing. Means are rounded to 4 decimals; use None when a numeric field has no valid values.",
    constraintsText:
      "缺漏值定義為欄位不存在、None、空字串或 \"NA\"。\n數值欄位可用 float(value) 轉換；轉換失敗視為缺漏。\n類別唯一值不包含缺漏值。",
    constraintsTextEn:
      "Missing means absent key, None, empty string, or \"NA\".\nNumeric values may be converted with float(value); failed conversion is missing.\nCategorical unique counts exclude missing values.",
    tests: [
      publicCase(
        "Sample 1",
        [[
          { age: 20, income: 100, city: "TPE" },
          { age: 30, income: null, city: "TPE" },
          { age: "", income: 150, city: "KHH" }
        ], ["age", "income"], ["city"]],
        {
          rows: 3,
          numericMeans: { age: 25, income: 125 },
          categoricalUnique: { city: 2 },
          missing: { age: 1, income: 1, city: 0 }
        },
        "deepNumber"
      ),
      publicCase(
        "Sample 2",
        [[], ["x"], ["y"]],
        { rows: 0, numericMeans: { x: null }, categoricalUnique: { y: 0 }, missing: { x: 0, y: 0 } },
        "deepNumber"
      ),
      hiddenCase(
        "Hidden 1",
        [[{ x: 1, segment: "A" }, { x: "3.5", segment: "" }, { segment: "B" }], ["x"], ["segment"]],
        { rows: 3, numericMeans: { x: 2.25 }, categoricalUnique: { segment: 2 }, missing: { x: 1, segment: 1 } },
        "deepNumber"
      )
    ]
  },
  {
    week: 2,
    index: 1,
    name: "data-cube-cell-count",
    title: "計算資料方塊儲存格數",
    titleEn: "Count Data Cube Cells",
    difficulty: 1,
    category: "資料倉儲",
    categoryEn: "Data Warehousing",
    functionName: "data_cube_cell_count",
    signature: ["dimensions"],
    statement:
      "資料倉儲常用多維資料方塊來支援 OLAP 分析。給定每個維度的成員數，請計算完整方塊在最細粒度下可能包含多少個儲存格。這個數字可以幫助判斷 cube 是否可能過大，以及是否需要摘要、分割或其他資料精簡策略。",
    statementEn:
      "Data warehouses often use multidimensional cubes for OLAP analysis. Given the number of members in each dimension, compute how many cells a full cube may contain at the finest granularity. This number helps decide whether the cube may be too large and whether summarization, partitioning, or other reduction strategies are needed.",
    inputFormat: "dimensions: dict[str,int]，value 是該維度的成員數。",
    inputFormatEn: "dimensions: dict[str,int], where each value is the member count of that dimension.",
    outputFormat: "int，所有維度成員數的乘積。",
    outputFormatEn: "int, the product of member counts across dimensions.",
    constraintsText: "空 dict 的乘積視為 1。\n若任何維度成員數為 0，結果為 0。\n所有成員數皆為非負整數。",
    constraintsTextEn: "The product of an empty dict is 1.\nIf any dimension has 0 members, return 0.\nAll member counts are non-negative integers.",
    tests: [
      publicCase("Sample 1", [{ store: 3, month: 12, product: 5 }], 180),
      publicCase("Sample 2", [{}], 1),
      hiddenCase("Hidden 1", [{ region: 2, product: 0 }], 0)
    ]
  },
  {
    week: 2,
    index: 2,
    name: "task-label-from-goal",
    title: "標記單一探勘任務",
    titleEn: "Label One Mining Task",
    difficulty: 1,
    category: "資料探勘任務",
    categoryEn: "Data Mining Tasks",
    functionName: "task_label_from_goal",
    signature: ["goal"],
    statement:
      "課堂中介紹了分類、分群、關聯、異常偵測與數值預測等資料探勘任務。請根據一段目標描述回傳最可能的任務標籤。這是一個簡化版的需求理解練習，目的是讓學生把商業語句轉成資料探勘術語。",
    statementEn:
      "The course introduces data mining tasks such as classification, clustering, association, anomaly detection, and numeric prediction. Given one goal statement, return the most likely task label. This simplified requirements-understanding exercise asks students to translate business language into data mining terminology.",
    inputFormat: "goal: str，一段專案目標描述。",
    inputFormatEn: "goal: str, one project goal statement.",
    outputFormat: "str，任務標籤。",
    outputFormatEn: "str, the task label.",
    constraintsText:
      "不分大小寫。\nlabel、class、churn 對應 classification。\ncluster、segment 對應 clustering。\nbasket、together、association 對應 association。\nanomaly、outlier、fraud 對應 anomaly_detection。\nforecast、predict 對應 numeric_prediction；若沒有符合則回傳 unknown。",
    constraintsTextEn:
      "Matching is case-insensitive.\nlabel, class, churn map to classification.\ncluster, segment map to clustering.\nbasket, together, association map to association.\nanomaly, outlier, fraud map to anomaly_detection.\nforecast and predict map to numeric_prediction; otherwise return unknown.",
    tests: [
      publicCase("Sample 1", ["Predict next month revenue"], "numeric_prediction"),
      publicCase("Sample 2", ["Segment customers by behavior"], "clustering"),
      hiddenCase("Hidden 1", ["Find baskets of products purchased together"], "association")
    ]
  },
  {
    week: 2,
    index: 3,
    name: "rollup-sum",
    title: "彙總維度銷售額",
    titleEn: "Roll Up Measure by Dimension",
    difficulty: 2,
    category: "OLAP 彙總",
    categoryEn: "OLAP Aggregation",
    functionName: "rollup_sum",
    signature: ["records", "group_key", "measure_key"],
    statement:
      "在資料倉儲分析中，roll-up 會把較細的交易資料彙總到較高層級。請針對指定維度欄位加總指定量測欄位。如果分組欄位缺漏或為 None，請歸入 UNKNOWN；如果量測值不是可轉成數字的值，則以 0 加總。回傳各群組的總和。",
    statementEn:
      "In data warehouse analysis, roll-up aggregates detailed transaction records to a higher level. Sum a specified measure by a specified dimension field. If the group field is missing or None, place the row under UNKNOWN; if the measure value cannot be converted to a number, add 0. Return the total for each group.",
    inputFormat: "records: list[dict]；group_key、measure_key: str。",
    inputFormatEn: "records: list[dict]; group_key and measure_key: str.",
    outputFormat: "dict[str,number]，key 為群組值，value 為加總結果。",
    outputFormatEn: "dict[str,number], mapping each group value to its sum.",
    constraintsText: "可使用 float(value) 轉換量測值。\n分組值要轉成字串；缺漏與 None 使用 UNKNOWN。\n不要修改輸入資料。",
    constraintsTextEn: "You may convert measures with float(value).\nConvert group values to strings; missing and None become UNKNOWN.\nDo not mutate the input.",
    tests: [
      publicCase(
        "Sample 1",
        [[{ region: "N", sales: 10 }, { region: "S", sales: 5 }, { region: "N", sales: 7 }, { region: null, sales: 3 }], "region", "sales"],
        { N: 17, S: 5, UNKNOWN: 3 },
        "deepNumber"
      ),
      publicCase("Sample 2", [[], "region", "sales"], {}, "deepNumber"),
      hiddenCase(
        "Hidden 1",
        [[{ r: "A", v: "2.5" }, { r: "A", v: "bad" }, { v: 4 }], "r", "v"],
        { A: 2.5, UNKNOWN: 4 },
        "deepNumber"
      )
    ]
  },
  {
    week: 2,
    index: 4,
    name: "crisp-dm-next-step",
    title: "推進 CRISP-DM 下一步",
    titleEn: "Advance to the Next CRISP-DM Step",
    difficulty: 2,
    category: "資料探勘流程",
    categoryEn: "Data Mining Process",
    functionName: "crisp_dm_next_step",
    signature: ["stage"],
    statement:
      "CRISP-DM 是資料探勘專案常用的方法論。請根據目前階段回傳下一個主要階段，協助專案管理工具提醒團隊下一步工作。若目前已在 deployment，回傳 complete；若階段名稱不在標準流程中，回傳 unknown。",
    statementEn:
      "CRISP-DM is a common methodology for data mining projects. Given the current stage, return the next major stage so a project management tool can remind the team what to do next. If the current stage is deployment, return complete; if the stage is not part of the standard process, return unknown.",
    inputFormat: "stage: str，目前 CRISP-DM 階段。",
    inputFormatEn: "stage: str, the current CRISP-DM stage.",
    outputFormat: "str，下一個階段名稱。",
    outputFormatEn: "str, the next stage name.",
    constraintsText:
      "流程為 business_understanding -> data_understanding -> data_preparation -> modeling -> evaluation -> deployment -> complete。\n輸入需完全符合階段名稱。\n未知階段回傳 unknown。",
    constraintsTextEn:
      "The flow is business_understanding -> data_understanding -> data_preparation -> modeling -> evaluation -> deployment -> complete.\nThe input must exactly match a stage name.\nUnknown stages return unknown.",
    tests: [
      publicCase("Sample 1", ["business_understanding"], "data_understanding"),
      publicCase("Sample 2", ["deployment"], "complete"),
      hiddenCase("Hidden 1", ["data_preparation"], "modeling")
    ]
  },
  {
    week: 2,
    index: 5,
    name: "olap-pivot",
    title: "建立 OLAP 樞紐彙總表",
    titleEn: "Build an OLAP Pivot Summary",
    difficulty: 3,
    category: "資料倉儲",
    categoryEn: "Data Warehousing",
    functionName: "olap_pivot",
    signature: ["records", "row_key", "col_key", "measure_key"],
    statement:
      "資料倉儲中的 slice、dice 與 pivot 可以讓分析者從不同維度觀察量測值。請根據列維度、欄維度與量測欄位建立二維彙總表。每筆資料會落在某個 row group 與 column group，請把 measure 加總到對應格子。缺漏的 row 或 column 歸入 UNKNOWN。",
    statementEn:
      "Slice, dice, and pivot operations in a data warehouse let analysts view measures through different dimensions. Build a two-dimensional summary table using a row dimension, a column dimension, and a measure field. Each record belongs to one row group and one column group; add the measure to the corresponding cell. Missing row or column values belong to UNKNOWN.",
    inputFormat: "records: list[dict]；row_key、col_key、measure_key: str。",
    inputFormatEn: "records: list[dict]; row_key, col_key, and measure_key: str.",
    outputFormat: "dict[str,dict[str,number]]，外層 key 是 row group，內層 key 是 column group。",
    outputFormatEn: "dict[str,dict[str,number]], where outer keys are row groups and inner keys are column groups.",
    constraintsText:
      "量測值可用 float(value) 轉換；轉換失敗以 0 計算。\n缺漏或 None 的維度值使用 UNKNOWN。\n不要修改輸入資料。",
    constraintsTextEn:
      "Measures may be converted with float(value); failed conversion counts as 0.\nMissing or None dimension values use UNKNOWN.\nDo not mutate the input.",
    tests: [
      publicCase(
        "Sample 1",
        [[
          { region: "N", channel: "web", sales: 10 },
          { region: "N", channel: "store", sales: 4 },
          { region: "S", channel: "web", sales: 7 },
          { region: "N", channel: "web", sales: 2 }
        ], "region", "channel", "sales"],
        { N: { web: 12, store: 4 }, S: { web: 7 } },
        "deepNumber"
      ),
      publicCase("Sample 2", [[], "region", "channel", "sales"], {}, "deepNumber"),
      hiddenCase(
        "Hidden 1",
        [[{ r: "A", c: "X", v: "1.5" }, { r: "A", c: "X", v: 2 }, { r: null, c: "Y", v: "bad" }], "r", "c", "v"],
        { A: { X: 3.5 }, UNKNOWN: { Y: 0 } },
        "deepNumber"
      )
    ]
  },
  {
    week: 3,
    index: 1,
    name: "attribute-type-counts",
    title: "統計屬性型態",
    titleEn: "Count Attribute Types",
    difficulty: 1,
    category: "EDA",
    categoryEn: "EDA",
    functionName: "attribute_type_counts",
    signature: ["schema"],
    statement:
      "EDA 的第一步通常是了解欄位型態。給定欄位名稱到型態名稱的 schema，請統計 numeric、categorical、ordinal、binary 與 other 的數量。這能幫助後續決定哪些欄位適合做尺度轉換、哪些欄位需要編碼。",
    statementEn:
      "A first step in EDA is understanding attribute types. Given a schema mapping column names to type names, count numeric, categorical, ordinal, binary, and other attributes. This helps decide which fields need scaling and which fields need encoding.",
    inputFormat: "schema: dict[str,str]，key 為欄位名稱，value 為型態名稱。",
    inputFormatEn: "schema: dict[str,str], mapping column names to type names.",
    outputFormat: "dict，包含 numeric、categorical、ordinal、binary、other 五個 key。",
    outputFormatEn: "dict containing numeric, categorical, ordinal, binary, and other.",
    constraintsText: "型態名稱不分大小寫。\n不屬於前四種的型態都計入 other。\n空 schema 五個計數皆為 0。",
    constraintsTextEn: "Type names are case-insensitive.\nAny type outside the first four categories counts as other.\nAn empty schema returns all zero counts.",
    tests: [
      publicCase("Sample 1", [{ age: "numeric", city: "categorical", rank: "ordinal", clicked: "binary" }], {
        numeric: 1,
        categorical: 1,
        ordinal: 1,
        binary: 1,
        other: 0
      }),
      publicCase("Sample 2", [{}], { numeric: 0, categorical: 0, ordinal: 0, binary: 0, other: 0 }),
      hiddenCase("Hidden 1", [{ a: "Numeric", b: "text", c: "categorical" }], {
        numeric: 1,
        categorical: 1,
        ordinal: 0,
        binary: 0,
        other: 1
      })
    ]
  },
  {
    week: 3,
    index: 2,
    name: "basic-numeric-summary",
    title: "產生基本描述統計",
    titleEn: "Create Basic Descriptive Statistics",
    difficulty: 1,
    category: "描述統計",
    categoryEn: "Descriptive Statistics",
    functionName: "basic_numeric_summary",
    signature: ["values"],
    statement:
      "描述統計可以快速呈現資料分布的基本樣貌。請針對一組數值計算筆數、平均、最小、最大與範圍。這些指標雖然簡單，但常用來檢查資料是否有明顯異常、尺度是否合理，以及是否需要進一步視覺化。",
    statementEn:
      "Descriptive statistics quickly summarize the basic shape of a numeric distribution. For a list of values, compute count, mean, minimum, maximum, and range. These simple indicators are commonly used to check for obvious anomalies, reasonable scale, and whether additional visualization is needed.",
    inputFormat: "values: list[number]，至少一個數值。",
    inputFormatEn: "values: list[number], containing at least one number.",
    outputFormat: "dict，格式為 {\"count\": int, \"mean\": number, \"min\": number, \"max\": number, \"range\": number}。",
    outputFormatEn: "dict in the form {\"count\": int, \"mean\": number, \"min\": number, \"max\": number, \"range\": number}.",
    constraintsText: "平均值四捨五入到 4 位小數。\nrange = max - min。\n輸入不會是空列表。",
    constraintsTextEn: "Round the mean to 4 decimals.\nrange = max - min.\nThe input list will not be empty.",
    tests: [
      publicCase("Sample 1", [[2, 4, 6]], { count: 3, mean: 4, min: 2, max: 6, range: 4 }, "deepNumber"),
      publicCase("Sample 2", [[5]], { count: 1, mean: 5, min: 5, max: 5, range: 0 }, "deepNumber"),
      hiddenCase("Hidden 1", [[-1, 1, 2]], { count: 3, mean: 0.6667, min: -1, max: 2, range: 3 }, "deepNumber")
    ]
  },
  {
    week: 3,
    index: 3,
    name: "histogram-counts",
    title: "計算直方圖區間筆數",
    titleEn: "Count Histogram Bins",
    difficulty: 2,
    category: "視覺化資料準備",
    categoryEn: "Visualization Data Preparation",
    functionName: "histogram_counts",
    signature: ["values", "bin_edges"],
    statement:
      "直方圖能顯示數值資料落在不同區間的頻率。請根據給定的 bin_edges 回傳每個區間的筆數。除了最後一個區間包含右端點外，其餘區間皆為左閉右開。落在所有區間之外的值不計入任何區間。",
    statementEn:
      "A histogram shows how often numeric values fall into different intervals. Given bin_edges, return the count for each bin. Every bin is left-closed and right-open except the last bin, which includes its right endpoint. Values outside all intervals are ignored.",
    inputFormat: "values: list[number]；bin_edges: list[number]，至少兩個遞增邊界。",
    inputFormatEn: "values: list[number]; bin_edges: list[number] with at least two increasing edges.",
    outputFormat: "list[int]，長度為 len(bin_edges) - 1。",
    outputFormatEn: "list[int] of length len(bin_edges) - 1.",
    constraintsText: "bin_edges 已經遞增排序。\n最後一個 bin 包含右端點。\n區間外的 values 忽略。",
    constraintsTextEn: "bin_edges is already sorted increasingly.\nThe final bin includes the right endpoint.\nValues outside the intervals are ignored.",
    tests: [
      publicCase("Sample 1", [[0, 1, 2, 3, 4], [0, 2, 4]], [2, 3]),
      publicCase("Sample 2", [[-1, 0, 0.5, 1, 2], [0, 1, 2]], [2, 2]),
      hiddenCase("Hidden 1", [[1, 1, 1], [0, 1, 2]], [0, 3])
    ]
  },
  {
    week: 3,
    index: 4,
    name: "iqr-outliers",
    title: "用 IQR 找出離群值",
    titleEn: "Detect IQR Outliers",
    difficulty: 2,
    category: "資料分布",
    categoryEn: "Data Distribution",
    functionName: "iqr_outliers",
    signature: ["values", "q1", "q3"],
    statement:
      "EDA 常用四分位距 IQR 檢查可能的離群值。給定資料值、第一四分位數 q1 與第三四分位數 q3，請使用 1.5 * IQR 規則找出小於下界或大於上界的值。回傳離群值時需維持原始出現順序，方便後續追蹤來源資料列。",
    statementEn:
      "EDA commonly uses the interquartile range (IQR) to inspect possible outliers. Given values, q1, and q3, use the 1.5 * IQR rule to find values below the lower fence or above the upper fence. Return outliers in their original order so analysts can trace them back to source rows.",
    inputFormat: "values: list[number]；q1、q3: number。",
    inputFormatEn: "values: list[number]; q1 and q3: number.",
    outputFormat: "list[number]，依原始順序排列的離群值。",
    outputFormatEn: "list[number], outliers in original order.",
    constraintsText: "IQR = q3 - q1。\nlower = q1 - 1.5 * IQR；upper = q3 + 1.5 * IQR。\n等於上下界不算離群。",
    constraintsTextEn: "IQR = q3 - q1.\nlower = q1 - 1.5 * IQR; upper = q3 + 1.5 * IQR.\nValues exactly on the fences are not outliers.",
    tests: [
      publicCase("Sample 1", [[10, 12, 13, 100], 11, 14], [100]),
      publicCase("Sample 2", [[1, 2, 3], 1.5, 2.5], []),
      hiddenCase("Hidden 1", [[-10, 0, 1, 2, 20], 0, 2], [-10, 20])
    ]
  },
  {
    week: 3,
    index: 5,
    name: "pearson-pairwise",
    title: "計算成對皮爾森相關",
    titleEn: "Compute Pairwise Pearson Correlation",
    difficulty: 3,
    category: "相關分析",
    categoryEn: "Correlation Analysis",
    functionName: "pearson_pairwise",
    signature: ["records", "columns"],
    statement:
      "探索數值欄位之間的相關性有助於發現冗餘特徵與潛在關係。請針對指定欄位的所有成對組合計算 Pearson correlation。每一對欄位只能使用兩個欄位都有有效數值的資料列；若可用資料不足兩筆，或任一欄位變異為 0，該相關係數回傳 0。",
    statementEn:
      "Exploring correlations between numeric fields helps reveal redundant features and potential relationships. For every pair of requested columns, compute the Pearson correlation. For each pair, only rows with valid numeric values in both fields are used. If fewer than two rows remain or either field has zero variance, return 0 for that pair.",
    inputFormat: "records: list[dict]；columns: list[str]，至少兩個欄位。",
    inputFormatEn: "records: list[dict]; columns: list[str] with at least two fields.",
    outputFormat: "dict[str,number]，key 格式為 \"colA|colB\"，依 columns 中的成對順序建立。",
    outputFormatEn: "dict[str,number], with keys formatted as \"colA|colB\" following pair order from columns.",
    constraintsText: "可使用 float(value) 轉換數值。\n無效或缺漏值該列不參與該欄位對計算。\n結果四捨五入到 4 位小數。",
    constraintsTextEn: "You may convert values with float(value).\nInvalid or missing values are excluded for that column pair.\nRound results to 4 decimals.",
    tests: [
      publicCase(
        "Sample 1",
        [[{ x: 1, y: 2, z: 5 }, { x: 2, y: 4, z: 5 }, { x: 3, y: 6, z: 7 }], ["x", "y", "z"]],
        { "x|y": 1, "x|z": 0.866, "y|z": 0.866 },
        "deepNumber"
      ),
      publicCase("Sample 2", [[{ a: 1, b: 2 }, { a: 1, b: 3 }], ["a", "b"]], { "a|b": 0 }, "deepNumber"),
      hiddenCase("Hidden 1", [[{ a: 1, b: 1 }, { a: 2 }, { a: 3, b: 3 }], ["a", "b"]], { "a|b": 1 }, "deepNumber")
    ]
  },
  {
    week: 4,
    index: 1,
    name: "quality-score",
    title: "計算資料品質分數",
    titleEn: "Calculate Data Quality Score",
    difficulty: 1,
    category: "資料品質",
    categoryEn: "Data Quality",
    functionName: "quality_score",
    signature: ["checks"],
    statement:
      "資料前處理前，團隊常用一組檢核項目評估資料是否可靠。給定每個檢核項目的布林結果，請計算通過比例並轉成百分比分數。這個分數可以快速提醒資料是否適合直接進入建模，或需要更多清理工作。",
    statementEn:
      "Before preprocessing, teams often evaluate data reliability through a set of checks. Given boolean results for each check, compute the pass ratio as a percentage score. This score quickly indicates whether the data can move toward modeling or needs more cleaning.",
    inputFormat: "checks: dict[str,bool]。",
    inputFormatEn: "checks: dict[str,bool].",
    outputFormat: "number，0 到 100，四捨五入到 2 位小數。",
    outputFormatEn: "number from 0 to 100, rounded to 2 decimals.",
    constraintsText: "空 dict 回傳 0。\n只有值為 True 的項目算通過。\nFalse、None 或其他值都不算通過。",
    constraintsTextEn: "An empty dict returns 0.\nOnly values exactly equal to True pass.\nFalse, None, and other values do not pass.",
    tests: [
      publicCase("Sample 1", [{ accuracy: true, completeness: false, consistency: true }], 66.67, "number"),
      publicCase("Sample 2", [{}], 0, "number"),
      hiddenCase("Hidden 1", [{ a: true, b: true, c: true, d: false }], 75, "number")
    ]
  },
  {
    week: 4,
    index: 2,
    name: "standardize-categories",
    title: "標準化類別標籤",
    titleEn: "Standardize Category Labels",
    difficulty: 1,
    category: "資料清理",
    categoryEn: "Data Cleaning",
    functionName: "standardize_categories",
    signature: ["values"],
    statement:
      "類別資料常因大小寫、空白或輸入習慣不同而產生多種寫法。請將一串類別值標準化：去除前後空白、轉小寫，並把中間連續空白改成單一底線。缺漏值則回傳 missing。這能降低同義類別被模型誤認成不同類別的風險。",
    statementEn:
      "Categorical data often contains multiple spellings caused by capitalization, whitespace, or input habits. Standardize category values by trimming surrounding whitespace, converting to lowercase, and replacing internal whitespace runs with a single underscore. Missing values should become missing. This reduces the risk that equivalent categories are treated as different by a model.",
    inputFormat: "values: list，可能包含 str、None 或其他值。",
    inputFormatEn: "values: list, possibly containing str, None, or other values.",
    outputFormat: "list[str]，與 values 長度相同。",
    outputFormatEn: "list[str] with the same length as values.",
    constraintsText: "None 與空字串標準化後為 missing。\n非字串值先用 str(value) 轉換。\n中間連續空白使用單一底線。",
    constraintsTextEn: "None and empty strings become missing.\nNon-string values are first converted with str(value).\nInternal whitespace runs become a single underscore.",
    tests: [
      publicCase("Sample 1", [[" Taipei ", "New  York", null, ""]], ["taipei", "new_york", "missing", "missing"]),
      publicCase("Sample 2", [["A", " a "]], ["a", "a"]),
      hiddenCase("Hidden 1", [[101, "  North   Area  "]], ["101", "north_area"])
    ]
  },
  {
    week: 4,
    index: 3,
    name: "impute-numeric-mean",
    title: "以平均值補齊數值欄位",
    titleEn: "Impute Numeric Mean",
    difficulty: 2,
    category: "缺漏值處理",
    categoryEn: "Missing Value Handling",
    functionName: "impute_numeric_mean",
    signature: ["records", "column"],
    statement:
      "數值欄位若有缺漏，常見做法之一是以有效值平均補齊。請針對指定欄位找出所有可轉成數字的有效值，計算平均值，然後回傳補值後的新資料列。缺漏值包含欄位不存在、None 與空字串。請保留其他欄位不變，並避免修改原始輸入。",
    statementEn:
      "When a numeric field has missing values, a common approach is mean imputation. For a specified column, find all valid values that can be converted to numbers, compute their mean, and return new rows with missing values filled. Missing values include absent keys, None, and empty strings. Preserve other fields and avoid mutating the original input.",
    inputFormat: "records: list[dict]；column: str。",
    inputFormatEn: "records: list[dict]; column: str.",
    outputFormat: "list[dict]，補值後的新資料。",
    outputFormatEn: "list[dict], the imputed new records.",
    constraintsText: "平均值四捨五入到 4 位小數。\n若沒有任何有效數值，平均值使用 0。\n原本有效的數值也要轉成 number。",
    constraintsTextEn: "Round the mean to 4 decimals.\nIf no valid numeric value exists, use 0.\nExisting valid values should also be converted to numbers.",
    tests: [
      publicCase("Sample 1", [[{ score: 10 }, { score: null }, { score: 20 }], "score"], [{ score: 10 }, { score: 15 }, { score: 20 }], "deepNumber"),
      publicCase("Sample 2", [[{ x: "" }, {}], "x"], [{ x: 0 }, { x: 0 }], "deepNumber"),
      hiddenCase("Hidden 1", [[{ v: "1.5" }, { v: 2 }, { name: "a" }], "v"], [{ v: 1.5 }, { v: 2 }, { name: "a", v: 1.75 }], "deepNumber")
    ]
  },
  {
    week: 4,
    index: 4,
    name: "merge-records",
    title: "依鍵值整合兩份資料表",
    titleEn: "Merge Two Tables by Key",
    difficulty: 2,
    category: "資料整合",
    categoryEn: "Data Integration",
    functionName: "merge_records",
    signature: ["left", "right", "key"],
    statement:
      "資料整合常需要把不同來源的資料依共同鍵值合併。給定 left 與 right 兩份 list[dict]，請建立 inner join：只有在兩邊都有相同 key 值的資料列才輸出。輸出順序依 left 原始順序；若 right 內同一鍵值有多筆，只使用第一筆。合併時 right 欄位可補上 left 沒有的資訊。",
    statementEn:
      "Data integration often joins data from multiple sources by a common key. Given left and right as list[dict], perform an inner join: output only rows whose key value appears in both sides. Preserve the original left order; if right contains duplicate keys, use the first matching row. During merging, right-side fields may add information absent from left.",
    inputFormat: "left、right: list[dict]；key: str。",
    inputFormatEn: "left and right: list[dict]; key: str.",
    outputFormat: "list[dict]，合併後的資料列。",
    outputFormatEn: "list[dict], merged rows.",
    constraintsText: "缺漏 key 的資料列不參與合併。\n若同名欄位衝突，left 的值優先保留。\n不要修改輸入資料。",
    constraintsTextEn: "Rows missing the key do not participate.\nIf fields conflict, keep the left value.\nDo not mutate the input.",
    tests: [
      publicCase(
        "Sample 1",
        [[{ id: 1, age: 20 }, { id: 2, age: 30 }], [{ id: 2, city: "TPE" }, { id: 1, city: "KHH" }], "id"],
        [{ id: 1, city: "KHH", age: 20 }, { id: 2, city: "TPE", age: 30 }]
      ),
      publicCase("Sample 2", [[{ id: 1 }], [{ id: 2 }], "id"], []),
      hiddenCase("Hidden 1", [[{ k: "A", x: 1 }, { x: 2 }], [{ k: "A", y: 3 }, { k: "A", y: 9 }], "k"], [{ k: "A", y: 3, x: 1 }])
    ]
  },
  {
    week: 4,
    index: 5,
    name: "preprocess-table",
    title: "完成建模前處理表格",
    titleEn: "Preprocess a Table for Modeling",
    difficulty: 3,
    category: "資料轉換",
    categoryEn: "Data Transformation",
    functionName: "preprocess_table",
    signature: ["records", "numeric_columns", "categorical_columns"],
    statement:
      "建模前的資料前處理常需要同時處理數值缺漏與類別編碼。請回傳一份新資料：數值欄位以該欄有效平均補值，類別欄位先標準化為小寫並去除前後空白，再依該欄所有標準化類別的字母順序編成 0、1、2。輸出還要包含每個數值欄位的平均與每個類別欄位的編碼表。",
    statementEn:
      "Preprocessing before modeling often handles numeric missing values and categorical encoding at the same time. Return new records where numeric fields are imputed with the column mean, and categorical fields are trimmed, lowercased, then encoded as 0, 1, 2 according to alphabetical order of standardized categories. Also return numeric means and categorical encoding maps.",
    inputFormat: "records: list[dict]；numeric_columns、categorical_columns: list[str]。",
    inputFormatEn: "records: list[dict]; numeric_columns and categorical_columns: list[str].",
    outputFormat: "dict，包含 rows、numericMeans、categoryMaps。",
    outputFormatEn: "dict containing rows, numericMeans, and categoryMaps.",
    constraintsText:
      "數值缺漏包含欄位不存在、None、空字串與無法轉成 float 的值；沒有有效值時平均為 0。\n類別缺漏轉成 missing。\n平均與補值結果四捨五入到 4 位小數。",
    constraintsTextEn:
      "Numeric missing includes absent keys, None, empty strings, and values that cannot convert to float; if no valid values exist, the mean is 0.\nCategorical missing becomes missing.\nRound means and imputed values to 4 decimals.",
    tests: [
      publicCase(
        "Sample 1",
        [[{ age: 20, city: " Taipei " }, { age: null, city: "kaohsiung" }, { age: 30, city: "Taipei" }], ["age"], ["city"]],
        {
          rows: [{ age: 20, city: 1 }, { age: 25, city: 0 }, { age: 30, city: 1 }],
          numericMeans: { age: 25 },
          categoryMaps: { city: { kaohsiung: 0, taipei: 1 } }
        },
        "deepNumber"
      ),
      publicCase("Sample 2", [[], ["x"], ["c"]], { rows: [], numericMeans: { x: 0 }, categoryMaps: { c: {} } }, "deepNumber"),
      hiddenCase(
        "Hidden 1",
        [[{ x: "1", c: "" }, { x: "3", c: "B" }, { c: "A" }], ["x"], ["c"]],
        {
          rows: [{ x: 1, c: 2 }, { x: 3, c: 1 }, { x: 2, c: 0 }],
          numericMeans: { x: 2 },
          categoryMaps: { c: { a: 0, b: 1, missing: 2 } }
        },
        "deepNumber"
      )
    ]
  },
  {
    week: 5,
    index: 1,
    name: "systematic-sample",
    title: "產生系統抽樣結果",
    titleEn: "Create a Systematic Sample",
    difficulty: 1,
    category: "資料抽樣",
    categoryEn: "Data Sampling",
    functionName: "systematic_sample",
    signature: ["values", "step"],
    statement:
      "當資料量很大時，分析者可能先用抽樣取得可快速探索的子集合。請實作最簡單的系統抽樣：從索引 0 開始，每隔 step 筆取一筆資料。這能讓學生理解資料精簡如何保留一部分資料供快速檢查。",
    statementEn:
      "When a dataset is large, analysts may first sample a subset for quick exploration. Implement a simple systematic sample: start at index 0 and take one value every step items. This helps students understand how data reduction keeps part of the data for faster inspection.",
    inputFormat: "values: list；step: positive int。",
    inputFormatEn: "values: list; step: positive int.",
    outputFormat: "list，抽樣後的 values。",
    outputFormatEn: "list, the sampled values.",
    constraintsText: "step 一定大於 0。\n保留原始順序。\n空 values 回傳空 list。",
    constraintsTextEn: "step is always greater than 0.\nPreserve original order.\nEmpty values returns an empty list.",
    tests: [
      publicCase("Sample 1", [[10, 20, 30, 40, 50], 2], [10, 30, 50]),
      publicCase("Sample 2", [[], 3], []),
      hiddenCase("Hidden 1", [["a", "b", "c", "d"], 3], ["a", "d"])
    ]
  },
  {
    week: 5,
    index: 2,
    name: "hamming-distance",
    title: "計算類別向量差異",
    titleEn: "Compute Categorical Vector Difference",
    difficulty: 1,
    category: "相異度",
    categoryEn: "Dissimilarity",
    functionName: "hamming_distance",
    signature: ["a", "b"],
    statement:
      "在比較二元或類別特徵時，Hamming distance 可以計算兩個等長序列有多少位置不同。請回傳 a 與 b 在相同索引位置上不同的數量。這個概念會在特徵比較、資料去重與相似度學習中反覆出現。",
    statementEn:
      "When comparing binary or categorical features, Hamming distance counts how many positions differ between two equal-length sequences. Return the number of indexes where a and b are different. This concept appears repeatedly in feature comparison, deduplication, and similarity-based learning.",
    inputFormat: "a、b: list 或 str，長度相同。",
    inputFormatEn: "a and b: list or str with the same length.",
    outputFormat: "int，不同位置的數量。",
    outputFormatEn: "int, the number of differing positions.",
    constraintsText: "a 與 b 長度相同。\n使用 != 判斷位置是否不同。\n空序列距離為 0。",
    constraintsTextEn: "a and b have the same length.\nUse != to compare each position.\nThe distance of empty sequences is 0.",
    tests: [
      publicCase("Sample 1", ["10110", "10011"], 2),
      publicCase("Sample 2", [[1, 2, 3], [1, 0, 3]], 1),
      hiddenCase("Hidden 1", [[], []], 0)
    ]
  },
  {
    week: 5,
    index: 3,
    name: "variance-filter",
    title: "依變異數篩選特徵",
    titleEn: "Filter Features by Variance",
    difficulty: 2,
    category: "特徵選擇",
    categoryEn: "Feature Selection",
    functionName: "variance_filter",
    signature: ["table", "min_variance"],
    statement:
      "低變異特徵通常對模型區分資料的幫助較小，因此常作為特徵選擇的第一個篩選條件。給定欄位到數值列表的 table，請計算每個欄位的 population variance，回傳變異數大於或等於門檻的欄位名稱。",
    statementEn:
      "Low-variance features often provide little help in distinguishing records, so they are commonly removed as an initial feature selection step. Given a table mapping column names to numeric lists, compute population variance for each column and return names whose variance is at least the threshold.",
    inputFormat: "table: dict[str,list[number]]；min_variance: number。",
    inputFormatEn: "table: dict[str,list[number]]; min_variance: number.",
    outputFormat: "list[str]，依 table 原始欄位順序排列。",
    outputFormatEn: "list[str] in the original column order of table.",
    constraintsText: "population variance = sum((x-mean)^2) / n。\n空欄位變異數視為 0。\n保留原始欄位順序。",
    constraintsTextEn: "population variance = sum((x-mean)^2) / n.\nAn empty column has variance 0.\nPreserve original column order.",
    tests: [
      publicCase("Sample 1", [{ a: [1, 1, 1], b: [1, 2, 3], c: [5, 9] }, 1], ["b", "c"]),
      publicCase("Sample 2", [{ a: [] }, 0.1], []),
      hiddenCase("Hidden 1", [{ x: [2, 4], y: [7, 7, 7], z: [0, 10] }, 4], ["x", "z"])
    ]
  },
  {
    week: 5,
    index: 4,
    name: "min-components-for-variance",
    title: "選擇 PCA 保留成分數",
    titleEn: "Choose PCA Components by Variance",
    difficulty: 2,
    category: "降維",
    categoryEn: "Dimensionality Reduction",
    functionName: "min_components_for_variance",
    signature: ["variance_ratios", "target"],
    statement:
      "使用 PCA 降維時，常根據累積解釋變異比例決定要保留幾個主成分。請找出最少需要幾個成分，才能讓累積 variance ratio 達到 target。如果所有成分加總後仍未達標，回傳成分總數。",
    statementEn:
      "When using PCA for dimensionality reduction, the number of retained components is often chosen by cumulative explained variance. Find the minimum number of components needed for cumulative variance ratio to reach target. If even all components do not reach the target, return the total number of components.",
    inputFormat: "variance_ratios: list[number]；target: number。",
    inputFormatEn: "variance_ratios: list[number]; target: number.",
    outputFormat: "int，需要保留的最少成分數。",
    outputFormatEn: "int, the minimum number of components to retain.",
    constraintsText: "variance_ratios 已依成分順序排列。\ntarget 介於 0 與 1 之間。\n空 variance_ratios 回傳 0。",
    constraintsTextEn: "variance_ratios is already ordered by component.\ntarget is between 0 and 1.\nEmpty variance_ratios returns 0.",
    tests: [
      publicCase("Sample 1", [[0.5, 0.25, 0.15, 0.1], 0.8], 3),
      publicCase("Sample 2", [[0.6, 0.2], 0.6], 1),
      hiddenCase("Hidden 1", [[0.3, 0.3], 0.95], 2)
    ]
  },
  {
    week: 5,
    index: 5,
    name: "stratified-split-indices",
    title: "建立分層測試索引",
    titleEn: "Create Stratified Test Indices",
    difficulty: 3,
    category: "資料分割",
    categoryEn: "Data Partitioning",
    functionName: "stratified_split_indices",
    signature: ["labels", "test_every"],
    statement:
      "分類任務切分訓練集與測試集時，常希望每個類別都能出現在測試資料中。請根據 labels 進行簡化版分層切分：對每個類別分別計數，該類別中第 test_every、2*test_every、3*test_every ... 筆放入 test，其餘放入 train。回傳原始索引，且各列表需保持掃描原始資料的順序。",
    statementEn:
      "When splitting data for classification, we often want each class to appear in the test set. Perform a simplified stratified split using labels: count records separately for each class, and place the test_every-th, 2*test_every-th, 3*test_every-th, ... record of each class into test; the rest go to train. Return original indexes, preserving the scan order within each list.",
    inputFormat: "labels: list；test_every: positive int。",
    inputFormatEn: "labels: list; test_every: positive int.",
    outputFormat: "dict，格式為 {\"train\": list[int], \"test\": list[int]}。",
    outputFormatEn: "dict in the form {\"train\": list[int], \"test\": list[int]}.",
    constraintsText: "test_every 一定大於 0。\n類別值可為字串、數字或布林。\n索引從 0 開始。",
    constraintsTextEn: "test_every is always greater than 0.\nClass values may be strings, numbers, or booleans.\nIndexes are zero-based.",
    tests: [
      publicCase("Sample 1", [["A", "A", "B", "A", "B", "B"], 2], { train: [0, 2, 3, 5], test: [1, 4] }),
      publicCase("Sample 2", [["A", "B"], 1], { train: [], test: [0, 1] }),
      hiddenCase("Hidden 1", [["x", "y", "x", "x", "y"], 3], { train: [0, 1, 2, 4], test: [3] })
    ]
  },
  {
    week: 6,
    index: 1,
    name: "gini-impurity",
    title: "計算 Gini Impurity",
    titleEn: "Compute Gini Impurity",
    difficulty: 1,
    category: "決策樹",
    categoryEn: "Decision Trees",
    functionName: "gini_impurity",
    signature: ["labels"],
    statement:
      "決策樹在選擇切分點時常使用 impurity 衡量節點混雜程度。請根據一組類別標籤計算 Gini impurity，也就是 1 減去各類別比例平方和。結果四捨五入到 4 位小數。",
    statementEn:
      "Decision trees often use impurity to measure how mixed a node is when choosing splits. Given a list of class labels, compute Gini impurity, defined as 1 minus the sum of squared class proportions. Round the result to 4 decimals.",
    inputFormat: "labels: list，類別標籤。",
    inputFormatEn: "labels: list of class labels.",
    outputFormat: "number，Gini impurity。",
    outputFormatEn: "number, the Gini impurity.",
    constraintsText: "空 labels 回傳 0。\n類別值可為字串、數字或布林。\n結果四捨五入到 4 位小數。",
    constraintsTextEn: "Empty labels returns 0.\nLabels may be strings, numbers, or booleans.\nRound the result to 4 decimals.",
    tests: [
      publicCase("Sample 1", [["A", "A", "B"]], 0.4444, "number"),
      publicCase("Sample 2", [["A", "A"]], 0, "number"),
      hiddenCase("Hidden 1", [["yes", "no", "no", "yes"]], 0.5, "number")
    ]
  },
  {
    week: 6,
    index: 2,
    name: "majority-label",
    title: "找出節點多數類別",
    titleEn: "Find Node Majority Label",
    difficulty: 1,
    category: "決策樹",
    categoryEn: "Decision Trees",
    functionName: "majority_label",
    signature: ["labels"],
    statement:
      "決策樹的葉節點通常以節點內最多的類別作為預測。請回傳 labels 中出現次數最多的標籤；若出現平手，回傳在原始 labels 中最早出現的那個標籤。這個規則能讓預測結果穩定且可重現。",
    statementEn:
      "A decision tree leaf usually predicts the most common class in the node. Return the label that appears most often in labels; when there is a tie, return the tied label that appears earliest in the original list. This rule makes predictions stable and reproducible.",
    inputFormat: "labels: list，至少一個類別標籤。",
    inputFormatEn: "labels: list containing at least one class label.",
    outputFormat: "任意型別，代表多數類別標籤。",
    outputFormatEn: "Any type, the majority class label.",
    constraintsText: "labels 不會是空列表。\n平手時依原始出現順序決定。\n不要排序 labels 來決定平手。",
    constraintsTextEn: "labels will not be empty.\nResolve ties by original appearance order.\nDo not sort labels to break ties.",
    tests: [
      publicCase("Sample 1", [["A", "B", "A"]], "A"),
      publicCase("Sample 2", [["B", "A"]], "B"),
      hiddenCase("Hidden 1", [[1, 2, 2, 1]], 1)
    ]
  },
  {
    week: 6,
    index: 3,
    name: "entropy",
    title: "計算分類熵",
    titleEn: "Compute Classification Entropy",
    difficulty: 2,
    category: "資訊理論",
    categoryEn: "Information Theory",
    functionName: "entropy",
    signature: ["labels"],
    statement:
      "資訊增益以 entropy 衡量節點的不確定性。請根據 labels 計算 -sum(p_i * log2(p_i))。若 labels 為空，entropy 視為 0。結果需四捨五入到 4 位小數，供後續切分評估使用。",
    statementEn:
      "Information gain uses entropy to measure uncertainty in a node. Given labels, compute -sum(p_i * log2(p_i)). If labels is empty, entropy is 0. Round the result to 4 decimals so it can be used for split evaluation.",
    inputFormat: "labels: list，類別標籤。",
    inputFormatEn: "labels: list of class labels.",
    outputFormat: "number，entropy。",
    outputFormatEn: "number, the entropy.",
    constraintsText: "可以使用 math.log2。\n空 labels 回傳 0。\n結果四捨五入到 4 位小數。",
    constraintsTextEn: "You may use math.log2.\nEmpty labels returns 0.\nRound the result to 4 decimals.",
    tests: [
      publicCase("Sample 1", [["yes", "yes", "no"]], 0.9183, "number"),
      publicCase("Sample 2", [["A", "A"]], 0, "number"),
      hiddenCase("Hidden 1", [["A", "B", "C", "D"]], 2, "number")
    ]
  },
  {
    week: 6,
    index: 4,
    name: "information-gain",
    title: "計算切分資訊增益",
    titleEn: "Compute Split Information Gain",
    difficulty: 2,
    category: "決策樹切分",
    categoryEn: "Decision Tree Splitting",
    functionName: "information_gain",
    signature: ["parent", "left", "right"],
    statement:
      "決策樹會比較不同切分帶來的不確定性下降。請根據父節點 labels 與左右子節點 labels 計算 information gain：父節點 entropy 減去左右子節點 entropy 的加權平均。這題需要先正確計算 entropy，再處理子節點大小的權重。",
    statementEn:
      "Decision trees compare how much uncertainty is reduced by different splits. Given parent labels and left/right child labels, compute information gain: parent entropy minus the weighted average entropy of the children. This problem requires correct entropy calculation and child-size weighting.",
    inputFormat: "parent、left、right: list，類別標籤。",
    inputFormatEn: "parent, left, and right: lists of class labels.",
    outputFormat: "number，information gain，四捨五入到 4 位小數。",
    outputFormatEn: "number, information gain rounded to 4 decimals.",
    constraintsText: "若 parent 為空，回傳 0。\n權重使用 len(child) / len(parent)。\n左右子節點可能為空，空節點 entropy 為 0。",
    constraintsTextEn: "If parent is empty, return 0.\nWeights use len(child) / len(parent).\nChildren may be empty, and an empty child has entropy 0.",
    tests: [
      publicCase("Sample 1", [["A", "A", "B", "B"], ["A", "A"], ["B", "B"]], 1, "number"),
      publicCase("Sample 2", [["A", "A", "B"], ["A"], ["A", "B"]], 0.2516, "number"),
      hiddenCase("Hidden 1", [[], [], []], 0, "number")
    ]
  },
  {
    week: 6,
    index: 5,
    name: "best-gini-threshold",
    title: "尋找最佳 Gini 切分點",
    titleEn: "Find the Best Gini Split Threshold",
    difficulty: 3,
    category: "決策樹切分",
    categoryEn: "Decision Tree Splitting",
    functionName: "best_gini_threshold",
    signature: ["rows", "feature", "label_key", "thresholds"],
    statement:
      "對連續特徵建立決策樹時，需要嘗試多個切分門檻。請針對每個 threshold 將資料分成 feature <= threshold 的 left 與 feature > threshold 的 right，計算左右節點的加權 Gini impurity，並回傳加權 Gini 最小的 threshold。若分數平手，選較小的 threshold。",
    statementEn:
      "When building a decision tree with a continuous feature, multiple split thresholds must be tested. For each threshold, split rows into left where feature <= threshold and right where feature > threshold. Compute weighted Gini impurity for the two children and return the threshold with the smallest weighted Gini. If scores tie, choose the smaller threshold.",
    inputFormat: "rows: list[dict]；feature、label_key: str；thresholds: list[number]。",
    inputFormatEn: "rows: list[dict]; feature and label_key: str; thresholds: list[number].",
    outputFormat: "number 或 None，代表最佳 threshold。",
    outputFormatEn: "number or None, the best threshold.",
    constraintsText: "thresholds 可能未排序。\n所有 rows 都有 feature 與 label_key。\n若 thresholds 為空，回傳 None。",
    constraintsTextEn: "thresholds may be unsorted.\nEvery row contains feature and label_key.\nIf thresholds is empty, return None.",
    tests: [
      publicCase("Sample 1", [[{ x: 1, y: "A" }, { x: 2, y: "A" }, { x: 3, y: "B" }, { x: 4, y: "B" }], "x", "y", [1.5, 2.5, 3.5]], 2.5),
      publicCase("Sample 2", [[{ x: 1, y: "A" }, { x: 2, y: "B" }], "x", "y", []], null),
      hiddenCase("Hidden 1", [[{ v: 1, label: "N" }, { v: 5, label: "Y" }, { v: 6, label: "Y" }, { v: 7, label: "N" }], "v", "label", [4, 6]], 4)
    ]
  },
  {
    week: 8,
    index: 1,
    name: "confusion-counts",
    title: "統計混淆矩陣四格",
    titleEn: "Count Confusion Matrix Cells",
    difficulty: 1,
    category: "模型評估",
    categoryEn: "Model Evaluation",
    functionName: "confusion_counts",
    signature: ["y_true", "y_pred", "positive_label"],
    statement:
      "分類模型評估常從混淆矩陣開始。給定真實標籤、預測標籤與正類標籤，請統計 TP、FP、TN、FN。這些計數是 precision、recall、F1 與許多商業指標的基礎。",
    statementEn:
      "Classification evaluation often starts with the confusion matrix. Given true labels, predicted labels, and the positive label, count TP, FP, TN, and FN. These counts are the foundation for precision, recall, F1, and many business metrics.",
    inputFormat: "y_true、y_pred: list，長度相同；positive_label: 任意值。",
    inputFormatEn: "y_true and y_pred: lists with the same length; positive_label: any value.",
    outputFormat: "dict，格式為 {\"tp\": int, \"fp\": int, \"tn\": int, \"fn\": int}。",
    outputFormatEn: "dict in the form {\"tp\": int, \"fp\": int, \"tn\": int, \"fn\": int}.",
    constraintsText: "正類定義為值等於 positive_label。\n其他所有值都視為負類。\n空列表四格皆為 0。",
    constraintsTextEn: "The positive class is equality with positive_label.\nAll other values are negative.\nEmpty lists return all zero counts.",
    tests: [
      publicCase("Sample 1", [[1, 0, 1, 0], [1, 1, 0, 0], 1], { tp: 1, fp: 1, tn: 1, fn: 1 }),
      publicCase("Sample 2", [[], [], "Y"], { tp: 0, fp: 0, tn: 0, fn: 0 }),
      hiddenCase("Hidden 1", [["Y", "N", "N"], ["Y", "Y", "N"], "Y"], { tp: 1, fp: 1, tn: 1, fn: 0 })
    ]
  },
  {
    week: 8,
    index: 2,
    name: "majority-vote",
    title: "整合多模型投票",
    titleEn: "Combine Model Votes",
    difficulty: 1,
    category: "Ensemble",
    categoryEn: "Ensemble",
    functionName: "majority_vote",
    signature: ["predictions"],
    statement:
      "Ensemble 方法常透過多個模型的投票產生最終分類。請回傳 predictions 中票數最多的類別；若平手，回傳最早在 predictions 中出現的平手類別。這個規則讓投票結果可重現，也容易檢查。",
    statementEn:
      "Ensemble methods often produce a final classification by voting across multiple models. Return the class with the most votes in predictions; if there is a tie, return the tied class that appears earliest in predictions. This rule makes voting reproducible and easy to verify.",
    inputFormat: "predictions: list，至少一個模型預測。",
    inputFormatEn: "predictions: list containing at least one model prediction.",
    outputFormat: "任意型別，代表最終預測類別。",
    outputFormatEn: "Any type, the final predicted class.",
    constraintsText: "predictions 不會是空列表。\n平手依原始出現順序處理。\n不要排序 predictions 來決定平手。",
    constraintsTextEn: "predictions will not be empty.\nResolve ties by original appearance order.\nDo not sort predictions to break ties.",
    tests: [
      publicCase("Sample 1", [["A", "B", "A"]], "A"),
      publicCase("Sample 2", [["B", "A"]], "B"),
      hiddenCase("Hidden 1", [[0, 1, 1, 0]], 0)
    ]
  },
  {
    week: 8,
    index: 3,
    name: "precision-recall-f1",
    title: "計算 Precision、Recall 與 F1",
    titleEn: "Compute Precision, Recall, and F1",
    difficulty: 2,
    category: "模型評估",
    categoryEn: "Model Evaluation",
    functionName: "precision_recall_f1",
    signature: ["y_true", "y_pred", "positive_label"],
    statement:
      "僅看 accuracy 可能無法反映正類預測品質，尤其在類別不平衡資料中。請根據 y_true、y_pred 與 positive_label 計算 precision、recall 與 F1。若分母為 0，該指標回傳 0。結果需四捨五入到 4 位小數。",
    statementEn:
      "Accuracy alone may not reflect positive-class prediction quality, especially for imbalanced data. Given y_true, y_pred, and positive_label, compute precision, recall, and F1. If a denominator is 0, return 0 for that metric. Round results to 4 decimals.",
    inputFormat: "y_true、y_pred: list，長度相同；positive_label: 任意值。",
    inputFormatEn: "y_true and y_pred: lists with the same length; positive_label: any value.",
    outputFormat: "dict，格式為 {\"precision\": number, \"recall\": number, \"f1\": number}。",
    outputFormatEn: "dict in the form {\"precision\": number, \"recall\": number, \"f1\": number}.",
    constraintsText: "precision = TP/(TP+FP)。\nrecall = TP/(TP+FN)。\nF1 = 2PR/(P+R)。",
    constraintsTextEn: "precision = TP/(TP+FP).\nrecall = TP/(TP+FN).\nF1 = 2PR/(P+R).",
    tests: [
      publicCase("Sample 1", [[1, 0, 1], [1, 1, 0], 1], { precision: 0.5, recall: 0.5, f1: 0.5 }, "deepNumber"),
      publicCase("Sample 2", [[0, 0], [1, 1], 1], { precision: 0, recall: 0, f1: 0 }, "deepNumber"),
      hiddenCase("Hidden 1", [["Y", "Y", "N"], ["Y", "N", "N"], "Y"], { precision: 1, recall: 0.5, f1: 0.6667 }, "deepNumber")
    ]
  },
  {
    week: 8,
    index: 4,
    name: "naive-bayes-label",
    title: "選擇 Naive Bayes 類別",
    titleEn: "Choose the Naive Bayes Class",
    difficulty: 2,
    category: "Bayes 分類",
    categoryEn: "Bayes Classification",
    functionName: "naive_bayes_label",
    signature: ["priors", "likelihoods"],
    statement:
      "Naive Bayes 會把先驗機率與各特徵條件機率相乘，得到每個類別的未正規化後驗分數。給定 priors 與 likelihoods，請計算每個類別的 prior * likelihood product，並回傳分數最高的類別。若分數平手，回傳字典序較小的類別名稱。",
    statementEn:
      "Naive Bayes multiplies the prior probability by feature likelihoods to obtain an unnormalized posterior score for each class. Given priors and likelihoods, compute prior * likelihood product for every class and return the class with the highest score. If scores tie, return the lexicographically smaller class name.",
    inputFormat: "priors: dict[str,number]；likelihoods: dict[str,list[number]]。",
    inputFormatEn: "priors: dict[str,number]; likelihoods: dict[str,list[number]].",
    outputFormat: "str，分數最高的類別名稱。",
    outputFormatEn: "str, the class name with the highest score.",
    constraintsText: "只需考慮 priors 中出現的類別。\n若某類別沒有 likelihoods，視為空列表。\n分數平手時使用字典序較小的類別。",
    constraintsTextEn: "Only consider classes present in priors.\nIf a class has no likelihood list, treat it as empty.\nBreak score ties by lexicographically smaller class name.",
    tests: [
      publicCase("Sample 1", [{ spam: 0.4, ham: 0.6 }, { spam: [0.8, 0.5], ham: [0.2, 0.9] }], "spam"),
      publicCase("Sample 2", [{ A: 0.5, B: 0.5 }, { A: [1], B: [1] }], "A"),
      hiddenCase("Hidden 1", [{ yes: 0.3, no: 0.7 }, { yes: [0.9, 0.9], no: [0.2, 0.2] }], "yes")
    ]
  },
  {
    week: 8,
    index: 5,
    name: "knn-predict",
    title: "實作 KNN 分類預測",
    titleEn: "Implement KNN Classification Prediction",
    difficulty: 3,
    category: "KNN",
    categoryEn: "KNN",
    functionName: "knn_predict",
    signature: ["points", "labels", "query", "k"],
    statement:
      "KNN 以距離衡量樣本相似度，並由最近的 k 個鄰居投票決定分類。請使用歐氏距離找出距離 query 最近的 k 個 points，距離相同時索引較小者較近。最終類別由 k 個鄰居多數決定；若票數平手，回傳在最近鄰居排序中較早出現的平手類別。",
    statementEn:
      "KNN measures similarity by distance and predicts a class through votes from the k nearest neighbors. Use Euclidean distance to find the k points closest to query; if distances tie, the smaller original index is nearer. The final class is the majority vote among the k neighbors; if votes tie, return the tied class that appears earlier in the sorted nearest-neighbor list.",
    inputFormat: "points: list[list[number]]；labels: list；query: list[number]；k: int。",
    inputFormatEn: "points: list[list[number]]; labels: list; query: list[number]; k: int.",
    outputFormat: "任意型別，代表預測類別。",
    outputFormatEn: "Any type, the predicted class.",
    constraintsText: "points 與 labels 長度相同。\nk 大於 0 且不超過 points 長度。\n所有點與 query 維度相同。",
    constraintsTextEn: "points and labels have the same length.\nk is greater than 0 and no larger than the number of points.\nAll points and query have the same dimension.",
    tests: [
      publicCase("Sample 1", [[[0, 0], [2, 0], [0, 2]], ["A", "B", "A"], [0, 1], 3], "A"),
      publicCase("Sample 2", [[[0], [2], [3]], ["L", "R", "R"], [1.9], 1], "R"),
      hiddenCase("Hidden 1", [[[0, 0], [1, 0], [0, 1], [5, 5]], ["A", "B", "B", "C"], [0, 0], 3], "B")
    ]
  },
  {
    week: 9,
    index: 1,
    name: "relu-values",
    title: "套用 ReLU 活化函數",
    titleEn: "Apply ReLU Activation",
    difficulty: 1,
    category: "ANN",
    categoryEn: "ANN",
    functionName: "relu_values",
    signature: ["values"],
    statement:
      "人工神經網路常使用 activation function 讓模型能表示非線性關係。ReLU 是常見且簡單的活化函數，會把負值變成 0，非負值維持不變。請對一串數值逐一套用 ReLU。",
    statementEn:
      "Artificial neural networks use activation functions to represent nonlinear relationships. ReLU is a common and simple activation function that turns negative values into 0 and keeps non-negative values unchanged. Apply ReLU to each value in a list.",
    inputFormat: "values: list[number]。",
    inputFormatEn: "values: list[number].",
    outputFormat: "list[number]，套用 ReLU 後的結果。",
    outputFormatEn: "list[number], the values after ReLU.",
    constraintsText: "ReLU(x) = max(0, x)。\n保留原始順序。\n空列表回傳空列表。",
    constraintsTextEn: "ReLU(x) = max(0, x).\nPreserve original order.\nEmpty list returns an empty list.",
    tests: [
      publicCase("Sample 1", [[-2, 0, 3]], [0, 0, 3]),
      publicCase("Sample 2", [[]], []),
      hiddenCase("Hidden 1", [[1.5, -0.2]], [1.5, 0], "deepNumber")
    ]
  },
  {
    week: 9,
    index: 2,
    name: "mse-loss",
    title: "計算平均平方誤差",
    titleEn: "Compute Mean Squared Error",
    difficulty: 1,
    category: "模型訓練",
    categoryEn: "Model Training",
    functionName: "mse_loss",
    signature: ["y_true", "y_pred"],
    statement:
      "模型訓練需要 loss function 衡量預測與真實值之間的差距。請計算 mean squared error，也就是每筆誤差平方的平均。MSE 常用於迴歸與神經網路訓練。",
    statementEn:
      "Model training needs a loss function to measure the gap between predictions and true values. Compute mean squared error, the average of squared errors. MSE is commonly used in regression and neural network training.",
    inputFormat: "y_true、y_pred: list[number]，長度相同。",
    inputFormatEn: "y_true and y_pred: list[number] with the same length.",
    outputFormat: "number，MSE，四捨五入到 4 位小數。",
    outputFormatEn: "number, MSE rounded to 4 decimals.",
    constraintsText: "若輸入長度為 0，回傳 0。\n誤差定義為 y_pred - y_true。\n結果四捨五入到 4 位小數。",
    constraintsTextEn: "If the input length is 0, return 0.\nError is y_pred - y_true.\nRound the result to 4 decimals.",
    tests: [
      publicCase("Sample 1", [[1, 2, 3], [1, 2, 5]], 1.3333, "number"),
      publicCase("Sample 2", [[], []], 0, "number"),
      hiddenCase("Hidden 1", [[2, 4], [1, 7]], 5, "number")
    ]
  },
  {
    week: 9,
    index: 3,
    name: "sigmoid-round",
    title: "計算 Sigmoid 輸出",
    titleEn: "Compute Sigmoid Outputs",
    difficulty: 2,
    category: "ANN",
    categoryEn: "ANN",
    functionName: "sigmoid_round",
    signature: ["values"],
    statement:
      "Sigmoid 可把任意實數轉換到 0 到 1 之間，常出現在二元分類輸出層或機率解讀中。請對每個輸入值計算 1 / (1 + exp(-x))，並將結果四捨五入到 4 位小數。",
    statementEn:
      "Sigmoid maps any real number into the range from 0 to 1, commonly used in binary classification output layers or probability interpretation. For each input x, compute 1 / (1 + exp(-x)) and round the result to 4 decimals.",
    inputFormat: "values: list[number]。",
    inputFormatEn: "values: list[number].",
    outputFormat: "list[number]，Sigmoid 結果。",
    outputFormatEn: "list[number], sigmoid results.",
    constraintsText: "可以使用 math.exp。\n結果四捨五入到 4 位小數。\n保留原始順序。",
    constraintsTextEn: "You may use math.exp.\nRound results to 4 decimals.\nPreserve original order.",
    tests: [
      publicCase("Sample 1", [[0]], [0.5], "deepNumber"),
      publicCase("Sample 2", [[1, -1]], [0.7311, 0.2689], "deepNumber"),
      hiddenCase("Hidden 1", [[2]], [0.8808], "deepNumber")
    ]
  },
  {
    week: 9,
    index: 4,
    name: "top-shap-features",
    title: "依 SHAP 重要度排序特徵",
    titleEn: "Rank Features by SHAP Importance",
    difficulty: 2,
    category: "模型可解釋性",
    categoryEn: "Model Explainability",
    functionName: "top_shap_features",
    signature: ["shap_values", "k"],
    statement:
      "模型可解釋性常需要指出哪些特徵對預測影響最大。給定每個特徵的 SHAP value，請依絕對值由大到小選出前 k 個特徵名稱。若絕對值相同，依特徵名稱字典序由小到大排序。",
    statementEn:
      "Model explainability often asks which features have the largest impact on a prediction. Given SHAP values for features, select the top k feature names by descending absolute value. If absolute values tie, sort tied feature names lexicographically.",
    inputFormat: "shap_values: dict[str,number]；k: int。",
    inputFormatEn: "shap_values: dict[str,number]; k: int.",
    outputFormat: "list[str]，前 k 個特徵名稱。",
    outputFormatEn: "list[str], the top k feature names.",
    constraintsText: "k 可能大於特徵數，此時回傳所有特徵。\n重要度使用 abs(value)。\n若 k <= 0，回傳空 list。",
    constraintsTextEn: "k may exceed the number of features, in which case return all features.\nImportance uses abs(value).\nIf k <= 0, return an empty list.",
    tests: [
      publicCase("Sample 1", [{ age: 0.2, income: -0.7, city: 0.1 }, 2], ["income", "age"]),
      publicCase("Sample 2", [{ b: -1, a: 1 }, 2], ["a", "b"]),
      hiddenCase("Hidden 1", [{ x: 0.01, y: -0.5, z: 0.3 }, 1], ["y"])
    ]
  },
  {
    week: 9,
    index: 5,
    name: "gradient-descent-step",
    title: "執行一次梯度下降更新",
    titleEn: "Run One Gradient Descent Update",
    difficulty: 3,
    category: "模型訓練",
    categoryEn: "Model Training",
    functionName: "gradient_descent_step",
    signature: ["x", "y", "w", "b", "learning_rate"],
    statement:
      "神經網路與線性模型訓練都仰賴梯度下降更新參數。這題使用最簡單的一維線性模型 y_hat = w*x + b 與 MSE loss。請根據目前參數計算 MSE 對 w 與 b 的梯度，執行一次更新，並回傳新的 w 與 b。",
    statementEn:
      "Training neural networks and linear models relies on gradient descent updates. This problem uses a simple one-dimensional linear model y_hat = w*x + b with MSE loss. Compute the gradients of MSE with respect to w and b, perform one update, and return the new w and b.",
    inputFormat: "x、y: list[number]，長度相同；w、b、learning_rate: number。",
    inputFormatEn: "x and y: list[number] with the same length; w, b, and learning_rate: number.",
    outputFormat: "dict，格式為 {\"w\": number, \"b\": number}，四捨五入到 4 位小數。",
    outputFormatEn: "dict in the form {\"w\": number, \"b\": number}, rounded to 4 decimals.",
    constraintsText:
      "prediction_i = w*x_i + b。\ndw = 2/n * sum((prediction_i - y_i) * x_i)。\ndb = 2/n * sum(prediction_i - y_i)。\nnew = old - learning_rate * gradient。",
    constraintsTextEn:
      "prediction_i = w*x_i + b.\ndw = 2/n * sum((prediction_i - y_i) * x_i).\ndb = 2/n * sum(prediction_i - y_i).\nnew = old - learning_rate * gradient.",
    tests: [
      publicCase("Sample 1", [[1, 2], [2, 4], 0, 0, 0.1], { w: 1, b: 0.6 }, "deepNumber"),
      publicCase("Sample 2", [[1], [1], 1, 0, 0.1], { w: 1, b: 0 }, "deepNumber"),
      hiddenCase("Hidden 1", [[0, 1], [1, 3], 1, 1, 0.1], { w: 1.1, b: 1.1 }, "deepNumber")
    ]
  },
  {
    week: 10,
    index: 1,
    name: "support-count",
    title: "計算項目集支持筆數",
    titleEn: "Count Itemset Support",
    difficulty: 1,
    category: "關聯規則",
    categoryEn: "Association Rules",
    functionName: "support_count",
    signature: ["transactions", "itemset"],
    statement:
      "關聯規則分析會先計算 itemset 在交易資料中出現的支持度。請計算有多少筆 transaction 同時包含 itemset 中所有項目。這是 Apriori 與 market basket analysis 的基本運算。",
    statementEn:
      "Association rule mining first computes how often an itemset appears in transaction data. Count how many transactions contain every item in itemset. This is a basic operation in Apriori and market basket analysis.",
    inputFormat: "transactions: list[list[str]]；itemset: list[str]。",
    inputFormatEn: "transactions: list[list[str]]; itemset: list[str].",
    outputFormat: "int，包含 itemset 的交易筆數。",
    outputFormatEn: "int, the number of transactions containing the itemset.",
    constraintsText: "交易中的重複項目不增加支持筆數。\n空 itemset 視為被所有交易包含。\n空 transactions 回傳 0。",
    constraintsTextEn: "Duplicate items inside one transaction do not increase support count.\nAn empty itemset is contained by every transaction.\nEmpty transactions returns 0.",
    tests: [
      publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"]], 2),
      publicCase("Sample 2", [[["A"], ["B"]], ["A", "B"]], 0),
      hiddenCase("Hidden 1", [[["milk", "bread"], ["milk", "bread", "egg"], ["bread"]], ["milk", "bread"]], 2)
    ]
  },
  {
    week: 10,
    index: 2,
    name: "support-ratio",
    title: "計算項目集支持度比例",
    titleEn: "Compute Itemset Support Ratio",
    difficulty: 1,
    category: "關聯規則",
    categoryEn: "Association Rules",
    functionName: "support_ratio",
    signature: ["transactions", "itemset"],
    statement:
      "除了支持筆數，關聯規則也常使用支持度比例來比較不同資料集中的 itemset。請計算包含 itemset 的交易筆數除以總交易筆數，並四捨五入到 4 位小數。若交易資料為空，支持度比例為 0。",
    statementEn:
      "Besides support count, association rules often use support ratio to compare itemsets across datasets. Compute the number of transactions containing itemset divided by the total number of transactions, rounded to 4 decimals. If there are no transactions, support ratio is 0.",
    inputFormat: "transactions: list[list[str]]；itemset: list[str]。",
    inputFormatEn: "transactions: list[list[str]]; itemset: list[str].",
    outputFormat: "number，支持度比例。",
    outputFormatEn: "number, the support ratio.",
    constraintsText: "結果四捨五入到 4 位小數。\n空 transactions 回傳 0。\n空 itemset 被所有交易包含。",
    constraintsTextEn: "Round the result to 4 decimals.\nEmpty transactions returns 0.\nAn empty itemset is contained by every transaction.",
    tests: [
      publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"]], 0.6667, "number"),
      publicCase("Sample 2", [[], ["A"]], 0, "number"),
      hiddenCase("Hidden 1", [[["A"], ["A", "B"], ["A", "B"], ["B"]], ["A", "B"]], 0.5, "number")
    ]
  },
  {
    week: 10,
    index: 3,
    name: "frequent-itemsets-1",
    title: "找出頻繁 1-項目集",
    titleEn: "Find Frequent 1-Itemsets",
    difficulty: 2,
    category: "Apriori",
    categoryEn: "Apriori",
    functionName: "frequent_itemsets_1",
    signature: ["transactions", "min_support_count"],
    statement:
      "Apriori 會先從單一項目開始找出頻繁 itemset，再逐步產生更大的候選集合。請統計每個項目出現在多少筆交易中，並回傳支持筆數大於或等於 min_support_count 的項目。單筆交易內的重複項目只算一次。",
    statementEn:
      "Apriori starts by finding frequent single-item itemsets, then generates larger candidates. Count how many transactions contain each item and return items whose support count is at least min_support_count. Duplicate items within one transaction count only once.",
    inputFormat: "transactions: list[list[str]]；min_support_count: int。",
    inputFormatEn: "transactions: list[list[str]]; min_support_count: int.",
    outputFormat: "dict[str,int]，key 依字母順序建立。",
    outputFormatEn: "dict[str,int], with keys in alphabetical order.",
    constraintsText: "單筆交易內同一項目只算一次。\n只回傳達到門檻的項目。\n若沒有頻繁項目，回傳空 dict。",
    constraintsTextEn: "An item counts at most once per transaction.\nReturn only items meeting the threshold.\nIf no item is frequent, return an empty dict.",
    tests: [
      publicCase("Sample 1", [[["B", "A"], ["A"], ["B", "B"]], 2], { A: 2, B: 2 }),
      publicCase("Sample 2", [[["A"], ["B"]], 2], {}),
      hiddenCase("Hidden 1", [[["milk", "bread"], ["milk"], ["bread"], ["milk", "bread"]], 3], { milk: 3 })
    ]
  },
  {
    week: 10,
    index: 4,
    name: "rule-confidence",
    title: "計算關聯規則信賴度",
    titleEn: "Compute Rule Confidence",
    difficulty: 2,
    category: "關聯規則",
    categoryEn: "Association Rules",
    functionName: "rule_confidence",
    signature: ["transactions", "antecedent", "consequent"],
    statement:
      "關聯規則 A -> B 的 confidence 表示包含 A 的交易中，有多少比例也包含 B。請計算 support(A union B) / support(A)，並將結果四捨五入到 4 位小數。若 support(A) 為 0，confidence 定義為 0。",
    statementEn:
      "The confidence of association rule A -> B is the proportion of transactions containing A that also contain B. Compute support(A union B) / support(A), rounded to 4 decimals. If support(A) is 0, confidence is defined as 0.",
    inputFormat: "transactions: list[list[str]]；antecedent、consequent: list[str]。",
    inputFormatEn: "transactions: list[list[str]]; antecedent and consequent: list[str].",
    outputFormat: "number，confidence。",
    outputFormatEn: "number, the confidence.",
    constraintsText: "結果四捨五入到 4 位小數。\n交易內重複項目不影響計算。\n若 antecedent 支持筆數為 0，回傳 0。",
    constraintsTextEn: "Round the result to 4 decimals.\nDuplicate items in a transaction do not affect the calculation.\nIf antecedent support count is 0, return 0.",
    tests: [
      publicCase("Sample 1", [[["A", "B"], ["A"], ["B"]], ["A"], ["B"]], 0.5, "number"),
      publicCase("Sample 2", [[["A"], ["B"]], ["C"], ["A"]], 0, "number"),
      hiddenCase("Hidden 1", [[["milk", "bread"], ["milk"], ["milk", "bread", "egg"]], ["milk"], ["bread"]], 0.6667, "number")
    ]
  },
  {
    week: 10,
    index: 5,
    name: "apriori-pairs",
    title: "產生頻繁 2-項目集",
    titleEn: "Generate Frequent 2-Itemsets",
    difficulty: 3,
    category: "Apriori",
    categoryEn: "Apriori",
    functionName: "apriori_pairs",
    signature: ["transactions", "min_support_count"],
    statement:
      "Apriori 會由頻繁 1-項目集產生候選 2-項目集，再計算其支持筆數。請找出所有在交易資料中支持筆數大於或等於 min_support_count 的 2-項目集。每個 pair 內項目需依字母順序排列，整體輸出也依 pair 的字典序排序。",
    statementEn:
      "Apriori generates candidate 2-itemsets from frequent 1-itemsets and then counts their support. Find all 2-itemsets whose support count is at least min_support_count. Items inside each pair must be sorted alphabetically, and the overall output must be sorted lexicographically by pair.",
    inputFormat: "transactions: list[list[str]]；min_support_count: int。",
    inputFormatEn: "transactions: list[list[str]]; min_support_count: int.",
    outputFormat: "list[list[str]]，頻繁 2-項目集。",
    outputFormatEn: "list[list[str]], the frequent 2-itemsets.",
    constraintsText: "單筆交易內重複項目只算一次。\n只考慮大小為 2 的項目集。\n沒有符合者回傳空 list。",
    constraintsTextEn: "Duplicate items inside one transaction count once.\nOnly itemsets of size 2 are considered.\nReturn an empty list if none qualify.",
    tests: [
      publicCase("Sample 1", [[["A", "B"], ["A", "C"], ["A", "B", "C"], ["B", "C"]], 2], [["A", "B"], ["A", "C"], ["B", "C"]]),
      publicCase("Sample 2", [[["A"], ["B"]], 1], []),
      hiddenCase("Hidden 1", [[["milk", "bread"], ["milk", "egg"], ["milk", "bread", "egg"], ["bread"]], 2], [["bread", "milk"], ["egg", "milk"]])
    ]
  },
  {
    week: 11,
    index: 1,
    name: "euclidean-distance",
    title: "計算歐氏距離",
    titleEn: "Compute Euclidean Distance",
    difficulty: 1,
    category: "距離度量",
    categoryEn: "Distance Metrics",
    functionName: "euclidean_distance",
    signature: ["a", "b"],
    statement:
      "許多相似度學習與分群演算法都依賴距離度量。請計算兩個等長數值向量的 Euclidean distance，也就是平方差總和開根號。結果四捨五入到 4 位小數。",
    statementEn:
      "Many similarity-based learning and clustering algorithms rely on distance metrics. Compute the Euclidean distance between two equal-length numeric vectors, the square root of the sum of squared differences. Round the result to 4 decimals.",
    inputFormat: "a、b: list[number]，長度相同。",
    inputFormatEn: "a and b: list[number] with the same length.",
    outputFormat: "number，歐氏距離。",
    outputFormatEn: "number, the Euclidean distance.",
    constraintsText: "a 與 b 長度相同。\n空向量距離為 0。\n結果四捨五入到 4 位小數。",
    constraintsTextEn: "a and b have the same length.\nEmpty vectors have distance 0.\nRound the result to 4 decimals.",
    tests: [
      publicCase("Sample 1", [[0, 0], [3, 4]], 5, "number"),
      publicCase("Sample 2", [[], []], 0, "number"),
      hiddenCase("Hidden 1", [[1, 2, 3], [1, 2, 5]], 2, "number")
    ]
  },
  {
    week: 11,
    index: 2,
    name: "manhattan-distance",
    title: "計算曼哈頓距離",
    titleEn: "Compute Manhattan Distance",
    difficulty: 1,
    category: "距離度量",
    categoryEn: "Distance Metrics",
    functionName: "manhattan_distance",
    signature: ["a", "b"],
    statement:
      "Manhattan distance 會加總各維度的絕對差，常用於網格型空間或希望降低平方放大效果的相似度計算。請計算兩個等長向量的曼哈頓距離。",
    statementEn:
      "Manhattan distance sums absolute differences across dimensions. It is often used in grid-like spaces or when avoiding the amplification caused by squared differences. Compute the Manhattan distance between two equal-length vectors.",
    inputFormat: "a、b: list[number]，長度相同。",
    inputFormatEn: "a and b: list[number] with the same length.",
    outputFormat: "number，曼哈頓距離。",
    outputFormatEn: "number, the Manhattan distance.",
    constraintsText: "a 與 b 長度相同。\n空向量距離為 0。\n使用各維度 abs(a_i - b_i) 的總和。",
    constraintsTextEn: "a and b have the same length.\nEmpty vectors have distance 0.\nUse the sum of abs(a_i - b_i) across dimensions.",
    tests: [
      publicCase("Sample 1", [[1, 2, 3], [2, 0, 7]], 7),
      publicCase("Sample 2", [[0, 0], [0, 0]], 0),
      hiddenCase("Hidden 1", [[-1, 5], [2, 1]], 7)
    ]
  },
  {
    week: 11,
    index: 3,
    name: "assign-nearest-centroids",
    title: "指派最近群中心",
    titleEn: "Assign Nearest Centroids",
    difficulty: 2,
    category: "分群",
    categoryEn: "Clustering",
    functionName: "assign_nearest_centroids",
    signature: ["points", "centroids"],
    statement:
      "K-means 的 assignment step 會把每個資料點指派給最近的 centroid。請對每個 point 計算它到所有 centroids 的平方歐氏距離，並回傳最近 centroid 的索引。若距離平手，選索引較小的 centroid。",
    statementEn:
      "The assignment step of K-means assigns each data point to its nearest centroid. For every point, compute the squared Euclidean distance to all centroids and return the index of the nearest centroid. If distances tie, choose the centroid with the smaller index.",
    inputFormat: "points: list[list[number]]；centroids: list[list[number]]。",
    inputFormatEn: "points: list[list[number]]; centroids: list[list[number]].",
    outputFormat: "list[int]，每個 point 對應的 centroid index。",
    outputFormatEn: "list[int], the centroid index assigned to each point.",
    constraintsText: "centroids 至少一個。\n所有點與 centroid 維度相同。\n使用平方歐氏距離即可，不必開根號。",
    constraintsTextEn: "There is at least one centroid.\nAll points and centroids have the same dimension.\nUse squared Euclidean distance; no square root is needed.",
    tests: [
      publicCase("Sample 1", [[[0, 0], [5, 5], [1, 0]], [[0, 0], [5, 5]]], [0, 1, 0]),
      publicCase("Sample 2", [[[2]], [[0], [4]]], [0]),
      hiddenCase("Hidden 1", [[[9, 9], [1, 1]], [[0, 0], [10, 10]]], [1, 0])
    ]
  },
  {
    week: 11,
    index: 4,
    name: "centroid",
    title: "計算群中心座標",
    titleEn: "Compute a Cluster Centroid",
    difficulty: 2,
    category: "分群",
    categoryEn: "Clustering",
    functionName: "centroid",
    signature: ["points"],
    statement:
      "K-means 的 update step 會把每個 cluster 的 centroid 更新為該群所有點的逐維平均。請根據一群點計算 centroid 座標。這個操作看似簡單，但必須正確處理任意維度的點。",
    statementEn:
      "The update step of K-means sets each cluster centroid to the per-dimension mean of all points in that cluster. Given a group of points, compute the centroid coordinates. The operation is simple but must correctly handle points with any dimension.",
    inputFormat: "points: list[list[number]]，至少一個點。",
    inputFormatEn: "points: list[list[number]], containing at least one point.",
    outputFormat: "list[number]，每個維度的平均，四捨五入到 4 位小數。",
    outputFormatEn: "list[number], per-dimension means rounded to 4 decimals.",
    constraintsText: "所有點維度相同。\n輸入至少一個點。\n結果依原始維度順序排列。",
    constraintsTextEn: "All points have the same dimension.\nThe input contains at least one point.\nReturn coordinates in the original dimension order.",
    tests: [
      publicCase("Sample 1", [[[0, 0], [2, 4]]], [1, 2], "deepNumber"),
      publicCase("Sample 2", [[[3, 5]]], [3, 5], "deepNumber"),
      hiddenCase("Hidden 1", [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], [4, 5, 6], "deepNumber")
    ]
  },
  {
    week: 11,
    index: 5,
    name: "kmeans-sse",
    title: "計算 K-means SSE",
    titleEn: "Compute K-means SSE",
    difficulty: 3,
    category: "分群評估",
    categoryEn: "Clustering Evaluation",
    functionName: "kmeans_sse",
    signature: ["points", "labels", "centroids"],
    statement:
      "K-means 常用 SSE，也就是每個點到其所屬 centroid 的平方距離總和，衡量群內緊密程度。給定資料點、每個點的 centroid index，以及 centroid 座標，請計算總 SSE。這可用來比較不同 k 或不同初始化結果。",
    statementEn:
      "K-means often uses SSE, the sum of squared distances from each point to its assigned centroid, to measure within-cluster compactness. Given data points, each point's centroid index, and centroid coordinates, compute total SSE. This can compare different k values or different initializations.",
    inputFormat: "points: list[list[number]]；labels: list[int]；centroids: list[list[number]]。",
    inputFormatEn: "points: list[list[number]]; labels: list[int]; centroids: list[list[number]].",
    outputFormat: "number，SSE，四捨五入到 4 位小數。",
    outputFormatEn: "number, SSE rounded to 4 decimals.",
    constraintsText: "points 與 labels 長度相同。\n每個 label 都是 centroids 的有效索引。\n使用平方歐氏距離，不需開根號。",
    constraintsTextEn: "points and labels have the same length.\nEvery label is a valid index into centroids.\nUse squared Euclidean distance; no square root is needed.",
    tests: [
      publicCase("Sample 1", [[[0, 0], [2, 0], [10, 0]], [0, 0, 1], [[1, 0], [10, 0]]], 2, "number"),
      publicCase("Sample 2", [[], [], [[0, 0]]], 0, "number"),
      hiddenCase("Hidden 1", [[[1, 1], [2, 2], [9, 9]], [0, 0, 1], [[1.5, 1.5], [8, 8]]], 2.5, "number")
    ]
  }
];
