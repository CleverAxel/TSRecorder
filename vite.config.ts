import { defineConfig } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl()
  ],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  // server: {
  //   headers: {
  //     "Cross-Origin-Opener-Policy": "same-origin",
  //     "Cross-Origin-Embedder-Policy": "require-corp",
  //   },
  // },
});
