# 長者帳號註冊練習網站

一個手機版互動教學網站，以 iPhone 介面呈現，教導香港長者練習：註冊帳號、安全驗證、手機外賣點餐。
畫面採用繁體中文、長者友善大字級、高對比與足夠的觸控面積。

## 技術

- React 18 + Vite + TypeScript
- 畫面切換用 React state（無 React Router）
- 純前端，無後端、無真實帳號系統

## 開發

```bash
npm install
npm run dev      # 本機開發伺服器
npm run build    # 型別檢查 + 打包到 dist/
npm run preview  # 預覽打包結果
```

桌面瀏覽會在畫面中央顯示 iPhone 外框；視窗縮到手機尺寸（≤480px）時外框消失、內容滿版。

## 目前進度（階段一：骨架 + iPhone 外框）

- ✅ React + Vite + TypeScript 專案骨架
- ✅ 長者友善設計規範（`src/styles/tokens.css`）
- ✅ iPhone 外框與裝飾狀態列（`src/components/PhoneFrame.tsx`）
- ✅ 首頁主畫面與三個 App 圖示（`src/components/HomeScreen.tsx`）
- ⬜ 三個關卡的教學流程（階段二）
- ⬜ 表單驗證、captcha 模擬、點餐流程（階段三）
- ⬜ 進度持久化（localStorage，階段三）— 目前進度只存在記憶體，重新整理會重置
- ⬜ 部署到 GitHub Pages（階段四）— 屆時於 `vite.config.ts` 設定正確的 `base`

## 檔案結構

```
src/
  main.tsx              入口
  App.tsx               畫面切換與關卡進度
  styles/               設計規範與全域樣式
  types/                TypeScript 型別
  data/levels.ts        三個關卡定義與初始進度
  components/           PhoneFrame / StatusBar / HomeScreen / AppIcon / LevelPlaceholder
```
