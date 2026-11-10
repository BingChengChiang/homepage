# 個人首頁操作手冊

版本：GitHub Pages 版（作者官方 1.1），2026-11-09。

## 1. 架構與所有技術

這是一個純靜態網站。瀏覽器下載 HTML、CSS、JavaScript 後直接執行，沒有後端服務、資料庫、帳號系統、API key、分析追蹤或 Cookie。字型使用作業系統內建字型，不向外部字型服務請求。頁面只有在訪客點擊外部連結時才開啟該網站。

| 層級 | 技術 | 用途 |
|---|---|---|
| 結構 | HTML5 | 導覽、自介、魚缸、專案、頁尾 |
| 外觀 | 原生 CSS | CSS variables、Grid、Flex、響應式版型 |
| 邏輯 | 原生 JavaScript（無套件） | 設定檔渲染、控制按鈕、連結檢查 |
| 動畫 | Canvas 2D + 100ms setTimeout | 替代原版 Curses 輸出及 halfdelay(1)，模擬規則分離 |
| 隔離容器 | 同源 iframe + JavaScript ES modules | 首頁只嵌入完整魚缸應用，不控制模擬邏輯 |
| 尺寸 | ResizeObserver | 配合容器大小及螢幕像素密度重繪 |
| 無障礙 | HTML 語意、ARIA、prefers-reduced-motion | 鍵盤操作、狀態訊息、減少動畫 |
| 本機預覽 | Node.js 22+ 的 http / fs / path 內建模組 | 只綁定 127.0.0.1:4173 |
| 版本 | Git | 追蹤修改、找回舊版 |
| 託管 | GitHub Pages + GitHub Actions | main 更新後先驗證再自動部署 dist/ |

沒有 React、Next.js、Vinext、npm runtime dependencies、bundler 或編譯步驟。初期嘗試的 Vinext starter 因本機缺少 npm 未使用；不在這份正式網站原始碼中。Node.js 只用於本機預覽，正式頁面不需要 Node.js。Git 與 GitHub Actions 是發布工具，不是訪客瀏覽頁面的依賴。

魚缸現在是 作者官方 asciiquarium 1.1 發布版與 Term::Animation 2.6 的 JavaScript 移植版。魚形、色罩、場景和動畫幀從原版 Perl 定義直接提取；首頁只透過 iframe 嵌入它。上游來源、作者與 GPL-2.0-or-later 授權保留在 `dist/asciiquarium/NOTICE.md` 與 `COPYING`。Perl 僅供開發時重建原版對照資料，訪客不需要 Perl。

## 2. 檔案位置

```text
personal-tide/
  dist/
    index.html       # 頁面與 SEO 描述
    profile.js       # 你最常修改的個人內容
    style.css        # 視覺與手機版
    app.js           # 個人內容渲染與時鐘
    asciiquarium/    # 獨立魚缸：index.html、engine.js、assets.js、browser.js、terminal.css
                     # 同時保留原版來源、NOTICE.md、COPYING
    favicon.svg      # 分頁圖示
  docs/OPERATIONS.md # 本手冊
  preview.mjs        # 本機伺服器
  .github/workflows/pages.yml # 自動測試與部署
  .gitignore
  .gitattributes      # 原版來源以原始位元組保存
  LICENSE             # GPL v2，依原版可選後續版本
  tests/              # 原版 Perl 擷取程式、fixtures、逐幀對照
  vendor/             # 未修改的上游 Perl 與 Term::Animation 2.6
  README.md
```

`dist/` 同時是網站原始檔與發布內容，不是自動產生的輸出，不要清空它。修改檔案後，重新整理頁面即可。

## 3. 第一次啟動

1. 將交付的 ZIP 解壓縮到你想管理的資料夾。
2. 安裝 Node.js 22 或以上，確認終端機執行 `node --version` 有版本號。
3. 在網站資料夾開啟 PowerShell。
4. 執行 `node preview.mjs`。
5. 用瀏覽器開啟 `http://127.0.0.1:4173`。
6. 在終端機按 Ctrl+C 停止。這個預覽只供本機使用，不會公開到網際網路。

如果 4173 已被占用，停止自己先前開的伺服器，或修改 `preview.mjs` 最後兩行的連接埠（程式與印出的網址一起修改）。

## 4. 修改名字、自介、連結

開啟 `dist/profile.js`，修改 `window.PROFILE`。使用 UTF-8 儲存。範例：

```javascript
window.PROFILE = {
  name: "你的名字",
  eyebrow: "HARDWARE ENGINEER / SOMETIMES MAKER",
  intro: "這裡放一句介紹。",
  about: "這裡放較完整的自介。",
  note: "最近在做的事。",
  email: "you@example.com",
  links: [
    { label: "GitHub", url: "https://github.com/你的帳號" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/你的帳號/" }
  ],
  projects: [
    {
      title: "專案名稱",
      description: "你做了什麼，以及為什麼好玩。",
      url: "https://example.com"
    }
  ]
};
```

保留引號、逗號和括號；文字包含雙引號時以 `\"` 跳脫。email 留空會隱藏聯絡入口；links 留 `[]` 會隱藏社群連結。projects 留 `[]` 會顯示尚在準備的訊息。專案沒有網址時可填空字串，標題仍會顯示。外部網址僅接受 http/https；建議使用 https。

文字透過 `textContent` 載入，不會被當成 HTML。不要在這份檔案放密碼、API key 或私人資料：訪客可以讀到所有靜態檔案。若以中文為主，請把 `index.html` 的 `lang="en"` 改為 `lang="zh-Hant"`，並翻譯固定 UI 標籤。

## 5. 調整視覺與魚缸

首頁外觀由 `dist/style.css` 管理。魚缸是獨立的 `dist/asciiquarium/index.html`，首頁只提供 iframe 容器。改 `.tank` 高度即可改容器尺寸；魚缸的控制列樣式在 `terminal.css`。

魚缸預設為 160 欄 × 48 列，縮放進首頁的容器，不再隨容器變窄而變成只有幾十欄的小終端。控制列可選 120 × 36、160 × 48、200 × 60；欄列越多，物件相對越小，穿越同一畫面的時間越長，魚的原版每幀移動量不變。切換尺寸會重新生成場景。此選擇不永久保存；可在 iframe 的 src 加上 `?size=200x60` 設定初始值。預設與可選值集中在 `dist/asciiquarium/display.js`，只控制終端尺寸。

控制方式：點魚缸後按 `p` 暫停／繼續、`r` 重繪／重新生成場景、`q` 停止播放；控制列也有暫停與重繪按鈕。重繪遵守當時的暫停狀態。官方發布版不提供 `?classic`；舊分支的此選項已移除。沒有額外餵食和日夜模式。

魚形與色罩是從原版直接擷取，請勿手改 `assets.js`。要調整實作，先讀 `docs/PORT-PARITY.md`，依原版來源修正 `engine.js`，執行原版對照測試；不要自行調整速度或隨機概率。字型與 ANSI 色盤由 `browser.js` 適配。

魚鉤是官方隨機事件之一，並非按鍵觸發；事件在船、鯨魚、海蛇、大魚、鯊魚、魚鉤、天鵝、鴨子、海豚九種中選擇。海蛇為四幀，每次更新前進 2 格、動畫前進 0.25 幀，約 1.6 秒一輪；沒有額外降速。

魚缸不儲存狀態，重新整理會重建。頁尾時鐘仍是訪客裝置的當地時間。詳細來源、授權、維護和等價限制見 `docs/PORT-PARITY.md`。

## 6. 檢查再上線

1. 用本機預覽確認名字、文字、連結沒有錯。
2. 電腦與手機寬度各看一次，確認沒有水平溢出。
3. 試魚缸暫停／繼續、重繪與鍵盤控制。
4. 用 Tab 移動焦點，Enter 啟動按鈕與連結。
5. 如果動過 JS，執行 `node --check dist/app.js`、`node --check dist/asciiquarium/engine.js` 和 `node --check dist/profile.js`，以及 `node tests/parity.mjs` 和 `node tests/trace-parity.mjs`。
6. 確認頁面沒有個人資訊占位文字、機密、失效網址或你不想公開的內容。

## 7. 發布到 GitHub Pages

正式網址：https://bingchengchiang.github.io/homepage/

原始碼：https://github.com/BingChengChiang/homepage

修改檔案並 commit／push 到 main；GitHub Actions 會跑 42 組生成案例與 3,000 幀原版對照，通過才發布 dist/。到 Actions 頁確認成功，再檢查正式網址。完整流程、首次啟用與故障處理見 GITHUB-PAGES.md。

## 8. 管理與備份

以自己的 GitHub repository 為主要來源。可直接在 GitHub 編輯 profile.js，或 clone 到本機修改。每次有意義的更新建立 commit；下載 ZIP 可做離線備份，但 ZIP 不包含 Git 歷史。不要將存取 token、密碼或私人資料放入公開 repository。

## 9. 回復舊版

- 本機：先備份未提交內容，再用 Git 還原特定檔案，檢查後重新發布。
- GitHub Pages：用 Git revert 產生回復 commit 並推送 main，讓 Actions 部署回復後的內容。
- 只有 ZIP：把需要恢復的檔案從備份複製回去，預覽確認，再重新發布。

不要用會丟棄全部未提交內容的指令作為日常復原方式。

## 10. 自訂網域與搬家

日後可在 repository 的 Settings → Pages 加入自己的網域，並依 GitHub Pages 官方文件設定 DNS。保持網域註冊與續費由你管理。搬到其他靜態主機只需要發布 dist/，沒有 build command 或 runtime dependencies。

## 11. 常見問題

| 狀況 | 處理 |
|---|---|
| 改了檔案但網站沒變 | 先確認改的是目前使用的資料夾；本機強制重新整理；正式站需重新部署 |
| 自介空白或魚缸不動 | 檢查 profile.js 語法；看瀏覽器 Console；確認 JS 沒被停用 |
| 找不到餵食或日夜按鈕 | 第三版已移除額外玩法，只保留原版控制 |
| 魚缸一開始不動 | 裝置可能開啟減少動態效果；按 resume |
| 朋友開不了網站 | 確認 Pages 已啟用、Actions 成功，網址包含 /homepage/；127.0.0.1 不能分享 |
| 中文亂碼 | 確認編輯器用 UTF-8 儲存，保留 HTML 的 charset |
| 無法 node 啟動 | 確認 Node.js 已安裝並在 PATH；重新開終端機 |

## 12. 目前限制

尚未填入你的真實姓名、經歷、專案與社群網址。沒有 CMS，內容透過設定檔管理。魚缸不會跨裝置同步，也沒有永久儲存。移植邏輯已透過原版對照驗證，但不同瀏覽器的字型、計時與獨立亂數路徑不能聲稱逐畫面與另一個原版 session 相同；詳細範圍見 `docs/PORT-PARITY.md`。
