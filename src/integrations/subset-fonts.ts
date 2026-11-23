// 빌드가 끝난 뒤 dist/의 Pretendard woff2에서 사이트에 실제로 쓰인 글자만 남긴다(2026-11-23 결정).
// 글꼴 5개(약 1.3MB)가 홈 첫 화면 사진과 함께 내려받아져 모바일 성능이 기준(PRD 5장)에 못 미쳤다.
// 원본(src/assets/fonts/pretendard/)은 그대로 두고 dist/의 사본만 줄인다. 개발 서버는 원본을 쓴다.
// 공개 저장소라 빌드 로그가 공개된다. 글자 목록은 찍지 않고 개수와 용량만 찍는다.
import type { AstroIntegration } from 'astro';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

/** 글자를 모을 파일. 화면 글자는 HTML에, CSS content 값은 CSS에 있다 */
const TEXT_EXT = /\.(html|css|js|svg)$/;
const FONT = /^Pretendard-.+\.woff2$/;
/** 지금 페이지에 없어도 남겨 둘 기본 글자: 영문·숫자·기본 문장부호(U+0020~U+007E)와 자주 쓰는 기호 */
const BASE =
  Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join('') + '·…–—‘’“”→←↑↓©';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const kb = (n: number) => `${Math.round(n / 1024)}KB`;

export default function subsetFonts(): AstroIntegration {
  return {
    name: 'subset-fonts',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const files = walk(fileURLToPath(dir));
        const texts = files.filter((f) => TEXT_EXT.test(f));
        const fonts = files.filter((f) => FONT.test(basename(f)));
        if (fonts.length === 0) {
          logger.warn('dist/에서 Pretendard woff2를 찾지 못해 글꼴 줄이기를 건너뜁니다.');
          return;
        }

        const chars = new Set<string>(BASE);
        for (const f of texts) for (const ch of readFileSync(f, 'utf8')) chars.add(ch);
        const text = [...chars].join('');

        // 내용이 바뀌면 파일 이름의 해시도 바꾼다. 브라우저가 이전 빌드의 서브셋을 캐시에서 꺼내 쓰지 않게 한다.
        const renames: [string, string][] = [];
        let before = 0;
        let after = 0;
        for (const f of fonts) {
          const src = readFileSync(f);
          const out = await subsetFont(src, text, { targetFormat: 'woff2' });
          const hash = createHash('sha256').update(out).digest('base64url').slice(0, 8);
          const oldName = basename(f);
          const newName = oldName.replace(/\.[A-Za-z0-9_-]+\.woff2$/, `.${hash}.woff2`);
          writeFileSync(f, out);
          if (newName !== oldName) {
            renameSync(f, join(dirname(f), newName));
            renames.push([oldName, newName]);
          }
          before += src.length;
          after += out.length;
        }

        for (const f of texts) {
          const s = readFileSync(f, 'utf8');
          let next = s;
          for (const [o, n] of renames) next = next.split(o).join(n);
          if (next !== s) writeFileSync(f, next);
        }

        logger.info(`글자 ${chars.size}개만 남겼습니다. 글꼴 ${fonts.length}개 ${kb(before)} → ${kb(after)}`);
      },
    },
  };
}
