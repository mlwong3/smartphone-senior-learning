import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 使用相對路徑，方便日後部署到 GitHub Pages 的子路徑
// （例如 https://<user>.github.io/<repo>/）而不需修改設定。
export default defineConfig({
  base: './',
  plugins: [react()],
})
