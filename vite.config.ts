import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [
  //   basicSsl()
  // ],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  // // base: "/test_vite/"
  // server: {
  //   headers: {
  //     "Cross-Origin-Opener-Policy": "same-origin",
  //     "Cross-Origin-Embedder-Policy": "require-corp",
  //   },
  // },
});
