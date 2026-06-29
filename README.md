# DataArena

DataArena 是資料科學與資料探勘課程用的線上練習平台。學生登入後可以直接進入題目、編輯 Python function、使用 Run 測公開測資，並用 Submit 送出正式評分。平台目前沒有 Start 流程、沒有倒數計時，也不把作答時間納入分數。

## 測試帳號

老師帳號：
- Email: `admin@dataarena.local`
- Password: `DataArena@2026!`

學生帳號：
- Email: `student@dataarena.local`
- Password: `Student@2026!`
- Student ID: `SAMPLE001`

## 啟動方式

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm start
```

啟動後開啟 `http://localhost:8080`。

開發模式：

```bash
corepack pnpm dev
corepack pnpm dev:api
```

如果前端要連到獨立 API：

```bash
$env:VITE_API_BASE_URL="http://localhost:8080"
```

重建 SQLite seed 資料：

```bash
corepack pnpm reset-db
```

## 學生作答流程

1. 登入學生帳號。
2. 從題庫選擇老師已開放的題目。
3. 進入題目後直接編輯 Python function，不需要按 Start。
4. 按 Run 只會執行公開測資，方便檢查輸入輸出，不會產生正式提交紀錄。
5. 按 Submit 會執行公開與隱藏測資，寫入提交紀錄、分數與排行榜資料。
6. 題目左側只保留「題目敘述」與「提交紀錄」。提交紀錄需要登入才可查看；如果尚未提交，會提示完成一次 Submit 後再顯示紀錄。

## 計分方式

單次 Submit 的分數由測資通過率決定：

```text
Submit 分數 = 通過測資數 / 總測資數 * 100
```

公開測資會顯示給學生；隱藏測資只在 Submit 評分時使用，不會揭露輸入、答案或實際輸出。

排行榜以每題題目分排序：

```text
題目分 = 最佳 Submit 分數 80% + Submit 次數效率 15% + 失敗次數效率 5%
```

- Submit 次數越少，Submit 次數效率越高。
- 失敗次數越少，失敗次數效率越高。
- 作答時間、停留時間與程式執行時間都不納入排行榜計分。
- 同分時依序比較解題數、平均題目分、總 Submit 次數與總失敗次數。

## 老師管理流程

1. 登入老師帳號。
2. 進入 Teacher 後台。
3. 在 Manage 開放或關閉題目。
4. 在 Upload 建立新題目。
5. 新增題目時需填寫中文與英文欄位，包含題名、系列、分類、題目敘述、輸入格式、輸出格式與限制條件，語言切換時才有完整內容。
6. 填寫 Function name、Signature、Starter Code、公開測資 JSON 與隱藏測資 JSON。
7. 上傳後建議用老師帳號進入題目，直接 Run 與 Submit 各測一次，確認 public 與 hidden 測資都能正常執行。

## 題目欄位說明

- `Slug`: 題目網址識別，例如 `dataset-shape-template`。
- `週次`: 課程週次。
- `系列名稱 / Series title`: 題目所屬課程主題。
- `題目名稱 / Problem title`: 顯示在題庫與題目頁。
- `難度`: Easy、Medium、Hard。
- `分類 / Category`: 題目知識點，例如資料前處理、分類、分群、關聯規則。
- `Function name`: 學生必須實作的 Python 函式名稱。
- `Signature`: 參數順序，用逗號分隔，例如 `records, key`。
- `題目敘述 / Statement`: 可以寫得較完整，讓學生先閱讀情境再作答。
- `Input Format / Output Format / Constraints`: 中英文都要填。
- `Starter Code`: 學生編輯器預設載入的 Python 程式。
- `公開測資 JSON`: 會顯示在學生 Testcase 面板，也會在 Run 時執行。至少需要一筆。
- `隱藏測資 JSON`: 只會在 Submit 正式評分時執行，不會顯示給學生。至少需要一筆。
- `建立後立即開放給學生`: 勾選後學生會在題庫看到該題。

## Starter Code 範例

```python
def dataset_shape(records):
    # TODO: write your solution
    pass
```

函式名稱必須與 `Function name` 一致，參數順序必須符合 `Signature`。

## 測資 JSON 格式

公開測資與隱藏測資各自都是 JSON array。每筆測資格式如下：

- `name`: 測資名稱。
- `args`: 傳給函式的參數 array，順序對應 Signature。
- `expected`: 預期回傳值。
- `comparator`: `exact`、`number` 或 `deepNumber`。

不用在 JSON 裡填 `visibility`。管理員介面的「公開測資」區會自動標記為 `public`，「隱藏測資」區會自動標記為 `hidden`。

公開測資範例：

```json
[
  {
    "name": "Sample 1",
    "args": [[{"a": 1}, {"a": 2, "b": 3}]],
    "expected": {"rows": 2, "columns": 2},
    "comparator": "exact"
  }
]
```

隱藏測資範例：

```json
[
  {
    "name": "Hidden 1",
    "args": [[{"x": 10}, {"y": 20}, {"x": 30, "z": 40}]],
    "expected": {"rows": 3, "columns": 3},
    "comparator": "exact"
  }
]
```

如果 Signature 是：

```python
def dataset_shape(records):
    ...
```

那麼 `args` 應該是：

```json
[[{"a": 1}, {"b": 2}]]
```

## Comparator

- `exact`: 使用 JSON 序列化後的精確比對。
- `number`: 數字誤差容許值為 `0.0001`。
- `deepNumber`: 對 list / dict 裡的數字做遞迴近似比對。

## Docker

```bash
docker compose up --build
```

Docker 啟動後開啟 `http://localhost:8080`。SQLite 資料會保存在 volume `data-arena-data`。
