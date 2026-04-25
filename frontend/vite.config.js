import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },

    // helps avoid duplicate React instances
    dedupe: ["react", "react-dom", "firebase"],
  },

  // 🔥 IMPORTANT: fixes firebase/auth resolution on Vercel (Rolldown/Vite 8 issue)
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"],
  },
});