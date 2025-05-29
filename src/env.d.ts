/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
  }
}

declare module '*.yml' {
  const data: any;
  export default data;
}

interface Window {
  __CONF_DATA__?: any;
}