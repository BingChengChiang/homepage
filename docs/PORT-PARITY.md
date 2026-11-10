# 原版移植與對照驗證

## 固定來源

- 作者官方 asciiquarium 1.1（2013-03-09）：`https://robobunny.com/projects/asciiquarium/asciiquarium.tar.gz`。
- 原始檔 SHA-256：`f3afa00cdcea5cc5e4f2c22ee987bc10eddc5f41a56ec4836ef3e4011999e65a`。
- Term::Animation：CPAN 2.6。來源和壓縮包保存在 vendor，完整校驗資料在 `vendor/asciiquarium/UPSTREAM.json`。
- 上游程式沒有修改；測試 harness 讀入時只關閉 `main()` GUI 入口，以便直接呼叫原始函式。

此來源取代先前採用、同樣標為 1.1 的 cmatsuoka GitHub 分支。舊測試只適用舊分支；目前資料已全部依官方發布版重新產生。

## 模組分工

首頁的 `index.html` 只用 iframe 裝入 `asciiquarium/index.html`。它不管理魚、事件或碰撞。

`assets.js` 由原版 Perl 執行後擷取，保留兩個方向的原始圖形與色罩，沒有自行鏡射或重畫。`engine.js` 對應原版同名函式，包含官方魚種、大魚、船、鯨魚與噴水、四幀海蛇、鯊魚與牙齒、魚鉤捕魚／收線、天鵝、鴨子、群體海豚、氣泡、碰撞碎片、水草與城堡。

`browser.js` 負責 Canvas 終端輸出、容器尺寸和輸入。`p` 暫停／繼續、`r` 重繪，`q` 在瀏覽器中停止播放（原版是結束程式）。官方發布版沒有舊分支的 `-c`，已移除 `?classic`。瀏覽器初始遵守 prefers-reduced-motion；若啟用則先暫停。

沒有餵食追蹤、自創擺動路徑、固定鯊魚排程或日夜模式。魚只按原版速度方向移動。大型事件按原版隨機選擇，離開畫面後才替換。

透明規則依 Term::Animation：`?` 為透明字元；啟用 auto_trans 時只把行首空白改為透明；魚身內部空白仍是不透明，會遮住後方魚和場景。圖層依 Z 值由遠到近繪製。碰撞採原版三維 bounding box 與物件深度，不另造逐像素物理規則。

## 已執行的比較

1. 42 組官方生成 fixtures（三組亂數種子 × 14 個生成函式）。比較圖形、色罩、亮色屬性、位置、大小、速度、圖層、動畫幀和亂數呼叫次數。
2. 3,000 個完整模擬幀（含指定魚鉤捕魚收線、海豚群及海蛇場景）。實際執行未修改的 Perl `asciiquarium` 函式與 `Term::Animation`，以測試用 Curses adapter 接收其輸出，再比較整個字元與顏色緩衝區的 SHA-256；同一組輸入的所有幀相符。
3. 特定回歸：魚的方向、魚身空白遮擋、行首與 `?` 透明、Z 圖層、三維碰撞，以及所有大型事件離開後的替換循環。

## 如何執行

已附上 fixtures，日常只需要 Node.js：

```powershell
node tests/parity.mjs
node tests/trace-parity.mjs
```

重建原版資料需要 Perl，且能使用其 JSON::PP、Digest::SHA 核心模組。測試使用自己的最小 Curses adapter，不需真正的 curses 螢幕。以下為 PowerShell（Perl 需在 PATH）：

```powershell
perl tests/upstream-harness.pl assets | Out-File tests/assets.raw.json -Encoding utf8
perl tests/upstream-harness.pl fixtures | Out-File tests/fixtures.json -Encoding utf8
perl tests/upstream-harness.pl trace | Out-File tests/trace.json -Encoding utf8
node tests/build-assets.mjs
node tests/parity.mjs
node tests/trace-parity.mjs
```

## 等價範圍與明確差異

「相同邏輯」不代表兩個獨立 session 的亂數圖像序列會相同：原版 Perl 本身也會使用不同亂數，並隨機化 hash 迭代順序。同層物件的遮擋先後、同幀 callbacks 的順序因此不是原版跨執行都固定的值。JavaScript 使用 Map 順序，屬於選定的一種順序。

逐幀測試記錄並重播原版的 hash 執行順序及亂數輸入，藉此比較相同執行條件，而非誤把不同亂數路徑當成邏輯差異。瀏覽器實際播放仍使用 Math.random，沒有固定假造場景。

原版 halfdelay(1) 改由約 100ms 的瀏覽器 timer 提供節拍。背景分頁可能被瀏覽器降低計時頻率；Canvas 字型與終端 ANSI 色盤的實際像素也取決於裝置。第四版預設使用 160 × 48 的邏輯終端，縮放進首頁容器；控制列可選 120 × 36、160 × 48、200 × 60。resize 只縮放目前的邏輯終端，切換尺寸或按 r 會重建場景。這只改變提供給原版引擎的終端寬高，沒有縮放速度、調整更新頻率或修改 engine.js。

這些測試是具體等價證據，不是對所有可能亂數、平台和無限執行時間的形式化證明。新增規則前應先增加原版對照案例，不得為了畫面熱鬧而調整生成概率或速度。

## 更新來源

更新官方來源前先保存目前版本，重新下載並記錄 SHA-256，再重建 fixtures 與 sprite data。若對照失敗，調查上游變更或翻譯錯誤，不要修改預期資料讓錯誤通過。保留原版作者、授權與可取得的對應原始碼。
