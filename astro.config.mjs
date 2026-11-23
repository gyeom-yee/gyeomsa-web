// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import subsetFonts from './src/integrations/subset-fonts.ts';

// 주소 기준은 https://gyeomsa.com/ 하나다. 모든 경로는 /로 끝난다(SEO-GUIDE 2장).
export default defineConfig({
  site: 'https://gyeomsa.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // 404는 색인하지 않는다(SEO-GUIDE 5.2).
      filter: (page) => !page.includes('/404'),
    }),
    // 빌드 끝에 글꼴에서 사이트에 쓰인 글자만 남긴다(PRD 5장 성능 기준).
    subsetFonts(),
  ],
});
