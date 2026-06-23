# DataArena

DataArena 是依據專案計畫書實作的資料競賽平台。平台包含學生註冊登入、教師管理員登入、1-10 週正式題庫、Python 程式批改、全站排行榜、學生進度與教師後台。

## 預設帳號

教師管理員：

- Email: `admin@dataarena.local`
- Password: `DataArena@2026!`

學生帳號由學生在首頁自行註冊。重置資料庫後會回到正式初始狀態：管理員 1 位、學生 0 位、提交紀錄 0 筆、作答紀錄 0 筆、題目 50 題。

## 本機啟動

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm start
```

預設服務網址為 `http://localhost:8080`。

如需使用其他連接埠：

```bash
$env:PORT=8090
corepack pnpm start
```

## 重置正式初始資料

重置會清空學生、提交紀錄與本機 SQLite 資料庫，然後重新建立管理員帳號與 50 題正式題庫。

```bash
corepack pnpm reset-db
```

## Docker

```bash
docker compose up --build
```

Docker 啟動後開啟 `http://localhost:8080`。SQLite 資料會保存在 Docker volume `data-arena-data`。

正式上線前請在 `docker-compose.yml` 更換 `JWT_SECRET`，必要時也可調整 `ADMIN_EMAIL` 與 `ADMIN_PASSWORD`。

## 復刻流程

在一台新機器上復刻同樣平台：

1. 安裝 Node.js 22、pnpm/corepack、Python 3。若使用 Docker，只需要 Docker Desktop 或 Docker Engine。
2. 取得專案資料夾後，在專案根目錄執行 `corepack enable`。
3. 本機模式執行：

```bash
corepack pnpm install
corepack pnpm reset-db
corepack pnpm build
corepack pnpm start
```

4. Docker 模式執行：

```bash
docker compose down -v
docker compose up --build -d
```

5. 開啟 `http://localhost:8080`，用預設管理員帳號登入後台確認題目 50 題、學生 0 位、Submit 0 筆、作答紀錄 0 筆。

重要檔案：

- `server/problem-bank.mjs`：50 題正式題庫與公開測資。
- `server/db.mjs`：SQLite schema、管理員 seed、題庫 seed、資料庫重置。
- `server/index.mjs`：登入、題目、Test、Submit、作答限制、切換視窗紀錄、排行榜 API。
- `src/App.tsx`：前端主流程、使用教學頁、編輯器、sample 編輯、排行榜與警告彈窗。
- `src/styles.css`：前端版面與響應式樣式。
- `Dockerfile` / `docker-compose.yml`：容器化部署。

## 題庫與測資規則

題庫共 50 題：第 1-10 週，每週 5 題。題目涵蓋資料清理、統計、排序、分類、模型指標、特徵工程與競賽常見資料處理。

題目頁只顯示 sample 測資。平台沒有隱藏測資；Submit 會用該題全部公開測資批改。若提交錯誤，結果會列出失敗的測資、Input、Expected、Actual 與錯誤訊息。

作答前必須按「開始」。開始後才可編輯程式碼、sample input 與 expected output，並開始倒數計時。測驗進行中會鎖定所有與本題無關的按鈕與連結，包括頂部導覽、題目切換、排行榜、進度、後台與登出；學生只能操作本題的 sample、編輯器、Test、Submit 與警告視窗。離開題目或逾時會留下作答紀錄。Test 不限次數，會使用目前畫面上的 sample input / expected output 測試；Submit 才計入正式提交次數，每位學生每題每天最多 3 次，午夜重置。

測驗中禁止切換視窗或分頁。系統偵測到切換時會跳出警告並記錄次數；第 1、2 次是警告，第 3 次會自動強制 Submit 目前程式碼，並計入今日 Submit 次數。

程式編輯器支援 Tab 縮排、Python 語法高亮，並禁止複製、剪下、貼上與右鍵選單。

網站上方的「使用教學」頁會提供學生作答流程、Test / Submit 差異、測驗中限制說明，以及 Week 1 五題範例題目的參考答案。

## 全站排行榜

排行榜是針對全部題目的總榜，不是單題排行榜。每題先計算題目分：

```text
最佳通過率 70% + 時間效率 15% + Submit 次數效率 10% + 失敗次數效率 5%
```

平台會先依每題的題目分排序得到該題排名，再把全部題目的排名取平均，形成「平均題目排名」。平均題目排名越小，總榜越前面；未提交的題目會排在該題最後。

若平均題目排名相同，依序比較解題數、平均題目分、總執行時間、總 Submit 次數、總失敗次數。學生可在排行榜頁點「排名說明」查看同樣的規則。

## 開發模式

前端 Vite：

```bash
corepack pnpm dev
```

後端 API：

```bash
corepack pnpm dev:api
```

前端開發時若 API 不是同源服務，可使用 `VITE_API_BASE_URL` 指向 API 網址。
