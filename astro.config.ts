import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import netlify from "@astrojs/netlify";
// import sitemap from "@astrojs/sitemap";
// import netlify from "@astrojs/netlify";
import robotsTxt from "astro-robots-txt";
import UnoCSS from "@unocss/astro";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";
import { remarkReadingTime } from "./src/lib/ remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://www.tianchiyu.me",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    // robotsTxt({
    //   sitemap: [
    //     "https://lialittis.github.io/sitemap-index.xml",
    //     "https://lialittis.github.io/sitemap-0.xml",
    //   ],
    // }),
    solidJs(),
    UnoCSS({ injectReset: true }),
    icon()
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  output: "server",
  adapter: netlify(),
})