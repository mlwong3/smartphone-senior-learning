# Task 2 完成報告：三種安全驗證課堂

## 提交

- 實作提交：`8f1cd3f1a568d690a29776e9d83e9ae4c651276d`（`feat: add three-method verification lesson`）

## 已修改檔案

- `src/levels/captcha/CaptchaLesson.tsx`
  - 以五個可存取子畫面實作本機短訊、模擬收件匣、確認電郵、文字 CAPTCHA 及圖片 CAPTCHA。
  - 使用 Task 1 的 `SMS_CHALLENGE`、`EMAIL_MESSAGES`、兩組文字 CAPTCHA、圖片 CAPTCHA 和三個 validator／feedback 函式。
  - 跟着做及自己完成均走過三種驗證方法；只有獨立練習的最後圖片題正確時才會呼叫 `lesson.complete()`。
  - 失敗確認會呼叫 `lesson.recordError()`；重新整理驗證碼、清晰文字模式及「再示範一次」會使用提示計數。
- `src/levels/captcha/CaptchaLesson.css`
  - 新增短訊、收件匣、驗證碼及圖片格的長者友善樣式；手機為兩欄圖片格，較寬版面為四欄。
- `src/levels/captcha/CaptchaLesson.test.tsx`
  - 取代舊有圖像題流程，加入完整三種驗證旅程、未完成短訊、錯誤電郵、重新整理文字 CAPTCHA，以及漏選／多選圖片的測試。
- `src/App.tsx`、`src/data/levels.ts`
  - 更新語音頁面文字及關卡描述，明確列出短訊、電郵及 CAPTCHA 三種方法。

## TDD 證據

### Red

執行：

```sh
npm run test -- src/levels/captcha/CaptchaLesson.test.tsx
```

結果：5 項新增測試全部失敗；舊課堂在「開始跟着做」後直接顯示巴士圖片題，因此無法找到 `六位數短訊驗證碼`。這正確證明測試覆蓋的是尚未存在的新流程。

### Green

實作後再次執行同一聚焦測試，結果為：1 個測試檔、5 項測試全部通過。

## 回歸及建置

```sh
npm run test
```

- 結果：13 個測試檔、42 項測試全部通過。

```sh
npm run build
```

- 結果：TypeScript 編譯及 Vite production build 全部成功。

另已執行 `git diff --check`，沒有空白格式錯誤。

## 自我覆核

- 使用固定本機練習資料，沒有網絡呼叫、第三方驗證服務、儲存鍵或持久化的短訊／電郵／驗證碼輸入。
- 收件匣項目、輸入欄、CAPTCHA 及圖片按鈕均提供可讀名稱；選圖按鈕以 `aria-pressed` 表示狀態，回饋以 `role="alert"` 公布。
- 主要按鈕沿用全域最小 58px 觸控目標；電郵項目和圖片格分別為 84px 和 126px 以上。
- `LessonEngine` 未有修改，獨立練習時計時及原有重看示範語意保持不變。
- 發現並修正了初次 CSS 重寫後遺漏的 `.a11y-note` 樣式，修正後重新執行全套測試、建置及聚焦測試。

## 範圍及注意事項

- 未修改 Task 1 domain 介面；現有介面已足夠供課堂使用。
- 工作樹原有的 `package-lock.json` 改動不屬本任務，未被暫存或提交。
