import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
// import netlify from "@astrojs/netlify";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";
import sitemap from '@astrojs/sitemap';
// import solidJs from "@astrojs/solid-js";
import { remarkReadingTime } from "./src/lib/ remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://tianchiyu.me",
  integrations: [
    react(
      // {include: ['**/*.tsx', '**/*.jsx'],}
    ),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    // robotsTxt({
    //   sitemap: [
    //     "https://lialittis.github.io/sitemap-index.xml",
    //     "https://lialittis.github.io/sitemap-0.xml",
    //   ],
    // }),
    // solidJs(),
    UnoCSS({ injectReset: true }),
    icon()
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  // output: "static",  // "static" or "server"
  // adapter: netlify(),
  // vite: {
  //   plugins: [],
  //   optimizeDeps: {
  //     include: ["react", "react-dom"], // 确保 react 依赖被优化
  //   },
  //   esbuild: {
  //     jsxInject: `import React from 'react'`, // 确保 React 正确注入
  //   },
  //   define: {
  //     "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  //   },
  //   server: {
  //     hmr: {
  //       overlay: false, // 关闭 HMR 报错弹窗
  //     },
  //   },
  // },
})