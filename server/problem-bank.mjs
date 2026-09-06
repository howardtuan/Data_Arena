// DataArena 題庫 — 純 Python，對齊「114-2 資料探勘概論」課綱
// 共 64 題。注意：這裡的 week 欄位代表「主題單元序號 1–9」，與學期日曆週次無關，
// 因此不受放假跳週影響；學生看到某單元的時機由老師後台「開放/關閉」控制。
// 每個 problemSpecs 元素已含完整欄位與測資；buildProblemBank() 交給 db 匯入。

const weekTitles = {
  1: { zh: "資料探勘與知識發現、統計基礎", en: "Data Mining, KDD, and Statistics" },
  2: { zh: "EDA、視覺化、資料倉儲與 CRISP-DM", en: "EDA, Visualization, Data Warehouse, CRISP-DM" },
  3: { zh: "資料前處理一：清理與整合", en: "Data Preprocessing I: Cleaning & Integration" },
  4: { zh: "資料前處理二：轉換、精簡與特徵選擇", en: "Data Preprocessing II: Transformation & Feature Selection" },
  5: { zh: "分類一：決策樹", en: "Classification I: Decision Trees" },
  6: { zh: "分類二：Ensemble 與 Bayes", en: "Classification II: Ensemble & Bayes" },
  7: { zh: "分類三：類神經網路", en: "Classification III: Artificial Neural Networks" },
  8: { zh: "關聯規則：Apriori", en: "Association Rules: Apriori" },
  9: { zh: "相似度學習與分群", en: "Similarity-Based Learning & Clustering" },
  10: { zh: "pandas 練習", en: "pandas Practice" },
};

const problemSpecs = [
  {
    "week": 1,
    "index": 1,
    "name": "describe-stats",
    "title": "產生描述統計摘要",
    "titleEn": "Descriptive Statistics Summary",
    "difficulty": 1,
    "category": "描述統計",
    "categoryEn": "Descriptive Statistics",
    "functionName": "describe_stats",
    "signature": [
      "values"
    ],
    "statement": "給定數值 values，回傳 {\"n\",\"sum\",\"mean\",\"variance\",\"std\"}；variance 為樣本變異數（分母 n−1），std 為其開根號。\n\n【計算示範】\nvalues=[10,20]：n=2、sum=30、mean=15；variance=((10−15)²+(20−15)²)/(2−1)=50；std=√50≈7.0711。",
    "statementEn": "Return {n,sum,mean,variance,std}; variance is sample variance (n−1), std its sqrt.\n\nExample:\n[10,20]: mean 15, variance ((−5)²+5²)/1=50, std √50≈7.0711.",
    "inputFormat": "values: list[number]，至少 2 個。",
    "inputFormatEn": "values: list[number], ≥2.",
    "outputFormat": "dict：n、sum、mean、variance、std。",
    "outputFormatEn": "dict: n,sum,mean,variance,std.",
    "constraintsText": "至少 2 個數值。\nvariance 用 n−1。",
    "constraintsTextEn": "≥2 values.\nn−1 variance.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            2,
            4,
            4,
            4,
            5,
            5,
            7,
            9
          ]
        ],
        "expected": {
          "n": 8,
          "sum": 40,
          "mean": 5.0,
          "variance": 4.5714285714,
          "std": 2.1380899353
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            10,
            20
          ]
        ],
        "expected": {
          "n": 2,
          "sum": 30,
          "mean": 15.0,
          "variance": 50.0,
          "std": 7.0710678119
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            65,
            70,
            62,
            78,
            80,
            72
          ]
        ],
        "expected": {
          "n": 6,
          "sum": 427,
          "mean": 71.1666666667,
          "variance": 49.7666666667,
          "std": 7.0545493596
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 2,
    "name": "sum-of-squares",
    "title": "計算離差平方和",
    "titleEn": "Sum of Squared Deviations",
    "difficulty": 1,
    "category": "描述統計",
    "categoryEn": "Descriptive Statistics",
    "functionName": "sum_of_squares",
    "signature": [
      "values"
    ],
    "statement": "回傳每個值對平均數的離差平方和 SS = Σ(xᵢ − x̄)²。\n\n【計算示範】\nvalues=[1,2,3]：x̄=2；SS=(1−2)²+(2−2)²+(3−2)²=1+0+1=2。",
    "statementEn": "Return SS = Σ(xᵢ − x̄)².\n\nExample:\n[1,2,3]: mean 2, SS=1+0+1=2.",
    "inputFormat": "values: list[number]，至少 1 個。",
    "inputFormatEn": "values: list[number], ≥1.",
    "outputFormat": "number，離差平方和。",
    "outputFormatEn": "number.",
    "constraintsText": "至少 1 個數值。",
    "constraintsTextEn": "≥1 value.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ]
        ],
        "expected": 10.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            10,
            10,
            10
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            65,
            70,
            62,
            78,
            80,
            72
          ]
        ],
        "expected": 248.8333333333,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 3,
    "name": "sample-covariance",
    "title": "計算樣本共變異數",
    "titleEn": "Sample Covariance",
    "difficulty": 2,
    "category": "相關分析",
    "categoryEn": "Correlation Analysis",
    "functionName": "sample_covariance",
    "signature": [
      "x",
      "y"
    ],
    "statement": "回傳樣本共變異數 Sxy = Σ(xᵢ−x̄)(yᵢ−ȳ) / (n−1)。\n\n【計算示範】\nx=[1,2,3], y=[2,4,6]：x̄=2, ȳ=4；Σ=(−1)(−2)+0+（1)(2)=4；/(3−1)=2。",
    "statementEn": "Return sample covariance Sxy = Σ(xᵢ−x̄)(yᵢ−ȳ)/(n−1).\n\nExample:\nx=[1,2,3],y=[2,4,6]: Σ=4, /(2)=2.",
    "inputFormat": "x,y: list[number]，等長，≥2。",
    "inputFormatEn": "x,y equal length ≥2.",
    "outputFormat": "number。",
    "outputFormatEn": "number.",
    "constraintsText": "等長且≥2。\n分母 n−1。",
    "constraintsTextEn": "equal len ≥2, n−1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            5,
            7,
            6,
            8,
            1
          ],
          [
            6,
            12,
            14,
            13,
            15,
            6
          ]
        ],
        "expected": 10.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3
          ],
          [
            2,
            4,
            6
          ]
        ],
        "expected": 2.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            2,
            4,
            6,
            8
          ],
          [
            1,
            3,
            2,
            5
          ]
        ],
        "expected": 3.6666666667,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 4,
    "name": "pearson-correlation",
    "title": "計算皮爾森相關係數",
    "titleEn": "Pearson Correlation",
    "difficulty": 2,
    "category": "相關分析",
    "categoryEn": "Correlation Analysis",
    "functionName": "pearson_correlation",
    "signature": [
      "x",
      "y"
    ],
    "statement": "回傳皮爾森相關係數 r = Σ(xᵢ−x̄)(yᵢ−ȳ) / (√Σ(xᵢ−x̄)² · √Σ(yᵢ−ȳ)²)，範圍 −1~1。\n\n【計算示範】\nx=[1,2,3,4], y=[2,4,6,8]：完全正相關，r=1。",
    "statementEn": "Return Pearson r = Σ(xᵢ−x̄)(yᵢ−ȳ)/(√Σ(xᵢ−x̄)²·√Σ(yᵢ−ȳ)²).\n\nExample:\n[1,2,3,4]&[2,4,6,8]: r=1.",
    "inputFormat": "x,y: list[number]，等長，≥2。",
    "inputFormatEn": "x,y equal length ≥2.",
    "outputFormat": "number，r。",
    "outputFormatEn": "number r.",
    "constraintsText": "等長且≥2。\n分母非 0。",
    "constraintsTextEn": "equal len ≥2, nonzero denom.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            5,
            7,
            6,
            8,
            1
          ],
          [
            6,
            12,
            14,
            13,
            15,
            6
          ]
        ],
        "expected": 0.9587062361,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4
          ],
          [
            2,
            4,
            6,
            8
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            10,
            8,
            13,
            9,
            11
          ],
          [
            8,
            7,
            12,
            7,
            14
          ]
        ],
        "expected": 0.7856376071,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 5,
    "name": "two-sample-t",
    "title": "兩獨立樣本 t 檢定統計量",
    "titleEn": "Two-Sample t Statistic",
    "difficulty": 2,
    "category": "假設檢定",
    "categoryEn": "Hypothesis Testing",
    "functionName": "two_sample_t",
    "signature": [
      "a",
      "b"
    ],
    "statement": "回傳 t = (ā − b̄) / √(s²ₐ/nₐ + s²_b/n_b)，s² 為樣本變異數（n−1）。\n\n【計算示範】\na=[1,2,3,4], b=[3,4,5,6]：ā=2.5, b̄=4.5，s²ₐ=s²_b=1.6667；t=(−2)/√(1.6667/4+1.6667/4)=−2/0.9129≈−2.191。",
    "statementEn": "Return t = (ā−b̄)/√(s²ₐ/nₐ+s²_b/n_b), s² sample variance.\n\nExample:\na=[1,2,3,4],b=[3,4,5,6]: t≈−2.191.",
    "inputFormat": "a,b: list[number]，各≥2。",
    "inputFormatEn": "a,b list[number] ≥2 each.",
    "outputFormat": "number，t。",
    "outputFormatEn": "number t.",
    "constraintsText": "各≥2。\n樣本變異數 n−1。",
    "constraintsTextEn": "≥2 each, n−1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            65,
            70,
            62,
            78,
            80,
            72
          ],
          [
            74,
            75,
            68,
            82,
            85,
            79
          ]
        ],
        "expected": -1.5744711649,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4
          ],
          [
            3,
            4,
            5,
            6
          ]
        ],
        "expected": -2.19089023,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            66,
            68,
            67,
            70,
            72,
            65
          ],
          [
            74,
            75,
            68,
            82,
            85,
            79
          ]
        ],
        "expected": -3.3786231426,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 6,
    "name": "one-sample-z",
    "title": "單樣本 z 檢定統計量",
    "titleEn": "One-Sample z Statistic",
    "difficulty": 2,
    "category": "假設檢定",
    "categoryEn": "Hypothesis Testing",
    "functionName": "one_sample_z",
    "signature": [
      "sample_mean",
      "mu",
      "sigma",
      "n"
    ],
    "statement": "母體標準差已知，回傳 z = (x̄ − μ) / (σ / √n)。\n\n【計算示範】\nx̄=497, μ=500, σ=10, n=36：z=(497−500)/(10/6)=−3/1.6667=−1.8。",
    "statementEn": "Return z = (x̄−μ)/(σ/√n).\n\nExample:\n497,500,10,36\n→ z=−1.8.",
    "inputFormat": "sample_mean,mu,sigma: number；n: int>0。",
    "inputFormatEn": "means number; n>0.",
    "outputFormat": "number，z。",
    "outputFormatEn": "number z.",
    "constraintsText": "sigma>0，n>0。",
    "constraintsTextEn": "sigma>0,n>0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          497,
          500,
          10,
          36
        ],
        "expected": -1.8,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          52,
          50,
          4,
          16
        ],
        "expected": 2.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          118,
          120,
          6,
          9
        ],
        "expected": -1.0,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 7,
    "name": "chi-square-independence",
    "title": "卡方獨立性檢定",
    "titleEn": "Chi-square Test of Independence",
    "difficulty": 3,
    "category": "假設檢定",
    "categoryEn": "Hypothesis Testing",
    "functionName": "chi_square_independence",
    "signature": [
      "table"
    ],
    "statement": "給定列聯表 table（table[i][j] 為觀察次數），期望值 E=(列總和×行總和)/總數，回傳 {\"chi_square\": Σ(O−E)²/E, \"df\": (列數−1)×(行數−1)}。\n\n【計算示範】\ntable=[[10,20],[20,40]]：每格期望值恰等於觀察值，故 Σ(O−E)²/E=0，df=(2−1)(2−1)=1。",
    "statementEn": "Contingency table; E=(row total×col total)/grand total. Return {chi_square: Σ(O−E)²/E, df:(rows−1)(cols−1)}.\n\nExample:\n[[10,20],[20,40]]: expected equals observed, chi=0, df=1.",
    "inputFormat": "table: list[list[int]]，≥2×2。",
    "inputFormatEn": "table: list[list[int]], ≥2×2.",
    "outputFormat": "dict：chi_square、df。",
    "outputFormatEn": "dict: chi_square, df.",
    "constraintsText": "矩形，≥2×2。\n期望值>0。",
    "constraintsTextEn": "rectangular ≥2×2, E>0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              40,
              60,
              68
            ],
            [
              70,
              90,
              88
            ],
            [
              57,
              63,
              64
            ]
          ]
        ],
        "expected": {
          "chi_square": 2.7107442296,
          "df": 4
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              10,
              20
            ],
            [
              20,
              40
            ]
          ]
        ],
        "expected": {
          "chi_square": 0.0,
          "df": 1
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              30,
              10
            ],
            [
              15,
              45
            ]
          ]
        ],
        "expected": {
          "chi_square": 24.2424242424,
          "df": 1
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 1,
    "index": 8,
    "name": "anova-f",
    "title": "單因子變異數分析 F 值",
    "titleEn": "One-way ANOVA F",
    "difficulty": 3,
    "category": "假設檢定",
    "categoryEn": "Hypothesis Testing",
    "functionName": "one_way_anova_f",
    "signature": [
      "groups"
    ],
    "statement": "計算組間平方和 SS_A=Σnᵢ(x̄ᵢ−x̄)²、組內平方和 SS_E=ΣΣ(x−x̄ᵢ)²，MS_A=SS_A/(k−1)、MS_E=SS_E/(N−k)，回傳 F=MS_A/MS_E（k 組數、N 總數）。\n\n【計算示範】\ngroups=[[1,2,3],[4,5,6]]：整體均3.5，SS_A=3(2−3.5)²+3(5−3.5)²=13.5，MS_A=13.5/1；SS_E=2+2=4，MS_E=4/4=1；F=13.5。",
    "statementEn": "SS_A=Σnᵢ(x̄ᵢ−x̄)², SS_E=ΣΣ(x−x̄ᵢ)², return F=(SS_A/(k−1))/(SS_E/(N−k)).\n\nExample:\n[[1,2,3],[4,5,6]]: F=13.5.",
    "inputFormat": "groups: list[list[number]]，≥2 組，每組≥2。",
    "inputFormatEn": "≥2 groups, ≥2 each.",
    "outputFormat": "number，F。",
    "outputFormatEn": "number F.",
    "constraintsText": "≥2 組，每組≥2，N>k。",
    "constraintsTextEn": "≥2 groups ≥2 each, N>k.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              65,
              70,
              62,
              78,
              80,
              72
            ],
            [
              74,
              75,
              68,
              82,
              85,
              79
            ],
            [
              66,
              68,
              67,
              70,
              72,
              65
            ]
          ]
        ],
        "expected": 4.1536550745,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              1,
              2,
              3
            ],
            [
              4,
              5,
              6
            ]
          ]
        ],
        "expected": 13.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              20,
              22,
              19,
              24
            ],
            [
              30,
              32,
              28,
              31
            ],
            [
              25,
              27,
              26,
              24
            ]
          ]
        ],
        "expected": 25.6052631579,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 2,
    "index": 1,
    "name": "histogram-counts",
    "title": "計算直方圖區間筆數",
    "titleEn": "Histogram Bin Counts",
    "difficulty": 1,
    "category": "視覺化資料準備",
    "categoryEn": "Visualization Prep",
    "functionName": "histogram_counts",
    "signature": [
      "values",
      "k"
    ],
    "statement": "把 values 依「等寬」切成 k 個區間，回傳每個區間的筆數。區間寬度 w=(max−min)/k，第 i 區間為 [min+iw, min+(i+1)w)，最後一個區間包含最大值。所有值相同時全部落在第 0 區間。\n\n【計算示範】\nvalues=[1,2,3,4,5,6], k=3：min1 max6 w=1.6667；區間約[1,2.67),[2.67,4.33),[4.33,6]；筆數=[2,2,2]。",
    "statementEn": "Equal-width histogram into k bins; return counts. Width=(max−min)/k, last bin inclusive.\n\nExample:\n[1..6],k=3\n→ [2,2,2].",
    "inputFormat": "values: list[number]≥1；k: int>0。",
    "inputFormatEn": "values list ≥1; k>0.",
    "outputFormat": "list[int]，長度 k。",
    "outputFormatEn": "list[int] length k.",
    "constraintsText": "k>0。\n最後一區間含最大值。",
    "constraintsTextEn": "k>0, last bin inclusive.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5,
            6
          ],
          3
        ],
        "expected": [
          2,
          2,
          2
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            5,
            5,
            5,
            5
          ],
          2
        ],
        "expected": [
          4,
          0
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            170,
            173,
            160,
            172,
            167,
            179,
            175,
            168
          ],
          4
        ],
        "expected": [
          1,
          2,
          3,
          2
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 2,
    "index": 2,
    "name": "correlation-matrix",
    "title": "建立相關係數矩陣",
    "titleEn": "Correlation Matrix",
    "difficulty": 2,
    "category": "相關分析",
    "categoryEn": "Correlation Analysis",
    "functionName": "correlation_matrix",
    "signature": [
      "columns"
    ],
    "statement": "給定多個等長欄位 columns（columns[i] 為第 i 欄的數值），回傳兩兩皮爾森相關係數矩陣 M，M[i][j] 為第 i 欄與第 j 欄的相關係數（heatmap 資料）。對角線為 1。\n\n【計算示範】\ncolumns=[[1,2,3],[2,4,6]]：兩欄完全正相關，矩陣=[[1,1],[1,1]]。",
    "statementEn": "Given equal-length columns, return the pairwise Pearson correlation matrix; diagonal is 1.\n\nExample:\n[[1,2,3],[2,4,6]]\n→ [[1,1],[1,1]].",
    "inputFormat": "columns: list[list[number]]，各欄等長且≥2。",
    "inputFormatEn": "columns: equal-length lists ≥2.",
    "outputFormat": "list[list[number]]，m×m 矩陣。",
    "outputFormatEn": "m×m matrix.",
    "constraintsText": "各欄等長≥2。\n每欄變異不為 0。",
    "constraintsTextEn": "equal len ≥2, nonzero var.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              1,
              2,
              3
            ],
            [
              2,
              4,
              6
            ]
          ]
        ],
        "expected": [
          [
            1.0,
            1.0
          ],
          [
            1.0,
            1.0
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              1,
              2,
              3,
              4
            ],
            [
              4,
              3,
              2,
              1
            ]
          ]
        ],
        "expected": [
          [
            1.0,
            -1.0
          ],
          [
            -1.0,
            1.0
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              2.1,
              -0.5,
              3.2,
              1.8
            ],
            [
              1.5,
              -0.8,
              2.7,
              1.3
            ],
            [
              0.8,
              1.2,
              -1.0,
              0.5
            ]
          ]
        ],
        "expected": [
          [
            1.0,
            0.9987089492,
            -0.8249006098
          ],
          [
            0.9987089492,
            1.0,
            -0.8523678647
          ],
          [
            -0.8249006098,
            -0.8523678647,
            1.0
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 2,
    "index": 3,
    "name": "data-cube-cells",
    "title": "計算資料方塊儲存格數",
    "titleEn": "Data Cube Cell Count",
    "difficulty": 1,
    "category": "資料倉儲",
    "categoryEn": "Data Warehouse",
    "functionName": "data_cube_cells",
    "signature": [
      "dimensions"
    ],
    "statement": "資料方塊(data cube)每個維度除了各自的基數外，還多一層「彙總(all)」。給定各維度基數清單 dimensions，回傳完整資料方塊的儲存格總數 = Π(基數+1)。\n\n【計算示範】\ndimensions=[3,4]：兩個維度各加一層 all\n→ (3+1)×(4+1)=20 格。",
    "statementEn": "Data cube cells = Π(cardinality+1) (each dimension adds an 'all' level).\n\nExample:\n[3,4]\n→ (3+1)(4+1)=20.",
    "inputFormat": "dimensions: list[int]，每個≥1。",
    "inputFormatEn": "dimensions: list[int]≥1.",
    "outputFormat": "int，儲存格總數。",
    "outputFormatEn": "int total cells.",
    "constraintsText": "每個維度基數≥1。",
    "constraintsTextEn": "each ≥1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            4
          ]
        ],
        "expected": 20,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            2,
            2,
            2
          ]
        ],
        "expected": 27,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            10,
            5,
            3,
            2
          ]
        ],
        "expected": 792,
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 2,
    "index": 4,
    "name": "olap-rollup",
    "title": "OLAP 依維度彙總",
    "titleEn": "OLAP Roll-up Aggregation",
    "difficulty": 2,
    "category": "資料倉儲",
    "categoryEn": "Data Warehouse",
    "functionName": "olap_rollup",
    "signature": [
      "records",
      "dimension",
      "measure"
    ],
    "statement": "OLAP 的 roll-up 會沿某維度把數值加總。給定 records（list[dict]）、維度欄名 dimension、量值欄名 measure，回傳字典 {該維度值: 該群 measure 總和}。\n\n【計算示範】\nrecords=[{'city':'A','sales':10},{'city':'B','sales':5},{'city':'A','sales':7}], dimension='city', measure='sales'：A=17, B=5\n→ {'A':17,'B':5}。",
    "statementEn": "Roll-up: group records by records[dimension], sum records[measure]; return {dim_value: sum}.\n\nExample:\nGroup by city, sum sales\n→ {'A':17,'B':5}.",
    "inputFormat": "records: list[dict]；dimension,measure: str。",
    "inputFormatEn": "records list[dict]; dimension,measure str.",
    "outputFormat": "dict，維度值→總和。",
    "outputFormatEn": "dict dim→sum.",
    "constraintsText": "每筆都有 dimension 與 measure 欄。\nmeasure 為數值。",
    "constraintsTextEn": "each record has both keys; measure numeric.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "city": "A",
              "sales": 10
            },
            {
              "city": "B",
              "sales": 5
            },
            {
              "city": "A",
              "sales": 7
            }
          ],
          "city",
          "sales"
        ],
        "expected": {
          "A": 17,
          "B": 5
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "q": "Q1",
              "amt": 100
            },
            {
              "q": "Q1",
              "amt": 50
            }
          ],
          "q",
          "amt"
        ],
        "expected": {
          "Q1": 150
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "cat": "X",
              "v": 3
            },
            {
              "cat": "Y",
              "v": 4
            },
            {
              "cat": "X",
              "v": 5
            },
            {
              "cat": "Y",
              "v": 6
            }
          ],
          "cat",
          "v"
        ],
        "expected": {
          "X": 8,
          "Y": 10
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 1,
    "name": "missing-value-report",
    "title": "統計欄位缺漏值",
    "titleEn": "Missing Value Report",
    "difficulty": 1,
    "category": "資料品質",
    "categoryEn": "Data Quality",
    "functionName": "missing_value_report",
    "signature": [
      "records",
      "columns"
    ],
    "statement": "建立缺漏值報告。給定 records（list[dict]）與要檢查的欄位 columns，若某列缺該欄、或值為 None、空字串、字串 \"NA\"，視為缺漏。回傳 {欄位: 缺漏筆數}。\n\n【計算示範】\nrecords=[{'age':20,'city':''},{'city':'TPE'}], columns=['age','city']：age 缺第2列=1；city 第1列為空=1\n→ {'age':1,'city':1}。",
    "statementEn": "Missing if key absent or value is None/\"\"/\"NA\". Return {column: missing count}.\n\nExample:\n→ {'age':1,'city':1}.",
    "inputFormat": "records: list[dict]；columns: list[str]。",
    "inputFormatEn": "records list[dict]; columns list[str].",
    "outputFormat": "dict[str,int]。",
    "outputFormatEn": "dict[str,int].",
    "constraintsText": "columns 中欄位即使沒出現也要回傳（值為 0 起算）。\n只有 None/\"\"/\"NA\"/缺鍵算缺漏。",
    "constraintsTextEn": "include all columns; only None/\"\"/\"NA\"/absent count.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "age": 20,
              "city": ""
            },
            {
              "city": "TPE"
            },
            {
              "age": null,
              "city": "KHH"
            }
          ],
          [
            "age",
            "city"
          ]
        ],
        "expected": {
          "age": 2,
          "city": 1
        },
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "x": "NA"
            },
            {
              "x": 1
            },
            {}
          ],
          [
            "x"
          ]
        ],
        "expected": {
          "x": 2
        },
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "a": 1,
              "b": "NA"
            },
            {
              "a": "",
              "b": 2
            },
            {
              "a": 3
            }
          ],
          [
            "a",
            "b",
            "c"
          ]
        ],
        "expected": {
          "a": 1,
          "b": 2,
          "c": 3
        },
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 2,
    "name": "equal-width-binning",
    "title": "等寬分箱",
    "titleEn": "Equal-Width Binning",
    "difficulty": 2,
    "category": "資料離散化",
    "categoryEn": "Discretization",
    "functionName": "equal_width_binning",
    "signature": [
      "values",
      "k"
    ],
    "statement": "先把 values 由小到大排序，再依「等寬」分成 k 箱（箱寬 w=(max−min)/k，最後一箱含最大值），回傳 k 個箱、每箱為排序後落入的數值清單。\n\n【計算示範】\nvalues=[3,6,12,17,21,22,29,29,42], k=3：min3 max42 w=13；[3,16)→[3,6,12]、[16,29)→[17,21,22]、[29,42]→[29,29,42]。",
    "statementEn": "Sort ascending, split into k equal-width bins (last inclusive); return list of k bins.\n\nExample:\n[3,6,12,17,21,22,29,29,42],k=3\n→ [[3,6,12],[17,21,22],[29,29,42]].",
    "inputFormat": "values: list[number]≥1；k: int>0。",
    "inputFormatEn": "values ≥1; k>0.",
    "outputFormat": "list[list[number]]，k 個箱。",
    "outputFormatEn": "list of k bins.",
    "constraintsText": "先排序再分箱。\n最後一箱含最大值。",
    "constraintsTextEn": "sort first; last bin inclusive.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            6,
            12,
            17,
            21,
            22,
            29,
            29,
            42
          ],
          3
        ],
        "expected": [
          [
            3,
            6,
            12
          ],
          [
            17,
            21,
            22
          ],
          [
            29,
            29,
            42
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4
          ],
          2
        ],
        "expected": [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            17,
            42,
            3,
            29,
            12,
            21,
            6,
            29,
            22
          ],
          3
        ],
        "expected": [
          [
            3,
            6,
            12
          ],
          [
            17,
            21,
            22
          ],
          [
            29,
            29,
            42
          ]
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 3,
    "name": "equal-depth-binning",
    "title": "等深（等頻）分箱",
    "titleEn": "Equal-Depth Binning",
    "difficulty": 2,
    "category": "資料離散化",
    "categoryEn": "Discretization",
    "functionName": "equal_depth_binning",
    "signature": [
      "values",
      "k"
    ],
    "statement": "先排序，再把 values 平均分成 k 箱，讓每箱數量盡量相等（前面幾箱多分到餘數）。回傳 k 個箱。\n\n【計算示範】\nvalues=[3,6,12,17,21,22,29,29,42], k=3：9÷3=3 每箱3個\n→ [[3,6,12],[17,21,22],[29,29,42]]。",
    "statementEn": "Sort, split into k bins of near-equal size (earlier bins take the remainder). Return list of k bins.\n\nExample:\n9 items, k=3\n→ three bins of 3.",
    "inputFormat": "values: list[number]≥1；k: int>0。",
    "inputFormatEn": "values ≥1; k>0.",
    "outputFormat": "list[list[number]]，k 個箱。",
    "outputFormatEn": "list of k bins.",
    "constraintsText": "先排序。\n前 (n mod k) 箱多一個。",
    "constraintsTextEn": "sort; first (n mod k) bins get +1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            6,
            12,
            17,
            21,
            22,
            29,
            29,
            42
          ],
          3
        ],
        "expected": [
          [
            3,
            6,
            12
          ],
          [
            17,
            21,
            22
          ],
          [
            29,
            29,
            42
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          2
        ],
        "expected": [
          [
            1,
            2,
            3
          ],
          [
            4,
            5
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            17,
            42,
            3,
            29,
            12,
            21,
            6,
            29,
            22
          ],
          3
        ],
        "expected": [
          [
            3,
            6,
            12
          ],
          [
            17,
            21,
            22
          ],
          [
            29,
            29,
            42
          ]
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 4,
    "name": "smooth-by-bin",
    "title": "分箱平滑",
    "titleEn": "Smoothing by Bin",
    "difficulty": 2,
    "category": "資料清理",
    "categoryEn": "Data Cleaning",
    "functionName": "smooth_by_bin_means",
    "signature": [
      "values",
      "k",
      "method"
    ],
    "statement": "先做等深分箱(k 箱)，再依 method 平滑：\"mean\" 每箱用箱平均取代、\"median\" 用箱中位數、\"boundaries\" 用較近的箱邊界（與最小、最大邊界比較，較近者取代；一樣近取最小邊界）。回傳排序後平滑的完整數值清單。\n\n【計算示範】\nvalues=[3,6,12,17,21,22,29,29,42], k=3, method='mean'：三箱平均為7、20、33.3333\n→ [7,7,7,20,20,20,33.3333,33.3333,33.3333]。",
    "statementEn": "Equal-depth bin (k), then smooth: mean/median/boundaries. Return the full smoothed list (sorted order).\n\nExample:\nmean smoothing of 3 bins\n→ bin means repeated.",
    "inputFormat": "values: list[number]；k: int>0；method: 'mean'|'median'|'boundaries'。",
    "inputFormatEn": "values; k>0; method in {mean,median,boundaries}.",
    "outputFormat": "list[number]，平滑後（排序順序）。",
    "outputFormatEn": "list[number] smoothed.",
    "constraintsText": "先等深分箱再平滑。\nboundaries 平手取較小邊界。",
    "constraintsTextEn": "equal-depth then smooth; ties→lower boundary.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            3,
            6,
            12,
            17,
            21,
            22,
            29,
            29,
            42
          ],
          3,
          "mean"
        ],
        "expected": [
          7.0,
          7.0,
          7.0,
          20.0,
          20.0,
          20.0,
          33.3333333333,
          33.3333333333,
          33.3333333333
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            3,
            6,
            12,
            17,
            21,
            22,
            29,
            29,
            42
          ],
          3,
          "boundaries"
        ],
        "expected": [
          3,
          3,
          12,
          17,
          22,
          22,
          29,
          29,
          42
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            3,
            6,
            12,
            17,
            21,
            22,
            29,
            29,
            42
          ],
          3,
          "median"
        ],
        "expected": [
          6,
          6,
          6,
          21,
          21,
          21,
          29,
          29,
          29
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 5,
    "name": "min-max-normalize",
    "title": "Min-Max 正規化",
    "titleEn": "Min-Max Normalization",
    "difficulty": 1,
    "category": "資料轉換",
    "categoryEn": "Data Transformation",
    "functionName": "min_max_normalize",
    "signature": [
      "values",
      "new_min",
      "new_max"
    ],
    "statement": "把 values 線性縮放到 [new_min, new_max]：x' = (x−min)/(max−min) × (new_max−new_min) + new_min。所有值相同時全部回傳 new_min。\n\n【計算示範】\nvalues=[200,300,400,600,1000], new_min=0,new_max=1：min200 max1000；300→(300−200)/800=0.125。",
    "statementEn": "Scale to [new_min,new_max]: x'=(x−min)/(max−min)(new_max−new_min)+new_min.\n\nExample:\n[200..1000] to [0,1]: 300→0.125.",
    "inputFormat": "values: list[number]；new_min,new_max: number。",
    "inputFormatEn": "values; new_min,new_max.",
    "outputFormat": "list[number]，縮放後。",
    "outputFormatEn": "list[number].",
    "constraintsText": "new_min<new_max。",
    "constraintsTextEn": "new_min<new_max.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            200,
            300,
            400,
            600,
            1000
          ],
          0,
          1
        ],
        "expected": [
          0.0,
          0.125,
          0.25,
          0.5,
          1.0
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          0,
          10
        ],
        "expected": [
          0.0,
          2.5,
          5.0,
          7.5,
          10.0
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            10,
            20,
            30,
            40
          ],
          -1,
          1
        ],
        "expected": [
          -1.0,
          -0.3333333333,
          0.3333333333,
          1.0
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 6,
    "name": "zscore-normalize",
    "title": "Z-score 標準化",
    "titleEn": "Z-score Normalization",
    "difficulty": 1,
    "category": "資料轉換",
    "categoryEn": "Data Transformation",
    "functionName": "zscore_normalize",
    "signature": [
      "values"
    ],
    "statement": "用母體標準差（分母 n）做 Z-score 標準化：x' = (x − mean) / std。標準差為 0 時全部回傳 0。\n\n【計算示範】\nvalues=[200,300,400,600,1000]：mean=500、std=282.8427；200→(200−500)/282.8427≈−1.0607。",
    "statementEn": "Z-score with population std (denominator n): x'=(x−mean)/std.\n\nExample:\n[200..1000]: mean500 std≈282.84; 200→≈−1.0607.",
    "inputFormat": "values: list[number]≥1。",
    "inputFormatEn": "values ≥1.",
    "outputFormat": "list[number]，標準化後。",
    "outputFormatEn": "list[number].",
    "constraintsText": "使用母體標準差（÷n）。",
    "constraintsTextEn": "population std (÷n).",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            200,
            300,
            400,
            600,
            1000
          ]
        ],
        "expected": [
          -1.0606601718,
          -0.7071067812,
          -0.3535533906,
          0.3535533906,
          1.767766953
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ]
        ],
        "expected": [
          -1.4142135624,
          -0.7071067812,
          0.0,
          0.7071067812,
          1.4142135624
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            10,
            12,
            23,
            23,
            16,
            23,
            21,
            16
          ]
        ],
        "expected": [
          -1.6329931619,
          -1.2247448714,
          1.0206207262,
          1.0206207262,
          -0.4082482905,
          1.0206207262,
          0.6123724357,
          -0.4082482905
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 7,
    "name": "decimal-scaling",
    "title": "小數點定標正規化",
    "titleEn": "Decimal Scaling",
    "difficulty": 2,
    "category": "資料轉換",
    "categoryEn": "Data Transformation",
    "functionName": "decimal_scaling",
    "signature": [
      "values"
    ],
    "statement": "小數點定標：找最小的 j 使得所有 |x|/10ʲ < 1，回傳每個 x/10ʲ。\n\n【計算示範】\nvalues=[200,300,400,600,1000]：max|x|=1000，需 j=4（1000/10⁴=0.1<1）→ 200→0.02。",
    "statementEn": "Decimal scaling: smallest j so all |x|/10ʲ<1; return x/10ʲ.\n\nExample:\nmax 1000\n→ j=4; 200→0.02.",
    "inputFormat": "values: list[number]≥1。",
    "inputFormatEn": "values ≥1.",
    "outputFormat": "list[number]，定標後。",
    "outputFormatEn": "list[number].",
    "constraintsText": "j 取使 max|x|/10ʲ<1 的最小整數。",
    "constraintsTextEn": "smallest j with max|x|/10ʲ<1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            200,
            300,
            400,
            600,
            1000
          ]
        ],
        "expected": [
          0.02,
          0.03,
          0.04,
          0.06,
          0.1
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            12,
            45,
            -98,
            7
          ]
        ],
        "expected": [
          0.12,
          0.45,
          -0.98,
          0.07
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            1234,
            56,
            789,
            -2000
          ]
        ],
        "expected": [
          0.1234,
          0.0056,
          0.0789,
          -0.2
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 3,
    "index": 8,
    "name": "merge-on-key",
    "title": "依鍵值整合兩份資料表",
    "titleEn": "Merge Tables on Key",
    "difficulty": 2,
    "category": "資料整合",
    "categoryEn": "Data Integration",
    "functionName": "merge_on_key",
    "signature": [
      "left",
      "right",
      "key"
    ],
    "statement": "資料整合(inner join)。給定 left、right（皆 list[dict]）與鍵欄名 key，對 left 每筆找 right 中相同 key 的第一筆並合併欄位（right 的欄位覆蓋同名者，但 key 保留）。只保留兩邊都有的鍵，依 left 順序回傳。\n\n【計算示範】\nleft=[{'id':1,'name':'A'}], right=[{'id':1,'age':20}], key='id'：合併成 [{'id':1,'name':'A','age':20}]。",
    "statementEn": "Inner join left with right on key; merge fields (right overrides, key kept); keep left order.\n\nExample:\n→ [{'id':1,'name':'A','age':20}].",
    "inputFormat": "left,right: list[dict]；key: str。",
    "inputFormatEn": "left,right list[dict]; key str.",
    "outputFormat": "list[dict]，合併後。",
    "outputFormatEn": "list[dict].",
    "constraintsText": "每筆都有 key 欄。\nright 同 key 取第一筆。",
    "constraintsTextEn": "each has key; first match on right.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "id": 1,
              "name": "A"
            },
            {
              "id": 2,
              "name": "B"
            }
          ],
          [
            {
              "id": 1,
              "age": 20
            },
            {
              "id": 2,
              "age": 25
            }
          ],
          "id"
        ],
        "expected": [
          {
            "id": 1,
            "name": "A",
            "age": 20
          },
          {
            "id": 2,
            "name": "B",
            "age": 25
          }
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "id": 1,
              "x": 1
            },
            {
              "id": 3,
              "x": 9
            }
          ],
          [
            {
              "id": 1,
              "y": 7
            }
          ],
          "id"
        ],
        "expected": [
          {
            "id": 1,
            "x": 1,
            "y": 7
          }
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "sid": "s1",
              "g": 90
            },
            {
              "sid": "s2",
              "g": 80
            }
          ],
          [
            {
              "sid": "s2",
              "cls": "B"
            },
            {
              "sid": "s1",
              "cls": "A"
            }
          ],
          "sid"
        ],
        "expected": [
          {
            "sid": "s1",
            "g": 90,
            "cls": "A"
          },
          {
            "sid": "s2",
            "g": 80,
            "cls": "B"
          }
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 4,
    "index": 1,
    "name": "hamming-distance",
    "title": "漢明距離（相異比例）",
    "titleEn": "Hamming Distance (ratio)",
    "difficulty": 1,
    "category": "相似度衡量",
    "categoryEn": "Similarity",
    "functionName": "hamming_distance",
    "signature": [
      "a",
      "b"
    ],
    "statement": "兩個等長類別向量的漢明距離＝相異欄位數／總欄位數。回傳這個比例。\n\n【計算示範】\na=['男','外科',1,'否'], b=['女','外科',3,'否']：性別、級數相異=2，共4欄\n→ 2/4=0.5。",
    "statementEn": "Hamming distance = (# differing positions)/length.\n\nExample:\n2 of 4 differ\n→ 0.5.",
    "inputFormat": "a,b: list，等長。",
    "inputFormatEn": "a,b equal-length lists.",
    "outputFormat": "number，相異比例。",
    "outputFormatEn": "number ratio.",
    "constraintsText": "a、b 等長且非空。",
    "constraintsTextEn": "equal length, nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "男",
            "外科",
            1,
            "否"
          ],
          [
            "女",
            "外科",
            3,
            "否"
          ]
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            0,
            1,
            0
          ]
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "A",
            "B",
            "C"
          ],
          [
            "A",
            "X",
            "C"
          ]
        ],
        "expected": 0.3333333333,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 4,
    "index": 2,
    "name": "binary-entropy",
    "title": "計算二元熵",
    "titleEn": "Binary Entropy",
    "difficulty": 2,
    "category": "資訊理論",
    "categoryEn": "Information Theory",
    "functionName": "binary_entropy",
    "signature": [
      "labels"
    ],
    "statement": "給定一組二元標籤 labels，回傳資訊熵（以 2 為底）：H = −Σ p·log₂p，p 為各類別比例。\n\n【計算示範】\nlabels=[1,1,0,0]：p(1)=p(0)=0.5；H=−(0.5log₂0.5×2)=1。",
    "statementEn": "Return entropy H=−Σ p·log₂p (base-2) of binary labels.\n\nExample:\n[1,1,0,0]\n→ 1.0.",
    "inputFormat": "labels: list，非空。",
    "inputFormatEn": "labels: nonempty list.",
    "outputFormat": "number，熵。",
    "outputFormatEn": "number entropy.",
    "constraintsText": "非空。\n以 2 為底。",
    "constraintsTextEn": "nonempty; base-2.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            0,
            0
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            1,
            1
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            0
          ]
        ],
        "expected": 0.9544340029,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 4,
    "index": 3,
    "name": "variance-threshold",
    "title": "低變異數特徵篩選",
    "titleEn": "Low-Variance Feature Selection",
    "difficulty": 2,
    "category": "特徵選擇",
    "categoryEn": "Feature Selection",
    "functionName": "variance_threshold_select",
    "signature": [
      "columns",
      "threshold"
    ],
    "statement": "特徵選擇：變異數太小的特徵幾乎沒有區辨力。給定多個特徵欄位 columns（columns[i] 為第 i 個特徵的值）與門檻 threshold，回傳「母體變異數 > threshold」的特徵索引清單（由小到大）。\n\n【計算示範】\ncolumns=[[1,1,1],[1,2,3]], threshold=0：第0欄變異0（不留）、第1欄變異>0（留）→ [1]。",
    "statementEn": "Keep features whose population variance > threshold; return their indices ascending.\n\nExample:\n[[1,1,1],[1,2,3]],0\n→ [1].",
    "inputFormat": "columns: list[list[number]]；threshold: number。",
    "inputFormatEn": "columns list of lists; threshold.",
    "outputFormat": "list[int]，保留的特徵索引。",
    "outputFormatEn": "list[int] kept indices.",
    "constraintsText": "用母體變異數（÷n）。\n嚴格大於門檻才保留。",
    "constraintsTextEn": "population variance; strictly greater.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              1,
              1,
              1
            ],
            [
              1,
              2,
              3
            ]
          ],
          0
        ],
        "expected": [
          1
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              5,
              5,
              5,
              5
            ],
            [
              1,
              2,
              3,
              4
            ],
            [
              2,
              2,
              2,
              3
            ]
          ],
          0.5
        ],
        "expected": [
          1
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              0,
              0,
              0
            ],
            [
              10,
              20,
              30
            ],
            [
              1,
              1,
              2
            ]
          ],
          1
        ],
        "expected": [
          1
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 4,
    "index": 4,
    "name": "pca-components",
    "title": "PCA 保留成分數",
    "titleEn": "PCA Components for Variance",
    "difficulty": 2,
    "category": "資料精簡",
    "categoryEn": "Dimensionality Reduction",
    "functionName": "pca_components_for_variance",
    "signature": [
      "variances",
      "threshold"
    ],
    "statement": "PCA 依各主成分的解釋變異量（由大到小）累加。給定 variances（已由大到小）與比例門檻 threshold（0~1），回傳達到累積解釋比例≥threshold 所需的最少成分數。\n\n【計算示範】\nvariances=[4,3,2,1], threshold=0.7：總和10；累積 4→0.4、7→0.7≥0.7\n→ 需 2 個成分。",
    "statementEn": "Given explained variances (desc) and threshold, return min #components whose cumulative ratio ≥ threshold.\n\nExample:\n[4,3,2,1],0.7\n→ 2.",
    "inputFormat": "variances: list[number]（遞減）；threshold: 0~1。",
    "inputFormatEn": "variances desc; threshold in [0,1].",
    "outputFormat": "int，成分數。",
    "outputFormatEn": "int components.",
    "constraintsText": "variances 已由大到小。\n0<threshold≤1。",
    "constraintsTextEn": "desc; 0<threshold≤1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            4,
            3,
            2,
            1
          ],
          0.7
        ],
        "expected": 2,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            5,
            3,
            2
          ],
          0.9
        ],
        "expected": 3,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            10,
            5,
            3,
            1,
            1
          ],
          0.85
        ],
        "expected": 3,
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 4,
    "index": 5,
    "name": "systematic-sample",
    "title": "系統抽樣",
    "titleEn": "Systematic Sampling",
    "difficulty": 1,
    "category": "資料精簡",
    "categoryEn": "Data Reduction",
    "functionName": "systematic_sample",
    "signature": [
      "records",
      "k"
    ],
    "statement": "系統抽樣：從第 0 筆開始每隔 k 筆取一筆。給定 records 與間隔 k，回傳索引 0, k, 2k, … 的元素清單。\n\n【計算示範】\nrecords=[10,20,30,40,50,60,70], k=3：取索引0,3,6\n→ [10,40,70]。",
    "statementEn": "Systematic sampling: take indices 0,k,2k,… Return those elements.\n\nExample:\n[10..70],k=3\n→ [10,40,70].",
    "inputFormat": "records: list；k: int>0。",
    "inputFormatEn": "records list; k>0.",
    "outputFormat": "list，抽樣結果。",
    "outputFormatEn": "list.",
    "constraintsText": "k>0。\n從索引 0 起。",
    "constraintsTextEn": "k>0; start at 0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            10,
            20,
            30,
            40,
            50,
            60,
            70
          ],
          3
        ],
        "expected": [
          10,
          40,
          70
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          2
        ],
        "expected": [
          1,
          3,
          5
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"
          ],
          4
        ],
        "expected": [
          "a",
          "e"
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 1,
    "name": "gini-impurity",
    "title": "計算 Gini 不純度",
    "titleEn": "Gini Impurity",
    "difficulty": 1,
    "category": "決策樹",
    "categoryEn": "Decision Tree",
    "functionName": "gini_impurity",
    "signature": [
      "labels"
    ],
    "statement": "決策樹用 Gini 不純度衡量一群標籤的混雜程度：Gini = 1 − Σ pᵢ²，pᵢ 為第 i 類的比例。\n\n【計算示範】\nlabels 有 10 個 R0、10 個 R1：p=0.5,0.5；Gini=1−(0.25+0.25)=0.5。",
    "statementEn": "Gini = 1 − Σ pᵢ².\n\nExample:\n10 R0,10 R1\n→ 0.5.",
    "inputFormat": "labels: list，非空。",
    "inputFormatEn": "labels nonempty.",
    "outputFormat": "number，Gini。",
    "outputFormatEn": "number.",
    "constraintsText": "非空。",
    "constraintsTextEn": "nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "R0",
            "R1",
            "R0",
            "R1"
          ]
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "A",
            "A",
            "A",
            "A"
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "y",
            "y",
            "n",
            "y",
            "n",
            "n",
            "y",
            "n",
            "y",
            "n"
          ]
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 2,
    "name": "majority-class",
    "title": "找出節點多數類別",
    "titleEn": "Majority Class",
    "difficulty": 1,
    "category": "決策樹",
    "categoryEn": "Decision Tree",
    "functionName": "majority_class",
    "signature": [
      "labels"
    ],
    "statement": "決策樹葉節點以多數類別作為預測。回傳出現最多次的類別；若有平手，回傳字典序最小者。\n\n【計算示範】\nlabels=['a','b','b','a','b']：b 出現3次最多\n→ 'b'。",
    "statementEn": "Return the most frequent label; ties broken by smallest (lexicographic).\n\nExample:\n['a','b','b','a','b']\n→ 'b'.",
    "inputFormat": "labels: list[str]，非空。",
    "inputFormatEn": "labels nonempty.",
    "outputFormat": "類別（字串）。",
    "outputFormatEn": "the label.",
    "constraintsText": "非空。\n平手取字典序最小。",
    "constraintsTextEn": "nonempty; ties→smallest.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "a",
            "b",
            "b",
            "a",
            "b"
          ]
        ],
        "expected": "b",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "x",
            "y",
            "x",
            "y"
          ]
        ],
        "expected": "x",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "R1",
            "R0",
            "R1",
            "R1",
            "R0",
            "R0",
            "R1"
          ]
        ],
        "expected": "R1",
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 3,
    "name": "entropy",
    "title": "計算資訊熵",
    "titleEn": "Information Entropy",
    "difficulty": 2,
    "category": "資訊理論",
    "categoryEn": "Information Theory",
    "functionName": "entropy",
    "signature": [
      "labels"
    ],
    "statement": "回傳一組標籤的資訊熵（以 2 為底）：H = −Σ pᵢ·log₂pᵢ。\n\n【計算示範】\nlabels 4個正、0個負：只有一類，H=0；若 2正2負，H=1。",
    "statementEn": "Return entropy H=−Σ pᵢ·log₂pᵢ (base-2).\n\nExample:\npure→0; balanced binary→1.",
    "inputFormat": "labels: list，非空。",
    "inputFormatEn": "labels nonempty.",
    "outputFormat": "number，熵。",
    "outputFormatEn": "number.",
    "constraintsText": "非空。\n以 2 為底。",
    "constraintsTextEn": "nonempty, base-2.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "+",
            "+",
            "-",
            "-"
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "+",
            "+",
            "+",
            "+"
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "a",
            "a",
            "b",
            "c",
            "c",
            "c"
          ]
        ],
        "expected": 1.459147917,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 4,
    "name": "gini-split",
    "title": "依特徵切分的 Gini",
    "titleEn": "Gini of a Split",
    "difficulty": 2,
    "category": "決策樹",
    "categoryEn": "Decision Tree",
    "functionName": "gini_split",
    "signature": [
      "records",
      "feature",
      "target"
    ],
    "statement": "給定 records（list[dict]）、切分特徵欄名 feature 與目標欄名 target，依 feature 的值把資料分組，計算加權 Gini = Σ (|子集|/|全體|)·Gini(子集)，回傳 {\"weighted_gini\": 加權後Gini, \"delta\": 原Gini − 加權Gini}。\n\n【計算示範】\n依某特徵分成兩純子集\n→ 加權Gini=0，delta=原Gini。",
    "statementEn": "Split by feature; weighted_gini=Σ(|subset|/n)·Gini(subset). Return {weighted_gini, delta=parentGini−weighted_gini}.\n\nExample:\npure split\n→ weighted_gini 0, delta=parent.",
    "inputFormat": "records: list[dict]；feature,target: str。",
    "inputFormatEn": "records list[dict]; feature,target str.",
    "outputFormat": "dict：weighted_gini、delta。",
    "outputFormatEn": "dict: weighted_gini, delta.",
    "constraintsText": "每筆都有 feature 與 target。",
    "constraintsTextEn": "each record has both keys.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            },
            {
              "f": "b",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": {
          "weighted_gini": 0.0,
          "delta": 0.5
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "a",
              "t": "N"
            },
            {
              "f": "b",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": {
          "weighted_gini": 0.5,
          "delta": 0.0
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "f": "x",
              "t": 1
            },
            {
              "f": "x",
              "t": 1
            },
            {
              "f": "y",
              "t": 0
            },
            {
              "f": "y",
              "t": 1
            },
            {
              "f": "y",
              "t": 0
            }
          ],
          "f",
          "t"
        ],
        "expected": {
          "weighted_gini": 0.2666666667,
          "delta": 0.2133333333
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 5,
    "name": "information-gain",
    "title": "計算資訊增益",
    "titleEn": "Information Gain",
    "difficulty": 3,
    "category": "決策樹",
    "categoryEn": "Decision Tree",
    "functionName": "information_gain",
    "signature": [
      "records",
      "feature",
      "target"
    ],
    "statement": "資訊增益＝切分前的熵 − 切分後的加權熵（以 2 為底）。給定 records、feature、target，依 feature 分組後回傳 Gain = H(target) − Σ(|子集|/|全體|)·H(子集)。\n\n【計算示範】\n切分後每個子集都純（熵0），Gain = 切分前的熵。",
    "statementEn": "Information gain = H(target) − Σ(|subset|/n)·H(subset), base-2.\n\nExample:\npure subsets\n→ gain equals parent entropy.",
    "inputFormat": "records: list[dict]；feature,target: str。",
    "inputFormatEn": "records; feature,target.",
    "outputFormat": "number，資訊增益。",
    "outputFormatEn": "number gain.",
    "constraintsText": "每筆都有兩欄。\n以 2 為底。",
    "constraintsTextEn": "both keys; base-2.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            },
            {
              "f": "b",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "a",
              "t": "N"
            },
            {
              "f": "b",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "o": "s",
              "p": "N"
            },
            {
              "o": "s",
              "p": "N"
            },
            {
              "o": "o",
              "p": "Y"
            },
            {
              "o": "o",
              "p": "Y"
            },
            {
              "o": "r",
              "p": "Y"
            },
            {
              "o": "r",
              "p": "N"
            }
          ],
          "o",
          "p"
        ],
        "expected": 0.6666666667,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 5,
    "index": 6,
    "name": "gain-ratio",
    "title": "計算增益比",
    "titleEn": "Gain Ratio",
    "difficulty": 3,
    "category": "決策樹",
    "categoryEn": "Decision Tree",
    "functionName": "gain_ratio",
    "signature": [
      "records",
      "feature",
      "target"
    ],
    "statement": "增益比修正資訊增益偏好多值特徵的問題：GainRatio = InformationGain / SplitInfo，其中 SplitInfo = −Σ(|子集|/|全體|)·log₂(|子集|/|全體|)（依 feature 的分佈計算）。\n\n【計算示範】\nfeature 把資料均分成兩組，SplitInfo=1；GainRatio=資訊增益/1。",
    "statementEn": "GainRatio = InformationGain / SplitInfo, SplitInfo=−Σ(|subset|/n)log₂(|subset|/n).\n\nExample:\ntwo equal groups\n→ SplitInfo 1.",
    "inputFormat": "records: list[dict]；feature,target: str。",
    "inputFormatEn": "records; feature,target.",
    "outputFormat": "number，增益比。",
    "outputFormatEn": "number.",
    "constraintsText": "每筆都有兩欄。\nSplitInfo≠0。",
    "constraintsTextEn": "both keys; SplitInfo≠0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            },
            {
              "f": "b",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "f": "a",
              "t": "Y"
            },
            {
              "f": "b",
              "t": "N"
            },
            {
              "f": "c",
              "t": "Y"
            },
            {
              "f": "d",
              "t": "N"
            }
          ],
          "f",
          "t"
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "o": "s",
              "p": "N"
            },
            {
              "o": "s",
              "p": "N"
            },
            {
              "o": "o",
              "p": "Y"
            },
            {
              "o": "o",
              "p": "Y"
            },
            {
              "o": "r",
              "p": "Y"
            },
            {
              "o": "r",
              "p": "N"
            }
          ],
          "o",
          "p"
        ],
        "expected": 0.4206198357,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 1,
    "name": "bernoulli-ev",
    "title": "伯努利期望值與變異數",
    "titleEn": "Bernoulli Expected Value",
    "difficulty": 1,
    "category": "機率基礎",
    "categoryEn": "Probability",
    "functionName": "bernoulli_expected_value",
    "signature": [
      "p"
    ],
    "statement": "伯努利分佈（成功機率 p）的期望值 E(X)=p、變異數 Var(X)=p(1−p)。給定 p，回傳 {\"expected\":E, \"variance\":Var}。\n\n【計算示範】\np=0.3：E=0.3、Var=0.3×0.7=0.21\n→ {\"expected\":0.3,\"variance\":0.21}。",
    "statementEn": "Bernoulli: E=p, Var=p(1−p). Return {expected, variance}.\n\nExample:\np=0.3\n→ {expected:0.3, variance:0.21}.",
    "inputFormat": "p: number，0≤p≤1。",
    "inputFormatEn": "p in [0,1].",
    "outputFormat": "dict：expected、variance。",
    "outputFormatEn": "dict: expected, variance.",
    "constraintsText": "0≤p≤1。",
    "constraintsTextEn": "0≤p≤1.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          0.3
        ],
        "expected": {
          "expected": 0.3,
          "variance": 0.21
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          0.5
        ],
        "expected": {
          "expected": 0.5,
          "variance": 0.25
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          0.8
        ],
        "expected": {
          "expected": 0.8,
          "variance": 0.16
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 2,
    "name": "class-priors",
    "title": "計算各類別先驗機率",
    "titleEn": "Class Prior Probabilities",
    "difficulty": 1,
    "category": "貝氏分類",
    "categoryEn": "Bayesian",
    "functionName": "class_priors",
    "signature": [
      "labels"
    ],
    "statement": "貝氏分類的先驗機率 = 各類別出現比例。給定標籤清單 labels，回傳字典 {類別: 出現比例}。\n\n【計算示範】\nlabels=['晴','晴','陰','陰','雨']：晴2/5=0.4、陰0.4、雨0.2。",
    "statementEn": "Prior = class frequency / n. Return {class: proportion}.\n\nExample:\n4/10,4/10,2/10\n→ {sunny:0.4,...}.",
    "inputFormat": "labels: list，非空。",
    "inputFormatEn": "labels nonempty.",
    "outputFormat": "dict[類別,比例]。",
    "outputFormatEn": "dict class→prob.",
    "constraintsText": "非空。",
    "constraintsTextEn": "nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "晴",
            "晴",
            "陰",
            "陰",
            "雨"
          ]
        ],
        "expected": {
          "晴": 0.4,
          "陰": 0.4,
          "雨": 0.2
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "A",
            "A",
            "A",
            "B"
          ]
        ],
        "expected": {
          "A": 0.75,
          "B": 0.25
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "晴",
            "晴",
            "陰",
            "陰",
            "雨",
            "陰",
            "陰",
            "雨",
            "晴",
            "晴"
          ]
        ],
        "expected": {
          "晴": 0.4,
          "陰": 0.4,
          "雨": 0.2
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 3,
    "name": "conditional-probability",
    "title": "計算條件機率",
    "titleEn": "Conditional Probability",
    "difficulty": 2,
    "category": "貝氏分類",
    "categoryEn": "Bayesian",
    "functionName": "conditional_probability",
    "signature": [
      "records",
      "condition",
      "target"
    ],
    "statement": "條件機率 P(target｜condition) = 同時符合 condition 與 target 的筆數 / 符合 condition 的筆數。condition、target 皆為 {欄位:值} 的字典（可多欄）。\n\n【計算示範】\n求 P(帶傘=是｜天氣=陰)：陰天共4筆、其中帶傘=是有4筆\n→ 4/4=1.0。",
    "statementEn": "P(target|condition) = count(condition∩target)/count(condition). condition, target are {col:val} dicts.\n\nExample:\nmatching rows ratio.",
    "inputFormat": "records: list[dict]；condition,target: dict。",
    "inputFormatEn": "records; condition,target dict.",
    "outputFormat": "number，條件機率。",
    "outputFormatEn": "number.",
    "constraintsText": "condition 無符合時回傳 0。",
    "constraintsTextEn": "return 0 if no match.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "w": "陰",
              "u": "是"
            },
            {
              "w": "陰",
              "u": "是"
            },
            {
              "w": "晴",
              "u": "否"
            },
            {
              "w": "雨",
              "u": "是"
            }
          ],
          {
            "w": "陰"
          },
          {
            "u": "是"
          }
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "a": 1,
              "b": 0
            },
            {
              "a": 1,
              "b": 1
            },
            {
              "a": 0,
              "b": 1
            }
          ],
          {
            "a": 1
          },
          {
            "b": 1
          }
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "w": "晴",
              "u": "否"
            },
            {
              "w": "晴",
              "u": "是"
            },
            {
              "w": "陰",
              "u": "是"
            },
            {
              "w": "陰",
              "u": "是"
            }
          ],
          {
            "w": "晴"
          },
          {
            "u": "是"
          }
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 4,
    "name": "naive-bayes",
    "title": "Naive Bayes 分類（Laplacian）",
    "titleEn": "Naive Bayes with Laplacian",
    "difficulty": 3,
    "category": "貝氏分類",
    "categoryEn": "Bayesian",
    "functionName": "naive_bayes_predict",
    "signature": [
      "train",
      "features",
      "query"
    ],
    "statement": "用 Naive Bayes 加 Laplacian 修正分類。train 每筆是字典且含 \"label\"；features 為特徵欄名清單；query 為 {特徵:值}。先驗 P(c)=(該類筆數+1)/(N+K)（K=類別數）；概似 P(xᵢ|c)=(該類中 xᵢ 出現數+1)/(該類筆數+Vᵢ)（Vᵢ=第 i 特徵的相異值數）。後驗 ∝ 先驗×Π概似，回傳分數最高的類別（平手取字典序小者）。\n\n【計算示範】\n已知張三帶傘、李四沒帶，Laplacian 修正後 P(陰)最高（0.1068> 晴0.0534、雨0.0432），回傳 \"陰\"。",
    "statementEn": "Naive Bayes with Laplacian. Prior=(nc+1)/(N+K); likelihood=(count+1)/(nc+Vi). Return argmax class (ties→smallest).\n\nExample:\nReturns the class with highest Laplacian-corrected posterior.",
    "inputFormat": "train: list[dict]（含 label）；features: list[str]；query: dict。",
    "inputFormatEn": "train list[dict] with label; features list; query dict.",
    "outputFormat": "類別（字串）。",
    "outputFormatEn": "the predicted label.",
    "constraintsText": "每筆含 label 與所有 feature。\n平手取字典序小者。",
    "constraintsTextEn": "each has label and features; ties→smallest.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "三": "否",
              "四": "否",
              "label": "晴"
            },
            {
              "三": "否",
              "四": "否",
              "label": "晴"
            },
            {
              "三": "是",
              "四": "是",
              "label": "陰"
            },
            {
              "三": "是",
              "四": "是",
              "label": "陰"
            },
            {
              "三": "是",
              "四": "是",
              "label": "雨"
            },
            {
              "三": "是",
              "四": "是",
              "label": "陰"
            },
            {
              "三": "是",
              "四": "否",
              "label": "陰"
            },
            {
              "三": "是",
              "四": "是",
              "label": "雨"
            },
            {
              "三": "否",
              "四": "否",
              "label": "晴"
            },
            {
              "三": "否",
              "四": "否",
              "label": "晴"
            }
          ],
          [
            "三",
            "四"
          ],
          {
            "三": "是",
            "四": "否"
          }
        ],
        "expected": "陰",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "x": "a",
              "label": "P"
            },
            {
              "x": "a",
              "label": "P"
            },
            {
              "x": "b",
              "label": "N"
            }
          ],
          [
            "x"
          ],
          {
            "x": "a"
          }
        ],
        "expected": "P",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "o": "hot",
              "w": "high",
              "label": "no"
            },
            {
              "o": "hot",
              "w": "high",
              "label": "no"
            },
            {
              "o": "cool",
              "w": "low",
              "label": "yes"
            },
            {
              "o": "cool",
              "w": "high",
              "label": "yes"
            }
          ],
          [
            "o",
            "w"
          ],
          {
            "o": "cool",
            "w": "high"
          }
        ],
        "expected": "yes",
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 5,
    "name": "majority-vote",
    "title": "Ensemble 多數決",
    "titleEn": "Majority Vote",
    "difficulty": 2,
    "category": "Ensemble",
    "categoryEn": "Ensemble",
    "functionName": "majority_vote",
    "signature": [
      "predictions"
    ],
    "statement": "集成學習用多數決整合多個模型的預測。給定各模型的預測清單 predictions，回傳票數最多的類別（平手取字典序最小）。\n\n【計算示範】\npredictions=['A','B','A','A','B']：A 3票\n→ 'A'。",
    "statementEn": "Return the most-voted label (ties→smallest).\n\nExample:\n['A','B','A','A','B']\n→ 'A'.",
    "inputFormat": "predictions: list，非空。",
    "inputFormatEn": "predictions nonempty.",
    "outputFormat": "類別（字串）。",
    "outputFormatEn": "the label.",
    "constraintsText": "非空。\n平手取字典序小者。",
    "constraintsTextEn": "nonempty; ties→smallest.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            "A",
            "B",
            "A",
            "A",
            "B"
          ]
        ],
        "expected": "A",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "yes",
            "no",
            "yes",
            "no"
          ]
        ],
        "expected": "no",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            "1",
            "1",
            "0",
            "1",
            "0",
            "0",
            "1"
          ]
        ],
        "expected": "1",
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 6,
    "name": "confusion-counts",
    "title": "計算混淆矩陣四格",
    "titleEn": "Confusion Matrix Counts",
    "difficulty": 2,
    "category": "模型評估",
    "categoryEn": "Model Evaluation",
    "functionName": "confusion_counts",
    "signature": [
      "y_true",
      "y_pred",
      "positive"
    ],
    "statement": "給定真實標籤 y_true、預測 y_pred 與正類別 positive，回傳混淆矩陣四格：TP（預測正且真實正）、FP（預測正但真實非正）、FN（預測非正但真實正）、TN（其餘）。\n\n【計算示範】\npositive=1，y_true=[1,1,0,0], y_pred=[1,0,0,0]：TP=1,FP=0,FN=1,TN=2。",
    "statementEn": "Return {TP,FP,FN,TN} relative to the positive class.\n\nExample:\n→ TP1 FP0 FN1 TN2.",
    "inputFormat": "y_true,y_pred: list，等長；positive: 類別值。",
    "inputFormatEn": "y_true,y_pred equal length; positive value.",
    "outputFormat": "dict：TP、FP、FN、TN。",
    "outputFormatEn": "dict.",
    "constraintsText": "等長。",
    "constraintsTextEn": "equal length.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            0,
            0
          ],
          1
        ],
        "expected": {
          "TP": 1,
          "FP": 0,
          "FN": 1,
          "TN": 2
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "y",
            "y",
            "n"
          ],
          [
            "y",
            "n",
            "n"
          ],
          "y"
        ],
        "expected": {
          "TP": 1,
          "FP": 0,
          "FN": 1,
          "TN": 1
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            1,
            0,
            1,
            1,
            0,
            0
          ],
          [
            1,
            1,
            1,
            0,
            0,
            1
          ],
          1
        ],
        "expected": {
          "TP": 2,
          "FP": 2,
          "FN": 1,
          "TN": 1
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 6,
    "index": 7,
    "name": "precision-recall-f1",
    "title": "計算 Precision / Recall / F1",
    "titleEn": "Precision, Recall, F1",
    "difficulty": 2,
    "category": "模型評估",
    "categoryEn": "Model Evaluation",
    "functionName": "precision_recall_f1",
    "signature": [
      "y_true",
      "y_pred",
      "positive"
    ],
    "statement": "由混淆矩陣計算：Precision=TP/(TP+FP)、Recall=TP/(TP+FN)、F1=2·P·R/(P+R)。分母為 0 時該值以 0 計。回傳 {\"precision\",\"recall\",\"f1\"}。\n\n【計算示範】\nTP=1,FP=0,FN=1：P=1、R=0.5、F1=2·1·0.5/1.5≈0.6667。",
    "statementEn": "Precision=TP/(TP+FP), Recall=TP/(TP+FN), F1=2PR/(P+R); 0 if denom 0.\n\nExample:\n→ P1 R0.5 F1≈0.6667.",
    "inputFormat": "y_true,y_pred: list，等長；positive: 類別值。",
    "inputFormatEn": "equal length; positive value.",
    "outputFormat": "dict：precision、recall、f1。",
    "outputFormatEn": "dict.",
    "constraintsText": "等長。\n分母 0 時該值為 0。",
    "constraintsTextEn": "equal length; 0 on zero denom.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            0,
            0
          ],
          1
        ],
        "expected": {
          "precision": 1.0,
          "recall": 0.5,
          "f1": 0.6666666667
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            "y",
            "y",
            "n",
            "y"
          ],
          [
            "y",
            "y",
            "y",
            "n"
          ],
          "y"
        ],
        "expected": {
          "precision": 0.6666666667,
          "recall": 0.6666666667,
          "f1": 0.6666666667
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            1,
            0,
            1,
            1,
            0,
            0
          ],
          [
            1,
            1,
            1,
            0,
            0,
            1
          ],
          1
        ],
        "expected": {
          "precision": 0.5,
          "recall": 0.6666666667,
          "f1": 0.5714285714
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 1,
    "name": "relu",
    "title": "ReLU 活化函數",
    "titleEn": "ReLU Activation",
    "difficulty": 1,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "relu",
    "signature": [
      "values"
    ],
    "statement": "ReLU(x)=max(0,x)。給定數值清單 values，回傳每個元素套用 ReLU 後的清單。\n\n【計算示範】\nvalues=[-2,-0.5,0,3]：→[0,0,0,3]。",
    "statementEn": "ReLU(x)=max(0,x). Apply elementwise.\n\nExample:\n[-2,-0.5,0,3]\n→ [0,0,0,3].",
    "inputFormat": "values: list[number]。",
    "inputFormatEn": "values list[number].",
    "outputFormat": "list[number]。",
    "outputFormatEn": "list[number].",
    "constraintsText": "逐元素套用。",
    "constraintsTextEn": "elementwise.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            -2,
            -0.5,
            0,
            3
          ]
        ],
        "expected": [
          0,
          0,
          0,
          3
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": [
          1,
          2,
          3
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            -5,
            4,
            -1,
            0,
            2.5
          ]
        ],
        "expected": [
          0,
          4,
          0,
          0,
          2.5
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 2,
    "name": "sigmoid",
    "title": "Sigmoid 活化函數",
    "titleEn": "Sigmoid Activation",
    "difficulty": 1,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "sigmoid",
    "signature": [
      "x"
    ],
    "statement": "Sigmoid(x)=1/(1+e⁻ˣ)。給定 x，回傳其 sigmoid 值。\n\n【計算示範】\nx=0.4：1/(1+e^-0.4)≈0.5987。",
    "statementEn": "Sigmoid(x)=1/(1+e^-x).\n\nExample:\nx=0.4\n→ ≈0.5987.",
    "inputFormat": "x: number。",
    "inputFormatEn": "x: number.",
    "outputFormat": "number，0~1。",
    "outputFormatEn": "number in (0,1).",
    "constraintsText": "—",
    "constraintsTextEn": "—",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          0.4
        ],
        "expected": 0.5986876601,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          0
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          -0.3
        ],
        "expected": 0.4255574832,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 3,
    "name": "mse",
    "title": "均方誤差 MSE",
    "titleEn": "Mean Squared Error",
    "difficulty": 1,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "mean_squared_error",
    "signature": [
      "y_true",
      "y_pred"
    ],
    "statement": "均方誤差 MSE = (1/n)·Σ(真實ᵢ − 預測ᵢ)²。給定等長 y_true、y_pred，回傳 MSE。\n\n【計算示範】\ny_true=[1,2,3], y_pred=[1,2,5]：誤差²=0,0,4；MSE=4/3≈1.3333。",
    "statementEn": "MSE = mean((y_true−y_pred)²).\n\nExample:\n→ 4/3≈1.3333.",
    "inputFormat": "y_true,y_pred: list[number]，等長。",
    "inputFormatEn": "equal length.",
    "outputFormat": "number，MSE。",
    "outputFormatEn": "number.",
    "constraintsText": "等長非空。",
    "constraintsTextEn": "equal length nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3
          ],
          [
            1,
            2,
            5
          ]
        ],
        "expected": 1.3333333333,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            0,
            0
          ],
          [
            0,
            0
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            3,
            -0.5,
            2,
            7
          ],
          [
            2.5,
            0,
            2,
            8
          ]
        ],
        "expected": 0.375,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 4,
    "name": "net-input",
    "title": "神經元淨輸入",
    "titleEn": "Neuron Net Input",
    "difficulty": 2,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "net_input",
    "signature": [
      "inputs",
      "weights",
      "bias"
    ],
    "statement": "神經元的淨輸入 = Σ(輸入ᵢ×權重ᵢ) + 偏權 bias。給定 inputs、weights（等長）與 bias，回傳淨輸入。\n\n【計算示範】\ninputs=[2,1,0], weights=[0.2,0.4,-0.5], bias=-0.4：0.4+0.4+0−0.4=0.4。",
    "statementEn": "Net input = Σ(inputᵢ·weightᵢ) + bias.\n\nExample:\n→ 0.4.",
    "inputFormat": "inputs,weights: list[number]，等長；bias: number。",
    "inputFormatEn": "equal length; bias number.",
    "outputFormat": "number，淨輸入。",
    "outputFormatEn": "number.",
    "constraintsText": "inputs 與 weights 等長。",
    "constraintsTextEn": "equal length.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            2,
            1,
            0
          ],
          [
            0.2,
            0.4,
            -0.5
          ],
          -0.4
        ],
        "expected": 0.4,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            1
          ],
          [
            0.5,
            0.5
          ],
          0
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            2,
            1,
            0
          ],
          [
            -0.3,
            0.1,
            0.2
          ],
          0.2
        ],
        "expected": -0.3,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 5,
    "name": "forward-pass",
    "title": "前向傳播",
    "titleEn": "Forward Pass",
    "difficulty": 3,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "forward_pass",
    "signature": [
      "inputs",
      "layers"
    ],
    "statement": "前向傳播。inputs 為輸入向量；layers 為各層清單，每層是神經元清單，神經元為 {\"weights\":[...],\"bias\":b}。每個神經元輸出 = sigmoid(Σ 前層輸出×weights + bias)。逐層前傳，回傳最後一層的輸出清單。\n\n【計算示範】\ninputs=[2,1,0]，第1層兩神經元(net 0.4→0.5987、net −0.3→0.4256)，第2層一神經元(weights=[-0.3,-0.2],bias0.1)→ sigmoid(−0.1648)≈0.4589\n→ [0.4589]。",
    "statementEn": "Feed-forward with sigmoid. Each neuron={weights,bias}; output=sigmoid(Σ prev·weights+bias). Return final layer outputs.\n\nExample:\nTwo hidden then one output\n→ ≈[0.4589].",
    "inputFormat": "inputs: list[number]；layers: list[list[dict]]（每 dict 含 weights、bias）。",
    "inputFormatEn": "inputs; layers list of layers of {weights,bias}.",
    "outputFormat": "list[number]，最後一層輸出。",
    "outputFormatEn": "list[number].",
    "constraintsText": "每個神經元 weights 長度=前層輸出數。",
    "constraintsTextEn": "weight length matches prev layer size.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            2,
            1,
            0
          ],
          [
            [
              {
                "weights": [
                  0.2,
                  0.4,
                  -0.5
                ],
                "bias": -0.4
              },
              {
                "weights": [
                  -0.3,
                  0.1,
                  0.2
                ],
                "bias": 0.2
              }
            ],
            [
              {
                "weights": [
                  -0.3,
                  -0.2
                ],
                "bias": 0.1
              }
            ]
          ]
        ],
        "expected": [
          0.458913406
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            1
          ],
          [
            [
              {
                "weights": [
                  0.5,
                  0.5
                ],
                "bias": 0
              }
            ]
          ]
        ],
        "expected": [
          0.7310585786
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            0.5,
            -1
          ],
          [
            [
              {
                "weights": [
                  1,
                  -1
                ],
                "bias": 0
              },
              {
                "weights": [
                  0.2,
                  0.8
                ],
                "bias": -0.5
              }
            ]
          ]
        ],
        "expected": [
          0.8175744762,
          0.2314752165
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 6,
    "name": "backprop-update",
    "title": "反向傳播權重更新",
    "titleEn": "Backprop Weight Update",
    "difficulty": 3,
    "category": "類神經網路",
    "categoryEn": "Neural Network",
    "functionName": "backprop_output_update",
    "signature": [
      "output",
      "target",
      "prev_activations",
      "weights",
      "bias",
      "lr"
    ],
    "statement": "輸出神經元的反向傳播。誤差項 δ = output×(1−output)×(target−output)。每個權重更新 wᵢ ← wᵢ + lr×δ×前層輸出ᵢ；偏權 bias ← bias + lr×δ。回傳 {\"delta\":δ, \"weights\":新權重, \"bias\":新偏權}。\n\n【計算示範】\noutput=0.459,target=1：δ=0.459×0.541×0.541≈0.1343；w46=−0.3+0.9×0.1343×0.599≈−0.228；bias=0.1+0.9×0.1343≈0.221。",
    "statementEn": "Output-node backprop. δ=o(1−o)(t−o); wᵢ←wᵢ+lr·δ·prevᵢ; bias←bias+lr·δ. Return {delta,weights,bias}.\n\nExample:\nδ≈0.1343; updated w46≈−0.228; bias≈0.221.",
    "inputFormat": "output,target,bias,lr: number；prev_activations,weights: list[number]。",
    "inputFormatEn": "scalars + prev_activations, weights lists.",
    "outputFormat": "dict：delta、weights、bias。",
    "outputFormatEn": "dict.",
    "constraintsText": "prev_activations 與 weights 等長。",
    "constraintsTextEn": "equal length.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          0.459,
          1,
          [
            0.599,
            0.426
          ],
          [
            -0.3,
            -0.2
          ],
          0.1,
          0.9
        ],
        "expected": {
          "delta": 0.134340579,
          "weights": [
            -0.2275769939,
            -0.148493822
          ],
          "bias": 0.2209065211
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          0.5,
          1,
          [
            1.0
          ],
          [
            0.4
          ],
          0.2,
          0.5
        ],
        "expected": {
          "delta": 0.125,
          "weights": [
            0.4625
          ],
          "bias": 0.2625
        },
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          0.6,
          0,
          [
            0.5,
            0.5
          ],
          [
            0.1,
            0.2
          ],
          0.3,
          0.5
        ],
        "expected": {
          "delta": -0.144,
          "weights": [
            0.064,
            0.164
          ],
          "bias": 0.228
        },
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 7,
    "index": 7,
    "name": "shap-rank",
    "title": "依 SHAP 重要度排序特徵",
    "titleEn": "Rank Features by SHAP",
    "difficulty": 2,
    "category": "可解釋性",
    "categoryEn": "Explainability",
    "functionName": "rank_features_by_shap",
    "signature": [
      "shap_values"
    ],
    "statement": "SHAP 值的絕對值越大代表特徵越重要。給定 {特徵:SHAP值}，回傳依 |SHAP| 由大到小排序的特徵名稱清單（絕對值相同時取字典序小者）。\n\n【計算示範】\n{'age':0.5,'income':-0.8,'city':0.1}：|0.8|>|0.5|>|0.1|\n→ ['income','age','city']。",
    "statementEn": "Return feature names sorted by |SHAP| desc (ties→name asc).\n\nExample:\n→ ['income','age','city'].",
    "inputFormat": "shap_values: dict[str,number]。",
    "inputFormatEn": "dict feature→value.",
    "outputFormat": "list[str]，排序後特徵。",
    "outputFormatEn": "list[str].",
    "constraintsText": "以絕對值排序。\n平手取字典序小者。",
    "constraintsTextEn": "by |value|; ties→name.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          {
            "age": 0.5,
            "income": -0.8,
            "city": 0.1
          }
        ],
        "expected": [
          "income",
          "age",
          "city"
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          {
            "a": 0.2,
            "b": -0.2,
            "c": 0.9
          }
        ],
        "expected": [
          "c",
          "a",
          "b"
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          {
            "f1": -1.5,
            "f2": 1.5,
            "f3": 0.3,
            "f4": -0.9
          }
        ],
        "expected": [
          "f1",
          "f2",
          "f4",
          "f3"
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 1,
    "name": "support-count",
    "title": "計算項目集支持筆數",
    "titleEn": "Itemset Support Count",
    "difficulty": 1,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "support_count",
    "signature": [
      "transactions",
      "itemset"
    ],
    "statement": "支持筆數＝包含整個項目集的交易數。給定交易清單 transactions（每筆為商品清單）與 itemset，回傳同時包含 itemset 中所有商品的交易筆數。\n\n【計算示範】\nitemset=['Shoes','Sunglasses']，5 筆交易中有 4 筆同時含兩者\n→ 4。",
    "statementEn": "Support count = # transactions containing all items of itemset.\n\nExample:\n→ 4.",
    "inputFormat": "transactions: list[list]；itemset: list。",
    "inputFormatEn": "transactions list of lists; itemset list.",
    "outputFormat": "int，支持筆數。",
    "outputFormatEn": "int.",
    "constraintsText": "交易內商品不重複。",
    "constraintsTextEn": "items unique per transaction.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Shirt",
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shirt"
            ],
            [
              "Shoes",
              "Sunglasses",
              "Hat"
            ]
          ],
          [
            "Shoes",
            "Sunglasses"
          ]
        ],
        "expected": 3,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a"
            ],
            [
              "a",
              "b",
              "c"
            ]
          ],
          [
            "a",
            "b"
          ]
        ],
        "expected": 2,
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter"
            ],
            [
              "Milk",
              "Butter",
              "Cereal"
            ]
          ],
          [
            "Milk",
            "Cereal"
          ]
        ],
        "expected": 2,
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 2,
    "name": "support-ratio",
    "title": "計算支持度比例",
    "titleEn": "Support Ratio",
    "difficulty": 1,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "support_ratio",
    "signature": [
      "transactions",
      "itemset"
    ],
    "statement": "支持度＝包含項目集的交易數 / 總交易數。回傳這個比例。\n\n【計算示範】\n4 筆含該項目集、共 5 筆\n→ 4/5=0.8。",
    "statementEn": "Support = support_count / total transactions.\n\nExample:\n4/5=0.8.",
    "inputFormat": "transactions: list[list]；itemset: list。",
    "inputFormatEn": "transactions; itemset.",
    "outputFormat": "number，支持度。",
    "outputFormatEn": "number.",
    "constraintsText": "交易數>0。",
    "constraintsTextEn": "nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Shirt",
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shirt"
            ],
            [
              "Shoes",
              "Sunglasses",
              "Hat"
            ],
            [
              "Shirt",
              "Shoes",
              "Sunglasses"
            ]
          ],
          [
            "Shoes",
            "Sunglasses"
          ]
        ],
        "expected": 0.8,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a"
            ],
            [
              "a",
              "b",
              "c"
            ],
            [
              "b"
            ]
          ],
          [
            "a"
          ]
        ],
        "expected": 0.75,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "Milk",
              "Bread"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter"
            ],
            [
              "Bread",
              "Eggs"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          [
            "Bread"
          ]
        ],
        "expected": 0.8,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 3,
    "name": "confidence",
    "title": "計算關聯規則信賴度",
    "titleEn": "Rule Confidence",
    "difficulty": 2,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "confidence",
    "signature": [
      "transactions",
      "ante",
      "cons"
    ],
    "statement": "關聯規則 ante→cons 的信賴度＝support(ante∪cons)/support(ante)。ante、cons 皆為商品清單。回傳信賴度。\n\n【計算示範】\n(Milk,Bread)→Butter：三者同時出現1筆、(Milk,Bread)出現2筆\n→ 1/2=0.5。",
    "statementEn": "Confidence(ante→cons)=support(ante∪cons)/support(ante).\n\nExample:\n→ 0.5.",
    "inputFormat": "transactions: list[list]；ante,cons: list。",
    "inputFormatEn": "transactions; ante,cons.",
    "outputFormat": "number，信賴度。",
    "outputFormatEn": "number.",
    "constraintsText": "support(ante)>0。",
    "constraintsTextEn": "support(ante)>0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter",
              "Cereal",
              "Juice"
            ],
            [
              "Bread",
              "Cereal",
              "Eggs",
              "Juice"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          [
            "Milk",
            "Bread"
          ],
          [
            "Butter"
          ]
        ],
        "expected": 0.5,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a",
              "b"
            ],
            [
              "a"
            ],
            [
              "b"
            ]
          ],
          [
            "a"
          ],
          [
            "b"
          ]
        ],
        "expected": 0.6666666667,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shirt",
              "Shoes",
              "Sunglasses"
            ],
            [
              "Shirt"
            ],
            [
              "Shoes",
              "Sunglasses"
            ]
          ],
          [
            "Shoes"
          ],
          [
            "Sunglasses"
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 4,
    "name": "lift",
    "title": "計算關聯規則增益度",
    "titleEn": "Rule Lift",
    "difficulty": 2,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "lift",
    "signature": [
      "transactions",
      "ante",
      "cons"
    ],
    "statement": "增益度 Lift(ante→cons)＝confidence(ante→cons) / support(cons)。Lift>1 代表正相關。回傳增益度。\n\n【計算示範】\n(Milk,Bread)→Butter：conf=0.5、support(Butter)=3/5=0.6\n→ 0.5/0.6≈0.8333。",
    "statementEn": "Lift=confidence/support(cons). >1 means positive correlation.\n\nExample:\n0.5/0.6≈0.8333.",
    "inputFormat": "transactions: list[list]；ante,cons: list。",
    "inputFormatEn": "transactions; ante,cons.",
    "outputFormat": "number，增益度。",
    "outputFormatEn": "number.",
    "constraintsText": "support(cons)>0。",
    "constraintsTextEn": "support(cons)>0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter",
              "Cereal",
              "Juice"
            ],
            [
              "Bread",
              "Cereal",
              "Eggs",
              "Juice"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          [
            "Milk",
            "Bread"
          ],
          [
            "Butter"
          ]
        ],
        "expected": 0.8333333333,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a",
              "b"
            ],
            [
              "a"
            ],
            [
              "b"
            ]
          ],
          [
            "a"
          ],
          [
            "b"
          ]
        ],
        "expected": 0.8888888889,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter",
              "Cereal",
              "Juice"
            ],
            [
              "Bread",
              "Cereal",
              "Eggs",
              "Juice"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          [
            "Bread",
            "Cereal"
          ],
          [
            "Eggs"
          ]
        ],
        "expected": 1.25,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 5,
    "name": "frequent-1-itemsets",
    "title": "找出頻繁 1-項目集",
    "titleEn": "Frequent 1-Itemsets",
    "difficulty": 2,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "frequent_1_itemsets",
    "signature": [
      "transactions",
      "min_support"
    ],
    "statement": "Apriori 第一步：找出支持度≥min_support 的單一商品。回傳符合的商品清單（依字典序排序）。\n\n【計算示範】\nmin_support=0.6（5 筆需≥3 筆）：只有出現在至少 3 筆的商品入選。",
    "statementEn": "Return single items with support ≥ min_support, sorted.\n\nExample:\nitems appearing in ≥ min_support fraction.",
    "inputFormat": "transactions: list[list]；min_support: 0~1。",
    "inputFormatEn": "transactions; min_support.",
    "outputFormat": "list，頻繁單品（排序）。",
    "outputFormatEn": "sorted list.",
    "constraintsText": "以支持度比例比較（≥）。",
    "constraintsTextEn": "ratio ≥ threshold.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter",
              "Cereal"
            ],
            [
              "Bread",
              "Cereal",
              "Eggs"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          0.6
        ],
        "expected": [
          "Bread",
          "Butter",
          "Cereal",
          "Milk"
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a"
            ],
            [
              "a",
              "b"
            ],
            [
              "b"
            ]
          ],
          0.5
        ],
        "expected": [
          "a",
          "b"
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "x",
              "y"
            ],
            [
              "x"
            ],
            [
              "x",
              "z"
            ],
            [
              "x",
              "y",
              "z"
            ],
            [
              "y"
            ]
          ],
          0.6
        ],
        "expected": [
          "x",
          "y"
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 8,
    "index": 6,
    "name": "apriori-itemsets",
    "title": "Apriori 找出所有頻繁項目集",
    "titleEn": "Apriori Frequent Itemsets",
    "difficulty": 3,
    "category": "關聯規則",
    "categoryEn": "Association Rules",
    "functionName": "apriori_frequent_itemsets",
    "signature": [
      "transactions",
      "min_support"
    ],
    "statement": "用 Apriori 找出所有支持度≥min_support 的頻繁項目集。每個項目集以「排序後的商品清單」表示，整體結果先依項目集大小、再依字典序排序後回傳。\n\n【計算示範】\nmin_support=0.6：先找頻繁單品，再兩兩合併檢查支持度，逐層擴張直到沒有新的頻繁項目集。",
    "statementEn": "Apriori: return all itemsets with support ≥ min_support; each a sorted list; result sorted by (size, lexicographic).\n\nExample:\nGenerate level by level; keep those meeting support.",
    "inputFormat": "transactions: list[list]；min_support: 0~1。",
    "inputFormatEn": "transactions; min_support.",
    "outputFormat": "list[list]，所有頻繁項目集。",
    "outputFormatEn": "list of itemsets.",
    "constraintsText": "以支持度比例比較（≥）。\n每個項目集內部排序。",
    "constraintsTextEn": "ratio ≥; each itemset sorted.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              "Milk",
              "Bread",
              "Cereal"
            ],
            [
              "Bread",
              "Butter",
              "Eggs"
            ],
            [
              "Milk",
              "Butter",
              "Cereal"
            ],
            [
              "Bread",
              "Cereal",
              "Eggs"
            ],
            [
              "Milk",
              "Bread",
              "Butter"
            ]
          ],
          0.6
        ],
        "expected": [
          [
            "Bread"
          ],
          [
            "Butter"
          ],
          [
            "Cereal"
          ],
          [
            "Milk"
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              "a",
              "b"
            ],
            [
              "a",
              "b"
            ],
            [
              "a",
              "b",
              "c"
            ],
            [
              "a"
            ]
          ],
          0.5
        ],
        "expected": [
          [
            "a"
          ],
          [
            "b"
          ],
          [
            "a",
            "b"
          ]
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              "p",
              "q",
              "r"
            ],
            [
              "p",
              "q"
            ],
            [
              "p",
              "r"
            ],
            [
              "q",
              "r"
            ],
            [
              "p",
              "q",
              "r"
            ]
          ],
          0.6
        ],
        "expected": [
          [
            "p"
          ],
          [
            "q"
          ],
          [
            "r"
          ],
          [
            "p",
            "q"
          ],
          [
            "p",
            "r"
          ],
          [
            "q",
            "r"
          ]
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 1,
    "name": "euclidean-distance",
    "title": "計算歐氏距離",
    "titleEn": "Euclidean Distance",
    "difficulty": 1,
    "category": "相似度",
    "categoryEn": "Similarity",
    "functionName": "euclidean_distance",
    "signature": [
      "a",
      "b"
    ],
    "statement": "兩點的歐氏距離 = √Σ(aᵢ−bᵢ)²。給定等長向量 a、b，回傳歐氏距離。\n\n【計算示範】\na=[0,0], b=[3,4]：√(9+16)=5。",
    "statementEn": "Euclidean distance = √Σ(aᵢ−bᵢ)².\n\nExample:\n[0,0]&[3,4]\n→ 5.",
    "inputFormat": "a,b: list[number]，等長。",
    "inputFormatEn": "equal length.",
    "outputFormat": "number，距離。",
    "outputFormatEn": "number.",
    "constraintsText": "等長。",
    "constraintsTextEn": "equal length.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            0,
            0
          ],
          [
            3,
            4
          ]
        ],
        "expected": 5.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3
          ],
          [
            1,
            2,
            3
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            18,
            180,
            60,
            80
          ],
          [
            24,
            179,
            58,
            60
          ]
        ],
        "expected": 21.0,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 2,
    "name": "manhattan-distance",
    "title": "計算曼哈頓距離",
    "titleEn": "Manhattan Distance",
    "difficulty": 1,
    "category": "相似度",
    "categoryEn": "Similarity",
    "functionName": "manhattan_distance",
    "signature": [
      "a",
      "b"
    ],
    "statement": "曼哈頓距離 = Σ|aᵢ−bᵢ|。給定等長 a、b，回傳曼哈頓距離。\n\n【計算示範】\na=[0,0], b=[3,4]：|3|+|4|=7。",
    "statementEn": "Manhattan distance = Σ|aᵢ−bᵢ|.\n\nExample:\n[0,0]&[3,4]\n→ 7.",
    "inputFormat": "a,b: list[number]，等長。",
    "inputFormatEn": "equal length.",
    "outputFormat": "number，距離。",
    "outputFormatEn": "number.",
    "constraintsText": "等長。",
    "constraintsTextEn": "equal length.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            0,
            0
          ],
          [
            3,
            4
          ]
        ],
        "expected": 7,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            1,
            1
          ],
          [
            4,
            5,
            6
          ]
        ],
        "expected": 12,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            18,
            180,
            60,
            80
          ],
          [
            24,
            179,
            58,
            60
          ]
        ],
        "expected": 29,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 3,
    "name": "weighted-distance",
    "title": "計算加權距離",
    "titleEn": "Weighted Distance",
    "difficulty": 2,
    "category": "相似度",
    "categoryEn": "Similarity",
    "functionName": "weighted_distance",
    "signature": [
      "a",
      "b",
      "weights"
    ],
    "statement": "加權距離 = √Σ wᵢ(aᵢ−bᵢ)²，wᵢ 為第 i 個特徵的權重。給定等長 a、b、weights，回傳加權距離。\n\n【計算示範】\na=[0,0], b=[3,4], weights=[1,0.25]：√(1×9+0.25×16)=√13≈3.6056。",
    "statementEn": "Weighted distance = √Σ wᵢ(aᵢ−bᵢ)².\n\nExample:\n→ √13≈3.6056.",
    "inputFormat": "a,b,weights: list[number]，等長。",
    "inputFormatEn": "equal length.",
    "outputFormat": "number，加權距離。",
    "outputFormatEn": "number.",
    "constraintsText": "三者等長。\nweights≥0。",
    "constraintsTextEn": "equal length; weights≥0.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            0,
            0
          ],
          [
            3,
            4
          ],
          [
            1,
            0.25
          ]
        ],
        "expected": 3.6055512755,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2
          ],
          [
            4,
            6
          ],
          [
            1,
            1
          ]
        ],
        "expected": 5.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            18,
            180,
            60,
            80
          ],
          [
            24,
            179,
            58,
            60
          ],
          [
            0.7,
            0.5,
            0.3,
            0.1
          ]
        ],
        "expected": 8.1792420187,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 4,
    "name": "cosine-similarity",
    "title": "計算餘弦相似度",
    "titleEn": "Cosine Similarity",
    "difficulty": 2,
    "category": "相似度",
    "categoryEn": "Similarity",
    "functionName": "cosine_similarity",
    "signature": [
      "a",
      "b"
    ],
    "statement": "餘弦相似度 = (a·b)/(‖a‖·‖b‖)，衡量兩向量方向的相似程度，範圍 −1~1。給定等長 a、b，回傳餘弦相似度。\n\n【計算示範】\na=[1,0], b=[1,1]：1/(1×√2)≈0.7071。",
    "statementEn": "Cosine similarity = (a·b)/(‖a‖‖b‖).\n\nExample:\n[1,0]&[1,1]\n→ ≈0.7071.",
    "inputFormat": "a,b: list[number]，等長、非零向量。",
    "inputFormatEn": "equal length, nonzero.",
    "outputFormat": "number，相似度。",
    "outputFormatEn": "number.",
    "constraintsText": "等長，範數非 0。",
    "constraintsTextEn": "equal length; nonzero norm.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            1,
            0
          ],
          [
            1,
            1
          ]
        ],
        "expected": 0.7071067812,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            1,
            2,
            3
          ],
          [
            2,
            4,
            6
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            1,
            1,
            0,
            1
          ],
          [
            0,
            1,
            1,
            1
          ]
        ],
        "expected": 0.6666666667,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 5,
    "name": "knn-predict",
    "title": "KNN 分類預測",
    "titleEn": "KNN Prediction",
    "difficulty": 2,
    "category": "相似度學習",
    "categoryEn": "Similarity Learning",
    "functionName": "knn_predict",
    "signature": [
      "train",
      "query",
      "k"
    ],
    "statement": "KNN：找出離 query 最近的 k 個訓練點，以其標籤多數決預測。train 每筆為 {\"point\":[...],\"label\":...}，距離用歐氏距離。多數決平手取字典序最小標籤。\n\n【計算示範】\nk=3，最近三點標籤為 A、A、B\n→ 預測 A。",
    "statementEn": "KNN: k nearest by Euclidean distance, majority label (ties→smallest).\n\nExample:\n3 nearest A,A,B\n→ A.",
    "inputFormat": "train: list[{point,label}]；query: list[number]；k: int>0。",
    "inputFormatEn": "train list; query; k.",
    "outputFormat": "標籤（預測類別）。",
    "outputFormatEn": "the predicted label.",
    "constraintsText": "k≤訓練點數。\n平手取字典序小者。",
    "constraintsTextEn": "k≤#train; ties→smallest.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            {
              "point": [
                1,
                1
              ],
              "label": "A"
            },
            {
              "point": [
                1,
                2
              ],
              "label": "A"
            },
            {
              "point": [
                5,
                5
              ],
              "label": "B"
            }
          ],
          [
            1,
            1.5
          ],
          3
        ],
        "expected": "A",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            {
              "point": [
                0
              ],
              "label": "L"
            },
            {
              "point": [
                10
              ],
              "label": "H"
            },
            {
              "point": [
                1
              ],
              "label": "L"
            }
          ],
          [
            2
          ],
          2
        ],
        "expected": "L",
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            {
              "point": [
                2,
                3
              ],
              "label": "x"
            },
            {
              "point": [
                3,
                3
              ],
              "label": "y"
            },
            {
              "point": [
                8,
                8
              ],
              "label": "y"
            },
            {
              "point": [
                2,
                2
              ],
              "label": "x"
            }
          ],
          [
            2.5,
            2.5
          ],
          3
        ],
        "expected": "x",
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 6,
    "name": "assign-centroid",
    "title": "指派最近群中心",
    "titleEn": "Assign to Nearest Centroid",
    "difficulty": 2,
    "category": "分群",
    "categoryEn": "Clustering",
    "functionName": "assign_to_nearest_centroid",
    "signature": [
      "points",
      "centroids"
    ],
    "statement": "K-means 的指派步驟。給定 points 與 centroids（皆為向量清單），對每個點回傳「最近群中心的索引」（歐氏距離；平手取索引小者）。回傳長度同 points 的索引清單。\n\n【計算示範】\n點1離中心0最近、點2離中心1最近\n→ [0,1]。",
    "statementEn": "Assign each point to nearest centroid index (Euclidean; ties→smallest index).\n\nExample:\n→ list of nearest centroid indices.",
    "inputFormat": "points,centroids: list[list[number]]。",
    "inputFormatEn": "points, centroids.",
    "outputFormat": "list[int]，每點的中心索引。",
    "outputFormatEn": "list[int].",
    "constraintsText": "點與中心維度相同。\n平手取索引小者。",
    "constraintsTextEn": "same dim; ties→smallest index.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              1
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ]
          ],
          [
            [
              1
            ],
            [
              7
            ]
          ]
        ],
        "expected": [
          0,
          1,
          1,
          1
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              0,
              0
            ],
            [
              5,
              5
            ],
            [
              1,
              1
            ]
          ],
          [
            [
              0,
              0
            ],
            [
              5,
              5
            ]
          ]
        ],
        "expected": [
          0,
          1,
          0
        ],
        "comparator": "exact",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              1
            ],
            [
              5
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ],
            [
              20
            ]
          ],
          [
            [
              1
            ],
            [
              7
            ]
          ]
        ],
        "expected": [
          0,
          1,
          1,
          1,
          1,
          1
        ],
        "comparator": "exact",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 7,
    "name": "recompute-centroids",
    "title": "重新計算群中心",
    "titleEn": "Recompute Centroids",
    "difficulty": 2,
    "category": "分群",
    "categoryEn": "Clustering",
    "functionName": "recompute_centroids",
    "signature": [
      "points",
      "assignments",
      "k"
    ],
    "statement": "K-means 的更新步驟。給定 points、每點的群索引 assignments 與群數 k，回傳每群成員的座標平均（新的群中心）。回傳長度 k 的中心清單。\n\n【計算示範】\n群0={1,5,7}→中心(1+5+7)/3=4.3333；群1={8,12}→中心10\n→ [[4.3333],[10]]。",
    "statementEn": "Recompute each centroid as the mean of its assigned points. Return k centroids.\n\nExample:\ncluster means.",
    "inputFormat": "points: list[list[number]]；assignments: list[int]；k: int。",
    "inputFormatEn": "points; assignments; k.",
    "outputFormat": "list[list[number]]，k 個中心。",
    "outputFormatEn": "list of k centroids.",
    "constraintsText": "每群至少一個成員。",
    "constraintsTextEn": "each cluster nonempty.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              1
            ],
            [
              5
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ]
          ],
          [
            0,
            0,
            0,
            1,
            1
          ],
          2
        ],
        "expected": [
          [
            4.3333333333
          ],
          [
            10.0
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              0,
              0
            ],
            [
              2,
              2
            ],
            [
              10,
              10
            ]
          ],
          [
            0,
            0,
            1
          ],
          2
        ],
        "expected": [
          [
            1.0,
            1.0
          ],
          [
            10.0,
            10.0
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              1
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ],
            [
              20
            ]
          ],
          [
            0,
            1,
            1,
            1,
            1
          ],
          2
        ],
        "expected": [
          [
            1.0
          ],
          [
            11.75
          ]
        ],
        "comparator": "deepNumber",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 8,
    "name": "kmeans-sse",
    "title": "計算 K-means SSE",
    "titleEn": "K-means SSE",
    "difficulty": 3,
    "category": "分群",
    "categoryEn": "Clustering",
    "functionName": "kmeans_sse",
    "signature": [
      "points",
      "centroids"
    ],
    "statement": "K-means 的品質指標 SSE（群內平方和）＝每個點到最近群中心的距離平方總和。給定 points 與 centroids，回傳 SSE = Σ min_c ‖point − c‖²。\n\n【計算示範】\n點各自最近中心距離為 0,1,2\n→ SSE=0+1+4=5。",
    "statementEn": "SSE = Σ over points of (distance to nearest centroid)².\n\nExample:\n→ 5.",
    "inputFormat": "points,centroids: list[list[number]]。",
    "inputFormatEn": "points, centroids.",
    "outputFormat": "number，SSE。",
    "outputFormatEn": "number.",
    "constraintsText": "維度相同。",
    "constraintsTextEn": "same dim.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              1
            ],
            [
              5
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ]
          ],
          [
            [
              4.333333333333333
            ],
            [
              9
            ]
          ]
        ],
        "expected": 25.5555555556,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              0,
              0
            ],
            [
              3,
              4
            ]
          ],
          [
            [
              0,
              0
            ],
            [
              3,
              4
            ]
          ]
        ],
        "expected": 0.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              1
            ],
            [
              5
            ],
            [
              7
            ],
            [
              8
            ],
            [
              12
            ],
            [
              20
            ]
          ],
          [
            [
              1
            ],
            [
              8
            ]
          ]
        ],
        "expected": 170.0,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 9,
    "index": 9,
    "name": "single-linkage",
    "title": "階層式分群單一連結距離",
    "titleEn": "Single-Linkage Distance",
    "difficulty": 3,
    "category": "階層式分群",
    "categoryEn": "Hierarchical Clustering",
    "functionName": "single_linkage_distance",
    "signature": [
      "cluster_a",
      "cluster_b"
    ],
    "statement": "階層式分群的單一連結(single-linkage)距離＝兩群中「最近的一對點」的距離。給定 cluster_a、cluster_b（皆為點清單），回傳兩群間所有跨群點對的最小歐氏距離。\n\n【計算示範】\nA={[0,0]}, B={[3,4],[1,1]}：距離 5 與 √2≈1.414，取最小\n→ 1.4142。",
    "statementEn": "Single-linkage = min Euclidean distance between any point in A and any point in B.\n\nExample:\n→ min pairwise ≈1.4142.",
    "inputFormat": "cluster_a,cluster_b: list[list[number]]。",
    "inputFormatEn": "two clusters of points.",
    "outputFormat": "number，單一連結距離。",
    "outputFormatEn": "number.",
    "constraintsText": "兩群非空、維度相同。",
    "constraintsTextEn": "nonempty; same dim.",
    "tests": [
      {
        "name": "Sample 1",
        "visibility": "public",
        "args": [
          [
            [
              0,
              0
            ]
          ],
          [
            [
              3,
              4
            ],
            [
              1,
              1
            ]
          ]
        ],
        "expected": 1.4142135624,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Sample 2",
        "visibility": "public",
        "args": [
          [
            [
              0
            ],
            [
              2
            ]
          ],
          [
            [
              5
            ],
            [
              9
            ]
          ]
        ],
        "expected": 3.0,
        "comparator": "number",
        "points": 1
      },
      {
        "name": "Hidden 1",
        "visibility": "hidden",
        "args": [
          [
            [
              1,
              1
            ],
            [
              2,
              2
            ]
          ],
          [
            [
              5,
              5
            ],
            [
              2,
              3
            ]
          ]
        ],
        "expected": 1.0,
        "comparator": "number",
        "points": 1
      }
    ]
  },
  {
    "week": 10, "index": 1, "name": "big-parks",
    "title": "篩選大型公園", "titleEn": "Filter Large Parks",
    "difficulty": 1, "category": "資料篩選（pandas）", "categoryEn": "Data Filtering (pandas)",
    "functionName": "big_parks", "signature": ["park"], "kind": "pandas",
    "statement": "park 是一張表（list[dict]），每列有 park_id、name、area、annual_visitors。請用 pandas 找出「面積 area ≥ 3000000 或 年訪客 annual_visitors ≥ 25000000」的公園，回傳只含 name、annual_visitors、area 三欄的表（列的順序不限）。\n\n【計算示範】\nA：area=3200000 → 面積達標，列入；B：area=1000000 但 annual_visitors=26000000 → 訪客達標，列入；C：兩者皆不足 → 不列入。\n\n提示：pd、np 已載入，可直接使用、不需 import；用 pd.DataFrame(park) 轉成表。",
    "statementEn": "park is a table (list[dict]) with park_id, name, area, annual_visitors. Using pandas, return parks whose area >= 3000000 OR annual_visitors >= 25000000, keeping only columns name, annual_visitors, area (row order does not matter).\n\nExample: area=3200000 qualifies; area=1000000 but visitors=26000000 also qualifies; neither excluded.\n\nNote: pd and np are preloaded (no import needed); use pd.DataFrame(park).",
    "inputFormat": "park: list[dict]，每列含 park_id, name, area, annual_visitors。",
    "inputFormatEn": "park: list[dict] with park_id, name, area, annual_visitors.",
    "outputFormat": "回傳表（DataFrame 或 list[dict]），只含 name, annual_visitors, area 三欄；列順序不限。",
    "outputFormatEn": "A table with only name, annual_visitors, area; any row order.",
    "constraintsText": "條件是「或」：面積或訪客任一達標即列入。\n不需載入任何檔案，park 已是參數。",
    "constraintsTextEn": "Condition is OR: qualifies if either meets the threshold.\nNo file loading; park is the argument.",
    "starterCode": "def big_parks(park):\n    # pd、np 已可直接使用（不需 import）\n    df = pd.DataFrame(park)\n    # TODO: 篩選並回傳 name, annual_visitors, area 三欄\n    pass\n",
    "tests": [
      {"name":"Sample 1","visibility":"public","comparator":"table","args":[[{"park_id":1,"name":"Alpha","area":3200000,"annual_visitors":10000000},{"park_id":2,"name":"Beta","area":1000000,"annual_visitors":26000000},{"park_id":3,"name":"Gamma","area":500000,"annual_visitors":9000000}]],"expected":[{"name":"Alpha","annual_visitors":10000000,"area":3200000},{"name":"Beta","annual_visitors":26000000,"area":1000000}]},
      {"name":"Sample 2","visibility":"public","comparator":"table","args":[[{"park_id":10,"name":"Lake","area":3000000,"annual_visitors":100},{"park_id":11,"name":"Hill","area":2999999,"annual_visitors":24999999}]],"expected":[{"name":"Lake","annual_visitors":100,"area":3000000}]},
      {"name":"Hidden 1","visibility":"hidden","comparator":"table","args":[[{"park_id":5,"name":"P1","area":9999999,"annual_visitors":0},{"park_id":6,"name":"P2","area":1,"annual_visitors":25000000},{"park_id":7,"name":"P3","area":2,"annual_visitors":3}]],"expected":[{"name":"P1","annual_visitors":0,"area":9999999},{"name":"P2","annual_visitors":25000000,"area":1}]}
    ]
  },
  {
    "week": 10, "index": 2, "name": "top-ordering-customer",
    "title": "下單最多的顧客", "titleEn": "Top Ordering Customer",
    "difficulty": 1, "category": "分組聚合（pandas）", "categoryEn": "Aggregation (pandas)",
    "functionName": "top_ordering_customer", "signature": ["orders"], "kind": "pandas",
    "statement": "orders 是訂單表，每列有 order_number、customer_number。請回傳「下單筆數最多」的 customer_number（本題保證答案唯一）。\n\n【計算示範】\n顧客 7 有 3 筆、顧客 5 有 1 筆 → 回傳 7。\n\n提示：pd 已載入；可用 value_counts() 或 groupby 計數。回傳整數。",
    "statementEn": "orders has order_number, customer_number. Return the customer_number with the most orders (unique answer).\n\nExample: customer 7 has 3, customer 5 has 1 → return 7.\n\nNote: pd is preloaded; value_counts() or groupby works. Return an integer.",
    "inputFormat": "orders: list[dict]，每列含 order_number, customer_number。",
    "inputFormatEn": "orders: list[dict] with order_number, customer_number.",
    "outputFormat": "回傳整數：下單最多的 customer_number。",
    "outputFormatEn": "An integer: the customer_number with the most orders.",
    "constraintsText": "答案唯一（下單最多的顧客只有一位）。\n回傳整數（int）。",
    "constraintsTextEn": "Answer is unique.\nReturn an int.",
    "starterCode": "def top_ordering_customer(orders):\n    df = pd.DataFrame(orders)\n    # TODO: 回傳下單最多的 customer_number（整數）\n    pass\n",
    "tests": [
      {"name":"Sample 1","visibility":"public","comparator":"number","args":[[{"order_number":1,"customer_number":7},{"order_number":2,"customer_number":7},{"order_number":3,"customer_number":5},{"order_number":4,"customer_number":7}]],"expected":7},
      {"name":"Sample 2","visibility":"public","comparator":"number","args":[[{"order_number":1,"customer_number":3},{"order_number":2,"customer_number":9},{"order_number":3,"customer_number":9}]],"expected":9},
      {"name":"Hidden 1","visibility":"hidden","comparator":"number","args":[[{"order_number":1,"customer_number":100},{"order_number":2,"customer_number":100},{"order_number":3,"customer_number":100},{"order_number":4,"customer_number":42},{"order_number":5,"customer_number":42}]],"expected":100}
    ]
  },
  {
    "week": 10, "index": 3, "name": "unique-subjects-per-teacher",
    "title": "每位講師的不重複科目數", "titleEn": "Distinct Subjects per Teacher",
    "difficulty": 1, "category": "分組聚合（pandas）", "categoryEn": "Aggregation (pandas)",
    "functionName": "unique_subjects_per_teacher", "signature": ["teacher"], "kind": "pandas",
    "statement": "teacher 表每列有 teacher_id、subject_id、dept_id（同一科目可能在不同系所各出現一次）。請回傳每位 teacher_id 教授的「不重複科目數」，欄位為 teacher_id 與 cnt（列順序不限）。\n\n【計算示範】\n講師 1 教 {10,10,20} → 不重複科目 2 種 → cnt=2。\n\n提示：pd 已載入；可用 groupby(...)[...].nunique()。",
    "statementEn": "teacher has teacher_id, subject_id, dept_id (a subject may appear under different departments). Return the number of DISTINCT subjects per teacher_id, columns teacher_id and cnt (any row order).\n\nExample: teacher 1 teaches {10,10,20} → 2 distinct → cnt=2.\n\nNote: pd is preloaded; groupby(...)[...].nunique() works.",
    "inputFormat": "teacher: list[dict]，每列含 teacher_id, subject_id, dept_id。",
    "inputFormatEn": "teacher: list[dict] with teacher_id, subject_id, dept_id.",
    "outputFormat": "回傳表，欄位 teacher_id、cnt；列順序不限。",
    "outputFormatEn": "A table with columns teacher_id, cnt; any row order.",
    "constraintsText": "同一科目在不同 dept 只算一次（用不重複計數 nunique）。",
    "constraintsTextEn": "Count each subject once even across departments (use nunique).",
    "starterCode": "def unique_subjects_per_teacher(teacher):\n    df = pd.DataFrame(teacher)\n    # TODO: 回傳 teacher_id 與 cnt（不重複科目數）\n    pass\n",
    "tests": [
      {"name":"Sample 1","visibility":"public","comparator":"table","args":[[{"teacher_id":1,"subject_id":10,"dept_id":1},{"teacher_id":1,"subject_id":10,"dept_id":2},{"teacher_id":1,"subject_id":20,"dept_id":1},{"teacher_id":2,"subject_id":30,"dept_id":1}]],"expected":[{"teacher_id":1,"cnt":2},{"teacher_id":2,"cnt":1}]},
      {"name":"Sample 2","visibility":"public","comparator":"table","args":[[{"teacher_id":5,"subject_id":1,"dept_id":1}]],"expected":[{"teacher_id":5,"cnt":1}]},
      {"name":"Hidden 1","visibility":"hidden","comparator":"table","args":[[{"teacher_id":3,"subject_id":1,"dept_id":1},{"teacher_id":3,"subject_id":2,"dept_id":1},{"teacher_id":3,"subject_id":3,"dept_id":1},{"teacher_id":4,"subject_id":9,"dept_id":2},{"teacher_id":4,"subject_id":9,"dept_id":3}]],"expected":[{"teacher_id":3,"cnt":3},{"teacher_id":4,"cnt":1}]}
    ]
  },
  {
    "week": 10,
    "index": 4,
    "name": "green-products",
    "title": "篩選有機且可分解的產品",
    "titleEn": "Organic & Biodegradable Products",
    "difficulty": 1,
    "category": "資料篩選（pandas）",
    "categoryEn": "Data Filtering (pandas)",
    "functionName": "green_products",
    "signature": ["product"],
    "kind": "pandas",
    "statement": "product 表每列有 product_id、is_organic、is_biodegradable（值為 'Y' 或 'N'）。回傳「兩者皆為 'Y'」的 product_id（只含 product_id 一欄，順序不限）。\n\n提示：pd 已載入；用 & 串接兩個布林條件。",
    "statementEn": "product has product_id, is_organic, is_biodegradable ('Y'/'N'). Return product_id where both are 'Y' (one column, any order).",
    "inputFormat": "product: list[dict]，含 product_id, is_organic, is_biodegradable。",
    "inputFormatEn": "product: list[dict] with product_id, is_organic, is_biodegradable.",
    "outputFormat": "回傳只含 product_id 一欄的表；順序不限。",
    "outputFormatEn": "A table with only product_id; any order.",
    "constraintsText": "兩條件用「且」。",
    "constraintsTextEn": "Both conditions with AND.",
    "starterCode": "def green_products(product):\n    df = pd.DataFrame(product)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"product_id": 1, "is_organic": "Y", "is_biodegradable": "Y"}, {"product_id": 2, "is_organic": "Y", "is_biodegradable": "N"}, {"product_id": 3, "is_organic": "N", "is_biodegradable": "Y"}]], "expected": [{"product_id": 1}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"product_id": 10, "is_organic": "Y", "is_biodegradable": "Y"}, {"product_id": 11, "is_organic": "Y", "is_biodegradable": "Y"}]], "expected": [{"product_id": 10}, {"product_id": 11}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"product_id": 7, "is_organic": "N", "is_biodegradable": "N"}, {"product_id": 8, "is_organic": "Y", "is_biodegradable": "Y"}, {"product_id": 9, "is_organic": "N", "is_biodegradable": "Y"}]], "expected": [{"product_id": 8}]}
    ]
  },
  {
    "week": 10,
    "index": 5,
    "name": "members-never-borrow",
    "title": "從未借書的會員",
    "titleEn": "Members Who Never Borrowed",
    "difficulty": 1,
    "category": "資料篩選（pandas）",
    "categoryEn": "Data Filtering (pandas)",
    "functionName": "members_never_borrow",
    "signature": ["members", "loans"],
    "kind": "pandas",
    "statement": "members 表有 member_id、name；loans 表有 loan_id、member_id。回傳「從未出現在 loans」的會員 name（只含 name 一欄，順序不限）。\n\n提示：用 ~isin(...) 做反向篩選。",
    "statementEn": "members has member_id, name; loans has loan_id, member_id. Return name of members never in loans (one column, any order).",
    "inputFormat": "members、loans 皆為 list[dict]。",
    "inputFormatEn": "members and loans are list[dict].",
    "outputFormat": "回傳只含 name 一欄的表。",
    "outputFormatEn": "A table with only name.",
    "constraintsText": "以 member_id 判斷是否借過。",
    "constraintsTextEn": "Match by member_id.",
    "starterCode": "def members_never_borrow(members, loans):\n    m = pd.DataFrame(members)\n    l = pd.DataFrame(loans)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"member_id": 1, "name": "Amy"}, {"member_id": 2, "name": "Bob"}, {"member_id": 3, "name": "Cara"}], [{"loan_id": 1, "member_id": 1}, {"loan_id": 2, "member_id": 1}]], "expected": [{"name": "Bob"}, {"name": "Cara"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"member_id": 5, "name": "Dan"}, {"member_id": 6, "name": "Eve"}], [{"loan_id": 9, "member_id": 6}]], "expected": [{"name": "Dan"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"member_id": 1, "name": "A"}, {"member_id": 2, "name": "B"}, {"member_id": 3, "name": "C"}, {"member_id": 4, "name": "D"}], [{"loan_id": 1, "member_id": 2}, {"loan_id": 2, "member_id": 4}]], "expected": [{"name": "A"}, {"name": "C"}]}
    ]
  },
  {
    "week": 10,
    "index": 6,
    "name": "self-view-creators",
    "title": "看自己影片的創作者",
    "titleEn": "Creators Who Viewed Themselves",
    "difficulty": 1,
    "category": "資料篩選（pandas）",
    "categoryEn": "Data Filtering (pandas)",
    "functionName": "self_view_creators",
    "signature": ["views"],
    "kind": "pandas",
    "statement": "views 表有 video_id、creator_id、viewer_id、view_date。找出「creator_id == viewer_id」的 id，去重、由小到大排序，欄名為 id。\n\n提示：篩選後取該欄、去重、排序;欄位順序需照題目(此題需排序)。",
    "statementEn": "views has video_id, creator_id, viewer_id, view_date. Return ids where creator_id == viewer_id, distinct and ascending, column named id.",
    "inputFormat": "views: list[dict]。",
    "inputFormatEn": "views: list[dict].",
    "outputFormat": "回傳一欄 id，去重且升冪排序。",
    "outputFormatEn": "One column id, distinct and ascending.",
    "constraintsText": "需去重、需升冪排序。",
    "constraintsTextEn": "Distinct and ascending.",
    "starterCode": "def self_view_creators(views):\n    df = pd.DataFrame(views)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"video_id": 1, "creator_id": 9, "viewer_id": 9, "view_date": "2025-01-01"}, {"video_id": 2, "creator_id": 9, "viewer_id": 5, "view_date": "2025-01-02"}, {"video_id": 3, "creator_id": 3, "viewer_id": 3, "view_date": "2025-01-03"}]], "expected": [{"id": 3}, {"id": 9}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"video_id": 1, "creator_id": 2, "viewer_id": 7, "view_date": "2025-01-01"}]], "expected": []},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"video_id": 1, "creator_id": 8, "viewer_id": 8, "view_date": "d"}, {"video_id": 2, "creator_id": 1, "viewer_id": 1, "view_date": "d"}, {"video_id": 3, "creator_id": 8, "viewer_id": 8, "view_date": "d"}, {"video_id": 4, "creator_id": 5, "viewer_id": 6, "view_date": "d"}]], "expected": [{"id": 1}, {"id": 8}]}
    ]
  },
  {
    "week": 10,
    "index": 7,
    "name": "long-comments",
    "title": "過長的留言",
    "titleEn": "Long Comments",
    "difficulty": 1,
    "category": "字串處理（pandas）",
    "categoryEn": "String Methods (pandas)",
    "functionName": "long_comments",
    "signature": ["comments"],
    "kind": "pandas",
    "statement": "comments 表有 comment_id、content。回傳 content 長度大於 15 的 comment_id（只含 comment_id，順序不限）。\n\n提示：用 str.len()。",
    "statementEn": "comments has comment_id, content. Return comment_id where len(content) > 15 (one column, any order).",
    "inputFormat": "comments: list[dict]。",
    "inputFormatEn": "comments: list[dict].",
    "outputFormat": "回傳只含 comment_id 一欄。",
    "outputFormatEn": "A table with only comment_id.",
    "constraintsText": "長度嚴格大於 15。",
    "constraintsTextEn": "Length strictly greater than 15.",
    "starterCode": "def long_comments(comments):\n    df = pd.DataFrame(comments)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"comment_id": 1, "content": "nice"}, {"comment_id": 2, "content": "this is a very long comment"}, {"comment_id": 3, "content": "exactly fifteen"}]], "expected": [{"comment_id": 2}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"comment_id": 5, "content": "0123456789abcdef"}, {"comment_id": 6, "content": "short"}]], "expected": [{"comment_id": 5}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"comment_id": 1, "content": "aaaaaaaaaaaaaaaaaaa"}, {"comment_id": 2, "content": "tiny"}, {"comment_id": 3, "content": "123456789012345"}]], "expected": [{"comment_id": 1}]}
    ]
  },
  {
    "week": 10,
    "index": 8,
    "name": "year-end-bonus",
    "title": "年終獎金",
    "titleEn": "Year-End Bonus",
    "difficulty": 1,
    "category": "字串處理（pandas）",
    "categoryEn": "String Methods (pandas)",
    "functionName": "year_end_bonus",
    "signature": ["employees"],
    "kind": "pandas",
    "statement": "employees 表有 employee_id、name、salary。若 employee_id 為奇數「且」name 開頭不是 'M'，bonus = salary，否則 bonus = 0。回傳 employee_id、bonus，依 employee_id 升冪排序。\n\n提示：用 % 判斷奇數、name.str[0] 取首字。",
    "statementEn": "employees has employee_id, name, salary. If employee_id is odd AND name does not start with 'M', bonus = salary, else 0. Return employee_id, bonus sorted by employee_id asc.",
    "inputFormat": "employees: list[dict]。",
    "inputFormatEn": "employees: list[dict].",
    "outputFormat": "回傳 employee_id、bonus，依編號升冪。",
    "outputFormatEn": "Return employee_id, bonus sorted by id asc.",
    "constraintsText": "奇數且非 M 開頭才給獎金。",
    "constraintsTextEn": "Bonus only if odd id and name not starting with M.",
    "starterCode": "def year_end_bonus(employees):\n    df = pd.DataFrame(employees)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"employee_id": 1, "name": "Alice", "salary": 1000}, {"employee_id": 2, "name": "Bob", "salary": 2000}, {"employee_id": 3, "name": "Mia", "salary": 3000}]], "expected": [{"employee_id": 1, "bonus": 1000}, {"employee_id": 2, "bonus": 0}, {"employee_id": 3, "bonus": 0}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"employee_id": 5, "name": "Ken", "salary": 500}]], "expected": [{"employee_id": 5, "bonus": 500}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"employee_id": 7, "name": "Max", "salary": 700}, {"employee_id": 8, "name": "Ann", "salary": 800}, {"employee_id": 9, "name": "Ivy", "salary": 900}]], "expected": [{"employee_id": 7, "bonus": 0}, {"employee_id": 8, "bonus": 0}, {"employee_id": 9, "bonus": 900}]}
    ]
  },
  {
    "week": 10,
    "index": 9,
    "name": "fix-student-names",
    "title": "修正學生姓名大小寫",
    "titleEn": "Fix Student Names",
    "difficulty": 1,
    "category": "字串處理（pandas）",
    "categoryEn": "String Methods (pandas)",
    "functionName": "fix_student_names",
    "signature": ["students"],
    "kind": "pandas",
    "statement": "students 表有 student_id、name。把 name 改成「首字大寫、其餘小寫」，回傳 student_id、name，依 student_id 升冪排序。\n\n提示：用 str.capitalize()。",
    "statementEn": "students has student_id, name. Convert name to first letter uppercase, rest lowercase. Return student_id, name sorted by student_id asc.",
    "inputFormat": "students: list[dict]。",
    "inputFormatEn": "students: list[dict].",
    "outputFormat": "回傳 student_id、name，依編號升冪。",
    "outputFormatEn": "Return student_id, name sorted by id asc.",
    "constraintsText": "只改大小寫，不改內容。",
    "constraintsTextEn": "Only change case.",
    "starterCode": "def fix_student_names(students):\n    df = pd.DataFrame(students)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"student_id": 1, "name": "aLICE"}, {"student_id": 2, "name": "BOB"}]], "expected": [{"student_id": 1, "name": "Alice"}, {"student_id": 2, "name": "Bob"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"student_id": 3, "name": "cARA"}]], "expected": [{"student_id": 3, "name": "Cara"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"student_id": 5, "name": "eVe"}, {"student_id": 4, "name": "DAN"}]], "expected": [{"student_id": 4, "name": "Dan"}, {"student_id": 5, "name": "Eve"}]}
    ]
  },
  {
    "week": 10,
    "index": 10,
    "name": "valid-school-emails",
    "title": "有效的校園信箱",
    "titleEn": "Valid School Emails",
    "difficulty": 2,
    "category": "字串處理（pandas）",
    "categoryEn": "String Methods (pandas)",
    "functionName": "valid_school_emails",
    "signature": ["users"],
    "kind": "pandas",
    "statement": "users 表有 user_id、email。有效信箱規則：本地部分以「英文字母」開頭，其後可為 英數字/底線/點/減號，網域固定為 @school.edu。回傳有效的整列（user_id、email），順序不限。\n\n提示：用 str.match 搭配正規表達式(記得整體錨定)。",
    "statementEn": "users has user_id, email. Valid: local part starts with a letter, then letters/digits/_/./-, domain exactly @school.edu. Return valid rows (user_id, email), any order.",
    "inputFormat": "users: list[dict]。",
    "inputFormatEn": "users: list[dict].",
    "outputFormat": "回傳有效的列（user_id、email）。",
    "outputFormatEn": "Return valid rows (user_id, email).",
    "constraintsText": "需完整比對整個字串。",
    "constraintsTextEn": "Match the whole string.",
    "starterCode": "def valid_school_emails(users):\n    df = pd.DataFrame(users)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"user_id": 1, "email": "amy@school.edu"}, {"user_id": 2, "email": "1bad@school.edu"}, {"user_id": 3, "email": "tom@other.edu"}]], "expected": [{"user_id": 1, "email": "amy@school.edu"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"user_id": 5, "email": "a.b-c_9@school.edu"}, {"user_id": 6, "email": "@school.edu"}]], "expected": [{"user_id": 5, "email": "a.b-c_9@school.edu"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"user_id": 7, "email": "Kate@school.edu"}, {"user_id": 8, "email": "kate@school.edu.tw"}, {"user_id": 9, "email": "k#y@school.edu"}]], "expected": [{"user_id": 7, "email": "Kate@school.edu"}]}
    ]
  },
  {
    "week": 10,
    "index": 11,
    "name": "patients-diab1",
    "title": "第一型糖尿病患者",
    "titleEn": "Type-1 Diabetes Patients",
    "difficulty": 2,
    "category": "字串處理（pandas）",
    "categoryEn": "String Methods (pandas)",
    "functionName": "patients_diab1",
    "signature": ["patients"],
    "kind": "pandas",
    "statement": "patients 表有 patient_id、name、conditions（以空白分隔的代碼字串）。找出「有任一代碼以 DIAB1 為字首（該代碼的開頭）」的病患，回傳整列（patient_id、name、conditions），順序不限。\n\n提示：條件代碼是獨立單字;用 str.contains 搭配邊界，例如 (^| )DIAB1。",
    "statementEn": "patients has patient_id, name, conditions (space-separated codes). Return patients having a code that STARTS with DIAB1 (a whole code beginning with DIAB1). Return full rows, any order.",
    "inputFormat": "patients: list[dict]。",
    "inputFormatEn": "patients: list[dict].",
    "outputFormat": "回傳整列（patient_id、name、conditions）。",
    "outputFormatEn": "Return full rows.",
    "constraintsText": "DIAB1 需為某個代碼的字首（不是出現在代碼中間）。",
    "constraintsTextEn": "DIAB1 must begin a code, not appear mid-code.",
    "starterCode": "def patients_diab1(patients):\n    df = pd.DataFrame(patients)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"patient_id": 1, "name": "A", "conditions": "DIAB100 X"}, {"patient_id": 2, "name": "B", "conditions": "YDIAB1"}, {"patient_id": 3, "name": "C", "conditions": "ACNE"}]], "expected": [{"patient_id": 1, "name": "A", "conditions": "DIAB100 X"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"patient_id": 5, "name": "D", "conditions": "HYP DIAB1"}]], "expected": [{"patient_id": 5, "name": "D", "conditions": "HYP DIAB1"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"patient_id": 7, "name": "E", "conditions": "DIAB1"}, {"patient_id": 8, "name": "F", "conditions": "ZDIAB1 DIAB2"}, {"patient_id": 9, "name": "G", "conditions": "COLD DIAB199"}]], "expected": [{"patient_id": 7, "name": "E", "conditions": "DIAB1"}, {"patient_id": 9, "name": "G", "conditions": "COLD DIAB199"}]}
    ]
  },
  {
    "week": 10,
    "index": 12,
    "name": "nth-highest-score",
    "title": "第 N 高的分數",
    "titleEn": "Nth Highest Score",
    "difficulty": 2,
    "category": "資料處理（pandas）",
    "categoryEn": "Data Manipulation (pandas)",
    "functionName": "nth_highest_score",
    "signature": ["scores", "N"],
    "kind": "pandas",
    "statement": "scores 表有 id、score。回傳「第 N 高的不重複分數」；若不存在(不重複分數不足 N 個)則回傳 None。\n\n提示：先去重、由大到小排序，取第 N 個(N 從 1 起算)。",
    "statementEn": "scores has id, score. Return the Nth highest DISTINCT score; if it does not exist, return None.",
    "inputFormat": "scores: list[dict]；N: int。",
    "inputFormatEn": "scores: list[dict]; N: int.",
    "outputFormat": "回傳數值或 None（第 N 高的不重複分數）。",
    "outputFormatEn": "A number or None.",
    "constraintsText": "分數需去重;N 可能大於不重複分數個數(回 None)。",
    "constraintsTextEn": "Distinct scores; N may exceed count (return None).",
    "starterCode": "def nth_highest_score(scores, N):\n    df = pd.DataFrame(scores)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "exact", "args": [[{"id": 1, "score": 90}, {"id": 2, "score": 90}, {"id": 3, "score": 80}, {"id": 4, "score": 70}], 2], "expected": 80},
      {"name": "Sample 2", "visibility": "public", "comparator": "exact", "args": [[{"id": 1, "score": 50}, {"id": 2, "score": 50}], 2], "expected": null},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "exact", "args": [[{"id": 1, "score": 10}, {"id": 2, "score": 20}, {"id": 3, "score": 30}], 1], "expected": 30}
    ]
  },
  {
    "week": 10,
    "index": 13,
    "name": "second-highest-price",
    "title": "第二高的房價",
    "titleEn": "Second Highest Price",
    "difficulty": 1,
    "category": "資料處理（pandas）",
    "categoryEn": "Data Manipulation (pandas)",
    "functionName": "second_highest_price",
    "signature": ["house"],
    "kind": "pandas",
    "statement": "house 表有 id、price。回傳「第二高的不重複房價」；若不存在則回傳 None。\n\n提示：去重、排序、取第 2 個。",
    "statementEn": "house has id, price. Return the second highest DISTINCT price; None if it does not exist.",
    "inputFormat": "house: list[dict]。",
    "inputFormatEn": "house: list[dict].",
    "outputFormat": "回傳數值或 None。",
    "outputFormatEn": "A number or None.",
    "constraintsText": "房價需去重。",
    "constraintsTextEn": "Distinct prices.",
    "starterCode": "def second_highest_price(house):\n    df = pd.DataFrame(house)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "exact", "args": [[{"id": 1, "price": 100}, {"id": 2, "price": 200}, {"id": 3, "price": 200}, {"id": 4, "price": 150}]], "expected": 150},
      {"name": "Sample 2", "visibility": "public", "comparator": "exact", "args": [[{"id": 1, "price": 50}]], "expected": null},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "exact", "args": [[{"id": 1, "price": 9}, {"id": 2, "price": 9}, {"id": 3, "price": 3}]], "expected": 3}
    ]
  },
  {
    "week": 10,
    "index": 14,
    "name": "flatten-channel-prices",
    "title": "攤平通路價格",
    "titleEn": "Flatten Channel Prices",
    "difficulty": 2,
    "category": "資料處理（pandas）",
    "categoryEn": "Data Manipulation (pandas)",
    "functionName": "flatten_channel_prices",
    "signature": ["products"],
    "kind": "pandas",
    "statement": "products 表有 product_id、channel_A、channel_B、channel_C（某通路可能為 None）。把寬表轉成長表，輸出 product_id、channel、price 三欄；price 為 None 的組合略過不輸出。channel 值用 'channel_A'/'channel_B'/'channel_C'。順序不限。\n\n提示：用 melt。",
    "statementEn": "products has product_id, channel_A, channel_B, channel_C (may be None). Unpivot to long form: product_id, channel, price; skip rows whose price is None. channel is 'channel_A'/'channel_B'/'channel_C'. Any order.",
    "inputFormat": "products: list[dict]。",
    "inputFormatEn": "products: list[dict].",
    "outputFormat": "回傳 product_id、channel、price；略過 price 為 None 者。",
    "outputFormatEn": "Return product_id, channel, price; skip None prices.",
    "constraintsText": "None 的價格不輸出。",
    "constraintsTextEn": "Do not output None prices.",
    "starterCode": "def flatten_channel_prices(products):\n    df = pd.DataFrame(products)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"product_id": 1, "channel_A": 100, "channel_B": null, "channel_C": 200}]], "expected": [{"product_id": 1, "channel": "channel_A", "price": 100}, {"product_id": 1, "channel": "channel_C", "price": 200}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"product_id": 2, "channel_A": null, "channel_B": null, "channel_C": null}, {"product_id": 3, "channel_A": 5, "channel_B": 6, "channel_C": 7}]], "expected": [{"product_id": 3, "channel": "channel_A", "price": 5}, {"product_id": 3, "channel": "channel_B", "price": 6}, {"product_id": 3, "channel": "channel_C", "price": 7}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"product_id": 9, "channel_A": null, "channel_B": 50, "channel_C": null}]], "expected": [{"product_id": 9, "channel": "channel_B", "price": 50}]}
    ]
  },
  {
    "week": 10,
    "index": 15,
    "name": "contest-ranking",
    "title": "競賽名次（同分同名次）",
    "titleEn": "Contest Ranking (dense)",
    "difficulty": 2,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "contest_ranking",
    "signature": ["results"],
    "kind": "pandas",
    "statement": "results 表有 id、points。依 points 由高到低給名次:同分同名次、名次連續不跳號(dense)。回傳 points、rank，依 points 由高到低排序。\n\n提示：用 rank(method='dense', ascending=False)。",
    "statementEn": "results has id, points. Rank by points descending; same points share a rank and ranks are consecutive (dense). Return points, rank sorted by points desc.",
    "inputFormat": "results: list[dict]。",
    "inputFormatEn": "results: list[dict].",
    "outputFormat": "回傳 points、rank(整數)，依 points 由高到低。",
    "outputFormatEn": "Return points, rank (int) sorted by points desc.",
    "constraintsText": "同分同名次;名次不跳號。",
    "constraintsTextEn": "Ties share rank; no gaps.",
    "starterCode": "def contest_ranking(results):\n    df = pd.DataFrame(results)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "points": 90}, {"id": 2, "points": 90}, {"id": 3, "points": 80}, {"id": 4, "points": 70}]], "expected": [{"points": 90, "rank": 1}, {"points": 90, "rank": 1}, {"points": 80, "rank": 2}, {"points": 70, "rank": 3}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "points": 5}]], "expected": [{"points": 5, "rank": 1}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 1, "points": 10}, {"id": 2, "points": 30}, {"id": 3, "points": 30}, {"id": 4, "points": 20}]], "expected": [{"points": 30, "rank": 1}, {"points": 30, "rank": 1}, {"points": 20, "rank": 2}, {"points": 10, "rank": 3}]}
    ]
  },
  {
    "week": 10,
    "index": 16,
    "name": "income-category-counts",
    "title": "收入級距人數（含 0）",
    "titleEn": "Income Category Counts",
    "difficulty": 2,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "income_category_counts",
    "signature": ["accounts"],
    "kind": "pandas",
    "statement": "accounts 表有 account_id、income。分三級：Low(<20000)、Average(20000~50000 含端點)、High(>50000)。回傳每一級的 category、accounts_count;某級為 0 也要列出(三級都要出現)。順序不限。\n\n提示：先分箱，再對三個固定類別計數(缺的補 0)。",
    "statementEn": "accounts has account_id, income. Bins: Low(<20000), Average(20000-50000 inclusive), High(>50000). Return category, accounts_count for ALL three levels (include 0). Any order.",
    "inputFormat": "accounts: list[dict]。",
    "inputFormatEn": "accounts: list[dict].",
    "outputFormat": "回傳 category、accounts_count;三級都要有(含 0)。",
    "outputFormatEn": "Return category, accounts_count for all three levels (incl 0).",
    "constraintsText": "邊界 20000 與 50000 屬 Average;為 0 的級距也要列出。",
    "constraintsTextEn": "20000 and 50000 are Average; include zero levels.",
    "starterCode": "def income_category_counts(accounts):\n    df = pd.DataFrame(accounts)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"account_id": 1, "income": 10000}, {"account_id": 2, "income": 20000}, {"account_id": 3, "income": 60000}]], "expected": [{"category": "Low", "accounts_count": 1}, {"category": "Average", "accounts_count": 1}, {"category": "High", "accounts_count": 1}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"account_id": 5, "income": 50000}, {"account_id": 6, "income": 50001}]], "expected": [{"category": "Low", "accounts_count": 0}, {"category": "Average", "accounts_count": 1}, {"category": "High", "accounts_count": 1}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"account_id": 7, "income": 100}, {"account_id": 8, "income": 200}]], "expected": [{"category": "Low", "accounts_count": 2}, {"category": "Average", "accounts_count": 0}, {"category": "High", "accounts_count": 0}]}
    ]
  },
  {
    "week": 10,
    "index": 17,
    "name": "daily-hours-per-employee",
    "title": "每人每日工時",
    "titleEn": "Daily Hours per Employee",
    "difficulty": 2,
    "category": "資料處理（pandas）",
    "categoryEn": "Data Manipulation (pandas)",
    "functionName": "daily_hours_per_employee",
    "signature": ["logs"],
    "kind": "pandas",
    "statement": "logs 表有 emp_id、day、in_time、out_time（in_time/out_time 為當日分鐘數）。計算每位員工每天的總工時（同一天可能有多筆，需加總 out_time-in_time）。回傳 day、emp_id、total_minutes，順序不限。\n\n提示：先算單筆時長，再用 groupby([\"day\",\"emp_id\"]).sum()。",
    "statementEn": "logs has emp_id, day, in_time, out_time (minutes in the day). Compute total working minutes per employee per day (sum of out_time-in_time). Return day, emp_id, total_minutes, any order.",
    "inputFormat": "logs: list[dict]。",
    "inputFormatEn": "logs: list[dict].",
    "outputFormat": "回傳 day、emp_id、total_minutes。",
    "outputFormatEn": "Return day, emp_id, total_minutes.",
    "constraintsText": "同一天同一人可能有多筆，需加總。",
    "constraintsTextEn": "Multiple rows per person-day must be summed.",
    "starterCode": "def daily_hours_per_employee(logs):\n    df = pd.DataFrame(logs)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"emp_id": 1, "day": "2025-01-01", "in_time": 60, "out_time": 120}, {"emp_id": 1, "day": "2025-01-01", "in_time": 180, "out_time": 210}, {"emp_id": 2, "day": "2025-01-01", "in_time": 0, "out_time": 50}]], "expected": [{"day": "2025-01-01", "emp_id": 1, "total_minutes": 90}, {"day": "2025-01-01", "emp_id": 2, "total_minutes": 50}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"emp_id": 3, "day": "2025-02-02", "in_time": 100, "out_time": 200}]], "expected": [{"day": "2025-02-02", "emp_id": 3, "total_minutes": 100}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"emp_id": 1, "day": "2025-03-03", "in_time": 10, "out_time": 40}, {"emp_id": 1, "day": "2025-03-04", "in_time": 10, "out_time": 15}, {"emp_id": 2, "day": "2025-03-03", "in_time": 0, "out_time": 90}]], "expected": [{"day": "2025-03-03", "emp_id": 1, "total_minutes": 30}, {"day": "2025-03-03", "emp_id": 2, "total_minutes": 90}, {"day": "2025-03-04", "emp_id": 1, "total_minutes": 5}]}
    ]
  },
  {
    "week": 10,
    "index": 18,
    "name": "player-first-login",
    "title": "玩家首次登入日",
    "titleEn": "Player First Login",
    "difficulty": 1,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "player_first_login",
    "signature": ["activity"],
    "kind": "pandas",
    "statement": "activity 表有 player_id、event_date（格式 YYYY-MM-DD）。回傳每位玩家的首次登入日 first_login（最早的 event_date）。回傳 player_id、first_login，順序不限。\n\n提示：日期字串可直接比大小；用 groupby(\"player_id\")[\"event_date\"].min()。",
    "statementEn": "activity has player_id, event_date (YYYY-MM-DD). Return each player's earliest event_date as first_login. Return player_id, first_login, any order.",
    "inputFormat": "activity: list[dict]。",
    "inputFormatEn": "activity: list[dict].",
    "outputFormat": "回傳 player_id、first_login。",
    "outputFormatEn": "Return player_id, first_login.",
    "constraintsText": "日期字串可直接比較。",
    "constraintsTextEn": "Date strings compare directly.",
    "starterCode": "def player_first_login(activity):\n    df = pd.DataFrame(activity)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"player_id": 1, "event_date": "2025-03-05"}, {"player_id": 1, "event_date": "2025-01-02"}, {"player_id": 2, "event_date": "2025-02-02"}]], "expected": [{"player_id": 1, "first_login": "2025-01-02"}, {"player_id": 2, "first_login": "2025-02-02"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"player_id": 9, "event_date": "2024-12-31"}]], "expected": [{"player_id": 9, "first_login": "2024-12-31"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"player_id": 1, "event_date": "2025-05-05"}, {"player_id": 1, "event_date": "2025-05-01"}, {"player_id": 3, "event_date": "2025-04-04"}, {"player_id": 3, "event_date": "2025-04-30"}]], "expected": [{"player_id": 1, "first_login": "2025-05-01"}, {"player_id": 3, "first_login": "2025-04-04"}]}
    ]
  },
  {
    "week": 10,
    "index": 19,
    "name": "clubs-5plus",
    "title": "滿五人的社團",
    "titleEn": "Clubs With 5+ Members",
    "difficulty": 1,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "clubs_5plus",
    "signature": ["memberships"],
    "kind": "pandas",
    "statement": "memberships 表有 club_id、member_id。找出「不重複成員人數 >= 5」的社團。回傳 club_id，去重且升冪排序，欄名為 club_id。\n\n提示：groupby(\"club_id\")[\"member_id\"].nunique()。",
    "statementEn": "memberships has club_id, member_id. Return club_id of clubs with >= 5 distinct members, distinct and ascending, column club_id.",
    "inputFormat": "memberships: list[dict]。",
    "inputFormatEn": "memberships: list[dict].",
    "outputFormat": "回傳 club_id（升冪、去重）。",
    "outputFormatEn": "Return club_id ascending, distinct.",
    "constraintsText": "以不重複成員計算;需 >= 5。",
    "constraintsTextEn": "Distinct members; >= 5.",
    "starterCode": "def clubs_5plus(memberships):\n    df = pd.DataFrame(memberships)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"club_id": 1, "member_id": 1}, {"club_id": 1, "member_id": 2}, {"club_id": 1, "member_id": 3}, {"club_id": 1, "member_id": 4}, {"club_id": 1, "member_id": 5}, {"club_id": 2, "member_id": 1}, {"club_id": 2, "member_id": 2}]], "expected": [{"club_id": 1}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"club_id": 7, "member_id": 1}, {"club_id": 7, "member_id": 1}, {"club_id": 7, "member_id": 2}, {"club_id": 7, "member_id": 3}, {"club_id": 7, "member_id": 4}, {"club_id": 7, "member_id": 5}, {"club_id": 7, "member_id": 6}]], "expected": [{"club_id": 7}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"club_id": 3, "member_id": 1}, {"club_id": 3, "member_id": 2}, {"club_id": 3, "member_id": 3}, {"club_id": 3, "member_id": 4}, {"club_id": 4, "member_id": 1}, {"club_id": 4, "member_id": 2}, {"club_id": 4, "member_id": 3}, {"club_id": 4, "member_id": 4}, {"club_id": 4, "member_id": 5}, {"club_id": 4, "member_id": 6}]], "expected": [{"club_id": 4}]}
    ]
  },
  {
    "week": 10,
    "index": 20,
    "name": "daily-sold-products",
    "title": "每日售出品項數",
    "titleEn": "Distinct Products Sold per Day",
    "difficulty": 1,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "daily_sold_products",
    "signature": ["orders"],
    "kind": "pandas",
    "statement": "orders 表有 sale_date、product_id。計算每天「不重複的售出品項數」。回傳 sale_date、num_products，順序不限。\n\n提示：groupby(\"sale_date\")[\"product_id\"].nunique()。",
    "statementEn": "orders has sale_date, product_id. Count distinct products sold each day. Return sale_date, num_products, any order.",
    "inputFormat": "orders: list[dict]。",
    "inputFormatEn": "orders: list[dict].",
    "outputFormat": "回傳 sale_date、num_products。",
    "outputFormatEn": "Return sale_date, num_products.",
    "constraintsText": "同一天同一品項只算一次。",
    "constraintsTextEn": "Same product on same day counts once.",
    "starterCode": "def daily_sold_products(orders):\n    df = pd.DataFrame(orders)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"sale_date": "2025-01-01", "product_id": 10}, {"sale_date": "2025-01-01", "product_id": 10}, {"sale_date": "2025-01-01", "product_id": 20}, {"sale_date": "2025-01-02", "product_id": 10}]], "expected": [{"sale_date": "2025-01-01", "num_products": 2}, {"sale_date": "2025-01-02", "num_products": 1}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"sale_date": "2025-05-05", "product_id": 1}]], "expected": [{"sale_date": "2025-05-05", "num_products": 1}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"sale_date": "2025-03-03", "product_id": 1}, {"sale_date": "2025-03-03", "product_id": 2}, {"sale_date": "2025-03-03", "product_id": 3}, {"sale_date": "2025-03-04", "product_id": 2}, {"sale_date": "2025-03-04", "product_id": 2}]], "expected": [{"sale_date": "2025-03-03", "num_products": 3}, {"sale_date": "2025-03-04", "num_products": 1}]}
    ]
  },
  {
    "week": 10,
    "index": 21,
    "name": "category-avg-price",
    "title": "各類別平均價格",
    "titleEn": "Average Price by Category",
    "difficulty": 1,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "category_avg_price",
    "signature": ["products"],
    "kind": "pandas",
    "statement": "products 表有 product_id、category、price。回傳每個 category 的平均價格 avg_price（四捨五入到小數點後 2 位）。回傳 category、avg_price，順序不限。\n\n提示：groupby(\"category\")[\"price\"].mean().round(2)。",
    "statementEn": "products has product_id, category, price. Return average price per category (rounded to 2 decimals). Return category, avg_price, any order.",
    "inputFormat": "products: list[dict]。",
    "inputFormatEn": "products: list[dict].",
    "outputFormat": "回傳 category、avg_price（四捨五入 2 位）。",
    "outputFormatEn": "Return category, avg_price (2 decimals).",
    "constraintsText": "平均需四捨五入到 2 位。",
    "constraintsTextEn": "Round average to 2 decimals.",
    "starterCode": "def category_avg_price(products):\n    df = pd.DataFrame(products)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"product_id": 1, "category": "A", "price": 100}, {"product_id": 2, "category": "A", "price": 200}, {"product_id": 3, "category": "B", "price": 50}]], "expected": [{"category": "A", "avg_price": 150.0}, {"category": "B", "avg_price": 50.0}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"product_id": 5, "category": "C", "price": 10}, {"product_id": 6, "category": "C", "price": 15}]], "expected": [{"category": "C", "avg_price": 12.5}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"product_id": 1, "category": "X", "price": 10}, {"product_id": 2, "category": "X", "price": 11}, {"product_id": 3, "category": "X", "price": 12}, {"product_id": 4, "category": "Y", "price": 7}]], "expected": [{"category": "X", "avg_price": 11.0}, {"category": "Y", "avg_price": 7.0}]}
    ]
  },
  {
    "week": 10,
    "index": 22,
    "name": "frequent-collaborations",
    "title": "常合作的演員配對",
    "titleEn": "Frequent Collaborations",
    "difficulty": 3,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "frequent_collaborations",
    "signature": ["cast"],
    "kind": "pandas",
    "statement": "cast 表有 movie_id、actor_id。找出「一起演過 >= 2 部電影」的演員配對。以 actor_a < actor_b 表示配對（避免重複與自我配對）。回傳 actor_a、actor_b、movies_count，順序不限。\n\n提示：把表和自己在 movie_id 上 merge，保留 actor_id_x < actor_id_y，再 groupby 兩人計數。",
    "statementEn": "cast has movie_id, actor_id. Find actor pairs who co-starred in >= 2 movies. Represent a pair as actor_a < actor_b. Return actor_a, actor_b, movies_count, any order.",
    "inputFormat": "cast: list[dict]。",
    "inputFormatEn": "cast: list[dict].",
    "outputFormat": "回傳 actor_a、actor_b、movies_count（actor_a < actor_b）。",
    "outputFormatEn": "Return actor_a, actor_b, movies_count with actor_a < actor_b.",
    "constraintsText": "不含自我配對;每對只出現一次;需 >= 2。",
    "constraintsTextEn": "No self-pairs; each pair once; >= 2.",
    "starterCode": "def frequent_collaborations(cast):\n    df = pd.DataFrame(cast)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"movie_id": 1, "actor_id": 10}, {"movie_id": 1, "actor_id": 20}, {"movie_id": 2, "actor_id": 10}, {"movie_id": 2, "actor_id": 20}, {"movie_id": 3, "actor_id": 10}, {"movie_id": 3, "actor_id": 30}]], "expected": [{"actor_a": 10, "actor_b": 20, "movies_count": 2}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"movie_id": 1, "actor_id": 1}, {"movie_id": 1, "actor_id": 2}]], "expected": []},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"movie_id": 1, "actor_id": 5}, {"movie_id": 1, "actor_id": 6}, {"movie_id": 1, "actor_id": 7}, {"movie_id": 2, "actor_id": 5}, {"movie_id": 2, "actor_id": 6}, {"movie_id": 3, "actor_id": 5}, {"movie_id": 3, "actor_id": 6}]], "expected": [{"actor_a": 5, "actor_b": 6, "movies_count": 3}]}
    ]
  },
  {
    "week": 10,
    "index": 23,
    "name": "dedup-keep-min-id",
    "title": "重複電話只留最小編號",
    "titleEn": "Keep Min Id per Phone",
    "difficulty": 2,
    "category": "資料處理（pandas）",
    "categoryEn": "Data Manipulation (pandas)",
    "functionName": "dedup_keep_min_id",
    "signature": ["person"],
    "kind": "pandas",
    "statement": "person 表有 id、phone。同一支 phone 可能對應多筆;每支 phone 只保留「id 最小」的那筆。回傳 id、phone，依 id 升冪排序。\n\n提示：依 phone 分組取最小 id，或先排序再 drop_duplicates(\"phone\", keep=\"first\")。",
    "statementEn": "person has id, phone. For each phone keep only the row with the smallest id. Return id, phone sorted by id asc.",
    "inputFormat": "person: list[dict]。",
    "inputFormatEn": "person: list[dict].",
    "outputFormat": "回傳 id、phone，依 id 升冪。",
    "outputFormatEn": "Return id, phone sorted by id asc.",
    "constraintsText": "每支電話只留最小 id。",
    "constraintsTextEn": "Keep the smallest id per phone.",
    "starterCode": "def dedup_keep_min_id(person):\n    df = pd.DataFrame(person)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 3, "phone": "111"}, {"id": 1, "phone": "111"}, {"id": 2, "phone": "222"}]], "expected": [{"id": 1, "phone": "111"}, {"id": 2, "phone": "222"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 5, "phone": "999"}]], "expected": [{"id": 5, "phone": "999"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 10, "phone": "a"}, {"id": 4, "phone": "a"}, {"id": 7, "phone": "b"}, {"id": 2, "phone": "b"}, {"id": 9, "phone": "c"}]], "expected": [{"id": 2, "phone": "b"}, {"id": 4, "phone": "a"}, {"id": 9, "phone": "c"}]}
    ]
  },
  {
    "week": 10,
    "index": 24,
    "name": "low-salary-than-manager",
    "title": "薪水低於主管的員工",
    "titleEn": "Earn Less Than Manager",
    "difficulty": 2,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "low_salary_than_manager",
    "signature": ["employees"],
    "kind": "pandas",
    "statement": "employees 表有 id、name、salary、manager_id（頂層主管的 manager_id 為 None）。找出「薪水低於其直屬主管」的員工。回傳 name，順序不限。\n\n提示：把表在 manager_id=id 上和自己 merge，比較兩邊 salary。",
    "statementEn": "employees has id, name, salary, manager_id (top has None). Find employees whose salary is lower than their direct manager's. Return name, any order.",
    "inputFormat": "employees: list[dict]。",
    "inputFormatEn": "employees: list[dict].",
    "outputFormat": "回傳只含 name 一欄。",
    "outputFormatEn": "A table with only name.",
    "constraintsText": "頂層主管沒有主管，不列入。",
    "constraintsTextEn": "Top-level has no manager.",
    "starterCode": "def low_salary_than_manager(employees):\n    df = pd.DataFrame(employees)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Boss", "salary": 9000, "manager_id": null}, {"id": 2, "name": "Amy", "salary": 5000, "manager_id": 1}, {"id": 3, "name": "Bob", "salary": 9500, "manager_id": 1}]], "expected": [{"name": "Amy"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Top", "salary": 100, "manager_id": null}, {"id": 2, "name": "Sub", "salary": 50, "manager_id": 1}]], "expected": [{"name": "Sub"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 1, "name": "A", "salary": 8000, "manager_id": null}, {"id": 2, "name": "B", "salary": 3000, "manager_id": 1}, {"id": 3, "name": "C", "salary": 4000, "manager_id": 2}, {"id": 4, "name": "D", "salary": 2000, "manager_id": 2}]], "expected": [{"name": "B"}, {"name": "D"}]}
    ]
  },
  {
    "week": 10,
    "index": 25,
    "name": "replace-emp-id",
    "title": "替換為唯一識別碼",
    "titleEn": "Replace Employee Id",
    "difficulty": 2,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "replace_emp_id",
    "signature": ["employees", "emp_uni"],
    "kind": "pandas",
    "statement": "employees 表有 id、name;emp_uni 表有 id、unique_id（並非每位員工都有對應）。回傳每位員工的 unique_id 與 name;若沒有對應，unique_id 為 None。回傳 unique_id、name，順序不限。\n\n提示：以 id 做 left join。",
    "statementEn": "employees has id, name; emp_uni has id, unique_id (not every employee is mapped). Return unique_id and name for each employee; None if unmapped. Return unique_id, name, any order.",
    "inputFormat": "employees、emp_uni 皆為 list[dict]。",
    "inputFormatEn": "employees and emp_uni are list[dict].",
    "outputFormat": "回傳 unique_id、name;沒有對應時 unique_id 為 None。",
    "outputFormatEn": "Return unique_id, name; None when unmapped.",
    "constraintsText": "以左表(employees)為準保留全部員工。",
    "constraintsTextEn": "Keep all employees (left join).",
    "starterCode": "def replace_emp_id(employees, emp_uni):\n    e = pd.DataFrame(employees)\n    u = pd.DataFrame(emp_uni)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Amy"}, {"id": 2, "name": "Bob"}], [{"id": 1, "unique_id": 101}]], "expected": [{"unique_id": 101.0, "name": "Amy"}, {"unique_id": null, "name": "Bob"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 5, "name": "Cara"}], [{"id": 5, "unique_id": 505}]], "expected": [{"unique_id": 505, "name": "Cara"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 1, "name": "A"}, {"id": 2, "name": "B"}, {"id": 3, "name": "C"}], [{"id": 2, "unique_id": 202}, {"id": 3, "unique_id": 303}]], "expected": [{"unique_id": null, "name": "A"}, {"unique_id": 202.0, "name": "B"}, {"unique_id": 303.0, "name": "C"}]}
    ]
  },
  {
    "week": 10,
    "index": 26,
    "name": "managers-5plus-reports",
    "title": "有五位以上部屬的主管",
    "titleEn": "Managers With 5+ Reports",
    "difficulty": 2,
    "category": "統計與分組聚合（pandas）",
    "categoryEn": "Statistics / Aggregation (pandas)",
    "functionName": "managers_5plus_reports",
    "signature": ["employees"],
    "kind": "pandas",
    "statement": "employees 表有 id、name、manager_id。找出「直屬部屬 >= 5 人」的主管，回傳其 name，順序不限。\n\n提示：以 manager_id 分組計數，取 >= 5 的 manager_id，再對回 id 取 name。",
    "statementEn": "employees has id, name, manager_id. Find managers with >= 5 direct reports. Return their name, any order.",
    "inputFormat": "employees: list[dict]。",
    "inputFormatEn": "employees: list[dict].",
    "outputFormat": "回傳只含 name 一欄。",
    "outputFormatEn": "A table with only name.",
    "constraintsText": "以直屬部屬人數計算;需 >= 5。",
    "constraintsTextEn": "Count direct reports; >= 5.",
    "starterCode": "def managers_5plus_reports(employees):\n    df = pd.DataFrame(employees)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Boss", "manager_id": null}, {"id": 2, "name": "E2", "manager_id": 1}, {"id": 3, "name": "E3", "manager_id": 1}, {"id": 4, "name": "E4", "manager_id": 1}, {"id": 5, "name": "E5", "manager_id": 1}, {"id": 6, "name": "E6", "manager_id": 1}]], "expected": [{"name": "Boss"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Solo", "manager_id": null}, {"id": 2, "name": "X", "manager_id": 1}]], "expected": []},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 1, "name": "M1", "manager_id": null}, {"id": 2, "name": "M2", "manager_id": 1}, {"id": 3, "name": "R3", "manager_id": 2}, {"id": 4, "name": "R4", "manager_id": 2}, {"id": 5, "name": "R5", "manager_id": 2}, {"id": 6, "name": "R6", "manager_id": 2}, {"id": 7, "name": "R7", "manager_id": 2}, {"id": 8, "name": "R8", "manager_id": 2}]], "expected": [{"name": "M2"}]}
    ]
  },
  {
    "week": 10,
    "index": 27,
    "name": "dept-highest-salary",
    "title": "各部門最高薪員工",
    "titleEn": "Department Top Earners",
    "difficulty": 3,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "dept_highest_salary",
    "signature": ["employees", "departments"],
    "kind": "pandas",
    "statement": "employees 表有 id、name、salary、dept_id;departments 表有 id、name。找出每個部門薪水最高的員工（同部門若同為最高薪，皆列出）。回傳 department、employee、salary，順序不限。\n\n提示：先 merge 取得部門名，再用 groupby(dept).transform(\"max\") 找出各部門最高薪。",
    "statementEn": "employees has id, name, salary, dept_id; departments has id, name. For each department, return the top-paid employee(s) (include ties). Return department, employee, salary, any order.",
    "inputFormat": "employees、departments 皆為 list[dict]。",
    "inputFormatEn": "employees and departments are list[dict].",
    "outputFormat": "回傳 department、employee、salary。",
    "outputFormatEn": "Return department, employee, salary.",
    "constraintsText": "同部門同為最高薪者皆列出。",
    "constraintsTextEn": "Include all ties within a department.",
    "starterCode": "def dept_highest_salary(employees, departments):\n    e = pd.DataFrame(employees)\n    d = pd.DataFrame(departments)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Amy", "salary": 5000, "dept_id": 1}, {"id": 2, "name": "Bob", "salary": 7000, "dept_id": 1}, {"id": 3, "name": "Cara", "salary": 6000, "dept_id": 2}], [{"id": 1, "name": "Sales"}, {"id": 2, "name": "IT"}]], "expected": [{"department": "Sales", "employee": "Bob", "salary": 7000}, {"department": "IT", "employee": "Cara", "salary": 6000}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"id": 1, "name": "Solo", "salary": 100, "dept_id": 9}], [{"id": 9, "name": "Solo Dept"}]], "expected": [{"department": "Solo Dept", "employee": "Solo", "salary": 100}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"id": 1, "name": "A", "salary": 900, "dept_id": 1}, {"id": 2, "name": "B", "salary": 900, "dept_id": 1}, {"id": 3, "name": "C", "salary": 500, "dept_id": 1}, {"id": 4, "name": "D", "salary": 300, "dept_id": 2}], [{"id": 1, "name": "Eng"}, {"id": 2, "name": "HR"}]], "expected": [{"department": "Eng", "employee": "A", "salary": 900}, {"department": "Eng", "employee": "B", "salary": 900}, {"department": "HR", "employee": "D", "salary": 300}]}
    ]
  },
  {
    "week": 10,
    "index": 28,
    "name": "sellers-no-2020",
    "title": "2020 年沒有訂單的賣家",
    "titleEn": "Sellers With No 2020 Orders",
    "difficulty": 2,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "sellers_no_2020",
    "signature": ["sellers", "orders"],
    "kind": "pandas",
    "statement": "sellers 表有 seller_id、name;orders 表有 order_id、seller_id、sale_date（YYYY-MM-DD）。找出「2020 年完全沒有訂單」的賣家，回傳 name，依 name 升冪排序。\n\n提示：先找出 2020 年有訂單的 seller_id 集合，再用 ~isin 反選。",
    "statementEn": "sellers has seller_id, name; orders has order_id, seller_id, sale_date (YYYY-MM-DD). Return names of sellers with NO orders dated in 2020, sorted by name asc.",
    "inputFormat": "sellers、orders 皆為 list[dict]。",
    "inputFormatEn": "sellers and orders are list[dict].",
    "outputFormat": "回傳只含 name 一欄，依 name 升冪。",
    "outputFormatEn": "A table with only name, sorted by name asc.",
    "constraintsText": "以年份 2020 判斷;完全沒有才列出。",
    "constraintsTextEn": "Year 2020; only sellers with none.",
    "starterCode": "def sellers_no_2020(sellers, orders):\n    s = pd.DataFrame(sellers)\n    o = pd.DataFrame(orders)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"seller_id": 1, "name": "Amy"}, {"seller_id": 2, "name": "Bob"}, {"seller_id": 3, "name": "Cara"}], [{"order_id": 1, "seller_id": 1, "sale_date": "2020-05-01"}, {"order_id": 2, "seller_id": 2, "sale_date": "2019-05-01"}]], "expected": [{"name": "Bob"}, {"name": "Cara"}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"seller_id": 5, "name": "Dan"}], [{"order_id": 9, "seller_id": 5, "sale_date": "2021-01-01"}]], "expected": [{"name": "Dan"}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"seller_id": 1, "name": "Zoe"}, {"seller_id": 2, "name": "Ann"}, {"seller_id": 3, "name": "Mia"}], [{"order_id": 1, "seller_id": 1, "sale_date": "2020-12-31"}, {"order_id": 2, "seller_id": 3, "sale_date": "2018-01-01"}]], "expected": [{"name": "Ann"}, {"name": "Mia"}]}
    ]
  },
  {
    "week": 10,
    "index": 29,
    "name": "students-examinations",
    "title": "學生應試次數",
    "titleEn": "Students and Examinations",
    "difficulty": 3,
    "category": "合併與關聯（pandas）",
    "categoryEn": "Joins & Merge (pandas)",
    "functionName": "students_examinations",
    "signature": ["students", "subjects", "examinations"],
    "kind": "pandas",
    "statement": "students 表有 student_id、student_name;subjects 表有 subject_name;examinations 表有 student_id、subject_name（每筆代表一次應試）。對「每位學生 × 每個科目」的所有組合，計算應試次數 attended_count（沒考過為 0）。回傳 student_id、student_name、subject_name、attended_count，依 student_id、subject_name 升冪排序。\n\n提示：students 與 subjects 做 cross join 產生所有組合，examinations 分組計數後 left join，缺的補 0。",
    "statementEn": "students has student_id, student_name; subjects has subject_name; examinations has student_id, subject_name (one row per sitting). For every student x subject combination, count sittings (0 if none). Return student_id, student_name, subject_name, attended_count sorted by student_id, subject_name asc.",
    "inputFormat": "students、subjects、examinations 皆為 list[dict]。",
    "inputFormatEn": "All three are list[dict].",
    "outputFormat": "回傳 student_id、student_name、subject_name、attended_count。",
    "outputFormatEn": "Return student_id, student_name, subject_name, attended_count.",
    "constraintsText": "所有學生×科目組合都要出現;沒考過為 0。",
    "constraintsTextEn": "All student x subject combos; 0 if none.",
    "starterCode": "def students_examinations(students, subjects, examinations):\n    s = pd.DataFrame(students)\n    sub = pd.DataFrame(subjects)\n    e = pd.DataFrame(examinations)\n    # TODO\n    pass\n",
    "tests": [
      {"name": "Sample 1", "visibility": "public", "comparator": "table", "args": [[{"student_id": 1, "student_name": "Alice"}, {"student_id": 2, "student_name": "Bob"}], [{"subject_name": "Math"}, {"subject_name": "Physics"}], [{"student_id": 1, "subject_name": "Math"}, {"student_id": 1, "subject_name": "Math"}, {"student_id": 2, "subject_name": "Physics"}]], "expected": [{"student_id": 1, "student_name": "Alice", "subject_name": "Math", "attended_count": 2}, {"student_id": 1, "student_name": "Alice", "subject_name": "Physics", "attended_count": 0}, {"student_id": 2, "student_name": "Bob", "subject_name": "Math", "attended_count": 0}, {"student_id": 2, "student_name": "Bob", "subject_name": "Physics", "attended_count": 1}]},
      {"name": "Sample 2", "visibility": "public", "comparator": "table", "args": [[{"student_id": 9, "student_name": "Zoe"}], [{"subject_name": "Art"}], [{"student_id": 9, "subject_name": "Art"}]], "expected": [{"student_id": 9, "student_name": "Zoe", "subject_name": "Art", "attended_count": 1}]},
      {"name": "Hidden 1", "visibility": "hidden", "comparator": "table", "args": [[{"student_id": 1, "student_name": "A"}, {"student_id": 2, "student_name": "B"}], [{"subject_name": "X"}, {"subject_name": "Y"}], [{"student_id": 1, "subject_name": "X"}, {"student_id": 2, "subject_name": "X"}, {"student_id": 2, "subject_name": "X"}]], "expected": [{"student_id": 1, "student_name": "A", "subject_name": "X", "attended_count": 1}, {"student_id": 1, "student_name": "A", "subject_name": "Y", "attended_count": 0}, {"student_id": 2, "student_name": "B", "subject_name": "X", "attended_count": 2}, {"student_id": 2, "student_name": "B", "subject_name": "Y", "attended_count": 0}]}
    ]
  }
];


function slug(week, index, name) {
  return `week-${String(week).padStart(2, "0")}-${index}-${name}`;
}
function starter(functionName, signature) {
  return `def ${functionName}(${signature.join(", ")}):\n    # TODO: implement your solution.\n    pass\n`;
}
function problem(spec) {
  return {
    slug: slug(spec.week, spec.index, spec.name),
    week: spec.week,
    seriesTitle: weekTitles[spec.week].zh,
    seriesTitleEn: weekTitles[spec.week].en,
    title: spec.title,
    titleEn: spec.titleEn,
    difficulty: spec.difficulty,
    category: spec.category,
    categoryEn: spec.categoryEn,
    timeLimitSeconds: spec.difficulty === 1 ? 1800 : spec.difficulty === 2 ? 2400 : 3600,
    functionName: spec.functionName,
    signature: spec.signature,
    statement: spec.statement,
    statementEn: spec.statementEn,
    inputFormat: spec.inputFormat,
    inputFormatEn: spec.inputFormatEn,
    outputFormat: spec.outputFormat,
    outputFormatEn: spec.outputFormatEn,
    constraintsText: spec.constraintsText,
    constraintsTextEn: spec.constraintsTextEn,
    starterCode: spec.starterCode || starter(spec.functionName, spec.signature),
    kind: spec.kind || "python",
    tests: spec.tests
  };
}
export function buildProblemBank() {
  return problemSpecs.map(problem);
}
