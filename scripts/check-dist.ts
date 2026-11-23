// dist/ 공개 검사. npm run check:dist (빌드 뒤에 실행)
// PRD 5장 완료 기준 중 "Notion의 강의명·기업명·교육기관 값이 dist에 없다", "Notion 임시 이미지 주소·토큰이 없다"를 확인한다.
// 걸린 값은 화면에 가려서 보여 준다. 결과를 파일로 저장하지 않는다.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { loadAuditValues } from '../src/lib/notion/audit.ts';
import { site } from '../src/site.config.ts';

const DIST = 'dist';
const TEXT_EXT = /\.(html|xml|txt|js|css|json|svg|webmanifest)$/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const mask = (s: string) => (s.length <= 2 ? s[0] + '*' : s[0] + '*'.repeat(s.length - 2) + s.at(-1));

const files = walk(DIST).filter((f) => TEXT_EXT.test(f));
const texts = files.map((f) => [f, readFileSync(f, 'utf8')] as const);

// 예외: 한 줄 소개의 기업명, clients.yaml 실명, 실제 이름을 그대로 쓴 공개기업명.
const clients = (parse(readFileSync('src/content/clients.yaml', 'utf8')) as { name: string }[]).map((c) => c.name);
// 경력에 적은 소속 회사명은 운영사여도 공개한다(2026-11-18 결정). 경력 항목의 org만 예외로 친다.
const profile = parse(readFileSync('src/content/profile.yaml', 'utf8')) as { career?: { org: string }[] } | null;
const careerOrgs = (profile?.career ?? []).map((c) => c.org);
const { internal, publicOrgs } = await loadAuditValues();
// '개인'(직접 수주 표기)처럼 일반 낱말인 운영사 값은 본문에 자연스럽게 나올 수 있어 뺀다.
const generic = new Set(['개인']);
const allowed = (v: string) =>
  generic.has(v) ||
  clients.includes(v) ||
  publicOrgs.has(v) ||
  site.intro.includes(v) ||
  careerOrgs.some((org) => org.includes(v));

let problems = 0;
for (const value of internal) {
  if (allowed(value)) continue;
  for (const [file, text] of texts) {
    if (text.includes(value)) {
      problems++;
      console.log(`내부 값 노출: "${mask(value)}" → ${file}`);
    }
  }
}

const patterns: [string, RegExp][] = [
  ['Notion 임시 이미지 주소', /prod-files-secure\.s3|secure\.notion-static\.com|amazonaws\.com\/[^"']*notion/i],
  ['Notion 토큰 형식', /\b(ntn_|secret_)[A-Za-z0-9]{20,}/],
];
for (const [label, re] of patterns) {
  for (const [file, text] of texts) {
    if (re.test(text)) {
      problems++;
      console.log(`${label}: ${file}`);
    }
  }
}
for (const key of ['NOTION_TOKEN', 'NOTION_LECTURES_DATABASE_ID']) {
  const v = process.env[key]?.replace(/-/g, '');
  if (!v) continue;
  for (const [file, text] of texts) {
    if (text.replace(/-/g, '').includes(v)) {
      problems++;
      console.log(`.env의 ${key} 값: ${file}`);
    }
  }
}

console.log(`검사한 파일 ${texts.length}개, 내부 값 ${internal.size}개 기준. 문제 ${problems}건.`);
process.exit(problems ? 1 : 0);
