# GitHub Pages 操作手冊

網站：https://bingchengchiang.github.io/homepage/
原始碼：https://github.com/BingChengChiang/homepage

## 技術與部署

網站使用原生 HTML、CSS、JavaScript、Canvas 2D，魚缸在獨立 iframe 中執行。沒有後端、資料庫、API key 或 npm runtime dependencies。Node.js 24 用於 GitHub Actions 測試，訪客不需要 Node.js。

GitHub Pages 發布 `dist/`。每次推送 main，`.github/workflows/pages.yml` 會執行原版對照測試，成功後才上傳並部署 dist。測試失敗時保留前一個已發布版本。

首次啟用：repository → Settings → Pages → Build and deployment → Source 選 GitHub Actions。之後通常不用再改這項設定。

## 配色

首頁使用深色底 #111315；魚缸使用 VS Code 風格深灰 #1e1e1e，控制列 #252526。首頁顏色在 dist/style.css 的 CSS variables，終端色彩在 terminal.css，ANSI 色盤映射在 browser.js。這些都只改顯示，不改 engine.js 的官方模擬規則。

## 日常修改

- `dist/profile.js`：姓名、自介、專案與連結。
- `dist/style.css`：首頁視覺。
- `dist/asciiquarium/display.js`：終端尺寸；預設 160×48。
- `dist/asciiquarium/browser.js`：瀏覽器繪圖、輸入、獨立驗證模式。
- `dist/asciiquarium/engine.js`：官方規則移植；修改前閱讀 PORT-PARITY.md 並維持對照測試。

在 GitHub 編輯文字檔後 commit 到 main，或在本機 clone 修改並推送。到 Actions 看最新執行是否成功，再重新整理正式網址。不要把機密放進公開 repo 或 profile.js。

本機預覽：安裝 Node.js 22+，於資料夾執行 `node preview.mjs`，開啟 http://127.0.0.1:4173。Ctrl+C 停止。

## 直接確認海蛇和魚鉤

- 海蛇：https://bingchengchiang.github.io/homepage/asciiquarium/index.html?preview=monster
- 魚鉤：https://bingchengchiang.github.io/homepage/asciiquarium/index.html?preview=fishhook
- 驗證入口：https://bingchengchiang.github.io/homepage/asciiquarium/verify.html

這些維護用連結持續重播指定事件，使用相同的官方事件函式、圖形、速度與碰撞；按 r 可重新開始該預覽。正常首頁沒有 preview 參數，完全沿用原版九種事件抽選規則。

原版一次只播放一個主要特殊事件，每次選海蛇或魚鉤各約 1/9，並非每隔固定秒數生成。八組各十五分鐘的模擬中，海蛇出現 46 次、魚鉤 54 次；單一案例首次海蛇等了約 8 分 47 秒。這不是正式站的統計，也不保證訪客一定在某個時間內看見。

## 回復舊版

用 Git revert 產生回復 commit，推送 main，讓同一個流程重新部署。避免以 force push 丟棄歷史。repo 原有私人首頁與舊作業未搬入這個公開 repository。

## 網址與維護

履歷使用網站網址，不是 github.com 原始碼網址。後續可在 Pages 設定綁定自己的網域。這個部署不依賴 Sites；舊 Sites 網站是先前副本，不會自動跟著 GitHub 更新。
