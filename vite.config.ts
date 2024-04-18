import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dts from "vite-plugin-dts"; // For generating TypeScript definitions

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Add types entry point to package.json
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "CommonRESTful", // Name for UMD build if needed
      fileName: (format) => `index.${format}.js`, // 'index.es.js', 'index.cjs.js'
    },
    rollupOptions: {
      external: ["react", "react-dom"], // Mark as external
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
