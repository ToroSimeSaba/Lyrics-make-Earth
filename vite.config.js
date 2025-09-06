import { defineConfig } from 'vite';

export default defineConfig({
    base: './',  // 明示的な相対パスの設定
    build: {
        outDir: 'docs'  // ← 出力先をdocsに変更
    }
});