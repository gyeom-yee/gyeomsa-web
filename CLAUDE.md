# CLAUDE.md

AI 교육 강사 개인 홈페이지. Notion을 CMS로 두고, 빌드 시점에 Notion API로 내용을 가져와 정적 HTML을 만든다.
목표는 이름 검색 상위 노출과 AI 답변 인용(SEO·AEO·GEO)이다.

## 작업 전에 읽을 문서

| 작업 종류 | 먼저 읽을 문서 |
| --- | --- |
| 페이지 추가·기능 구현·범위 판단 | `docs/PRD.md` |
| `<head>` 태그, JSON-LD, URL, robots.txt, sitemap, llms.txt | `docs/SEO-GUIDE.md` |
| 애니메이션, 배경 영상, 탭·슬라이더 같은 동적 효과 | `docs/SEO-GUIDE.md` 8장 |

`docs/HUMAN-GUIDE.md`는 사람이 읽는 설명서다. 작업 근거로 읽지 않는다.

`naming/`은 사명·도메인 작명 메모다. 기획과 무관하므로 작업 근거로 읽지 않고, 그 안의 후보 이름을 PRD·코드·화면 문구에 옮기지 않는다. 사용자가 작명 작업을 요청할 때만 연다.

`raw_reviews/`는 후기 원본 설문이다. 응답자 정보가 들어 있으므로 사용자가 후기 추가를 요청할 때만 열고, 사이트에 싣는 문장은 사용자가 고른 것만 `src/content/reviews/`로 옮긴다.

`references/`는 사용자가 참고용으로 저장한 외부 사이트다. 기획 근거로 읽지 않고, 그 안의 문구·이미지·코드를 사이트에 가져오지 않는다. 사용자가 특정 파일을 짚어 요청할 때만 연다.

문서에 없는 내용이나 문서끼리 충돌하는 내용은 임의로 정하지 말고 사용자에게 묻는다.
PRD의 "미정 사항"에 걸린 값은 추측해서 채우지 않는다.

## 기술 스택

프레임워크는 Astro로 확정했다(PRD 6장). 아래 구성으로 구현했다. 바꾸면 이 파일과 README.md도 함께 고친다.

- Astro 7(정적 출력, `trailingSlash: 'always'`) + TypeScript(strict), `@astrojs/sitemap`
- 이미지: `astro:assets`로 WebP 변환. `/profile.jpg`(JSON-LD용)와 `/og.png`는 빌드 때 `sharp`로 만든다
- 콘텐츠: 강의 이력은 Notion API(`@notionhq/client`)로 빌드 시점에만 호출, 제공 교육·프로젝트 경험·고객 후기는 저장소의 마크다운 파일
- 스타일: 순수 CSS(Astro scoped style)
- 글꼴: Pretendard 1.3.9 공식 서브셋 woff2(400·500·600·700·800)를 `src/assets/fonts/pretendard/`에 두고 `global.css`의 `@font-face`로 내려준다. 새 굵기를 쓰면 파일과 `@font-face`를 함께 추가한다. 같은 폴더의 `LICENSE.txt`(SIL OFL)를 지우지 않는다
- 패키지 매니저: npm
- 도메인: gyeomsa.com
- 호스팅: GitHub Pages(2026-11-23 결정). `.github/workflows/deploy.yml`이 빌드 → `check:dist` → 배포를 한다. Notion 토큰·DB ID는 저장소 Secrets에만 둔다. 주소 기준은 `https://gyeomsa.com/`, `www`는 GitHub Pages가 리디렉션한다

## 폴더 구조

```
/
├─ CLAUDE.md          작업 규칙(이 파일)
├─ README.md          저장소 소개. GitHub 방문자용
├─ docs/              기획·가이드 문서. 규칙 파일 외의 문서는 전부 여기
│  ├─ PRD.md
│  └─ SEO-GUIDE.md
├─ naming/            작명 메모(NAMING.md, 후보 CSV). 기획과 무관, 깃 제외
├─ references/        참고용으로 저장한 외부 사이트. 기획과 무관, 깃 제외
├─ raw_reviews/       후기 원본 설문(엑셀). 깃 제외
├─ scripts/check-dist.ts  빌드 결과 공개 검사(npm run check:dist)
├─ .github/workflows/deploy.yml  GitHub Pages 배포(main push·매일 04:17 KST·수동 실행)
├─ .githooks/pre-commit  커밋 직전 비공개 정보 검사(denylist.local은 깃 제외)
├─ src/
│  ├─ site.config.ts  이름·한 줄 소개·이메일·외부 링크. 이 값들은 여기서만 적는다
│  ├─ content.config.ts  콘텐츠 파일 형식 검사(필수 값)
│  ├─ pages/          라우트. URL 규칙은 SEO-GUIDE 2장
│  ├─ layouts/        공통 레이아웃, <head> 조립
│  ├─ components/
│  ├─ content/services/   제공 교육. 홈 카드마다 {slug}.md 하나(별도 페이지 없음)
│  ├─ content/projects/   프로젝트 경험(소개 페이지 섹션, 별도 페이지 없음). 프로젝트마다 {slug}.md 하나
│  ├─ content/reviews/    고객 후기. 후기마다 {slug}.md 하나
│  ├─ content/clients.yaml  주요 교육 기업 목록(실명)
│  ├─ content/profile.yaml  소개 페이지의 경력·학력·교육 이수·자격·기술
│  ├─ lib/notion/     Notion 호출·변환 코드는 여기에만 둔다. audit.ts는 검사 스크립트 전용
│  └─ assets/         프로필 사진, 글꼴(fonts/pretendard/)
├─ public/            그대로 내보낼 정적 파일(favicon 등). robots.txt·llms.txt는 src/pages/에서 만든다
├─ .env               비밀값. 커밋 금지
└─ .env.example       변수 이름만 적은 견본
```

## 명령어

```
npm install        의존성 설치
npm run dev        개발 서버
npm run build      Notion에서 내용을 가져와 dist/ 생성
npm run preview    빌드 결과 확인
npm run check      타입 검사(astro check)
npm run check:dist 빌드 뒤 dist/에 Notion 내부 값·토큰이 없는지 검사
```

배포는 GitHub Actions가 한다. `main`에 push하면 배포되고, Notion만 고친 날을 위해 매일 04:17(한국 시간)에 다시 빌드한다. 바로 반영하려면 `gh workflow run deploy.yml`(또는 Actions 탭의 Run workflow)을 쓴다.

- 공개 저장소라 Actions 로그도 공개된다. 빌드 중 `console.log`·`console.warn`·오류 메시지에 Notion의 `강의명`·`기업명`·`교육기관` 값이나 Notion 응답을 찍지 않는다.
- `check:dist`가 실패하면 배포하지 않는다. 이 단계를 워크플로에서 빼지 않는다.

## 코딩 규칙

- 본문은 반드시 빌드 결과 HTML에 들어 있어야 한다. 브라우저 JS로 본문을 그리지 않는다.
- 페이지·컴포넌트에서 Notion API를 직접 부르지 않는다. `src/lib/notion/`의 함수만 쓴다.
- Notion에서 읽는 대상은 강의 이력 DB 하나뿐이다. 제공 교육은 `src/content/services/`의 파일에서 읽는다.
- 교육 목록을 코드나 다른 파일에 따로 적지 않는다. 홈의 교육 카드와 llms.txt 모두 `src/content/services/`에서 만든다. 제공 교육은 별도 페이지를 만들지 않는다.
- 제공 교육 파일의 본문 문구는 사용자가 쓴다. 요청 없이 내용을 지어내 채우지 않는다.
- 프로젝트 경험과 고객 후기도 `src/content/projects/`, `src/content/reviews/`의 파일에서 읽고, 문구는 사용자가 쓴다. 후기를 지어내거나 고쳐 쓰지 않는다. 프로젝트의 `affiliation`에는 고객사가 아니라 일한 곳·참여한 과제를 적는다.
- 주요 교육 기업 목록은 `src/content/clients.yaml`에서만 읽고, 사용자가 적는다. Notion의 `기업명`으로 채우지 않는다.
- 소개 페이지의 경력·학력·교육 이수·자격·기술은 `src/content/profile.yaml`에서만 읽는다. 경력 항목에 기업별 수강인원·시간·횟수나 익명 표기 기업명을 적지 않는다.
- 자격에는 자격번호(식별번호)를 적지 않는다. 확인 링크(`url`)는 발급기관의 배지·인증서 페이지만 넣고, 자격 안내 홈페이지로만 가는 주소는 넣지 않는다.
- 홈의 수치 요약은 `src/lib/notion/`이 가져온 공개 강의 이력에서 계산한다. 숫자를 코드에 직접 적지 않고, HTML의 초기값을 0으로 두지 않는다.
- 강의 이력 DB는 `공개과정명`과 `공개기업명`이 모두 채워지고 `참여상태`가 `완료`인 항목만 가져온다. 이 필터는 `src/lib/notion/` 안에서 건다.
- 강의 이력에서 사이트로 내보내는 이름은 `공개과정명`과 `공개기업명`뿐이다. `강의명`, `기업명`, `교육기관` 값은 `src/lib/notion/` 밖으로 넘기지 않는다.
- JS가 꺼져 있어도 모든 본문이 보여야 한다. 요소를 기본값으로 숨기지 않는다.
- Notion 이미지 주소는 만료되므로 빌드 때 내려받아 사이트에 포함한다.
- 모든 페이지는 공통 레이아웃을 거쳐 title·description·canonical·OG 태그를 받는다.
- 화면 문구는 한국어, 코드 식별자와 URL 경로는 영어로 쓴다.
- 새 문서는 `docs/`에 만든다. 루트에는 CLAUDE.md와 README.md 말고 다른 문서를 두지 않는다. 작명 관련 파일만 `naming/`에 둔다.
- README.md는 GitHub 방문자에게 저장소를 소개하는 문서다. 구조·기술 스택·명령어가 바뀌면 함께 고친다. 공개 저장소 규칙을 똑같이 따른다.

## 커밋 메시지

- Conventional Commits 형식: `type(scope): 설명`. type과 scope는 영어, 설명은 한국어 한 줄.
- type: feat, fix, docs, style, refactor, test, chore, content(사이트 문구·콘텐츠 파일만 바꾼 경우)
- scope(선택): notion, layout, home, about, lectures, projects, contact, seo, services, reviews
- 예: `feat(notion): 공개 강의 이력 필터 추가`, `content(services): 업무 자동화 카드 시간 수정`

## 공개 저장소 규칙

이 저장소는 GitHub에 공개된다. 사이트에 나가지 않는 정보는 저장소에도 두지 않는다는 기준으로 판단한다. 커밋 기록은 지워지지 않으므로 커밋 전에 지킨다.

- 저장소에 적지 않는 것: 익명 표기 기업의 실명, 실명과 익명 표기의 대응, 기업별 수강인원·강의시간·횟수, Notion의 `강의명`·`기업명`·`교육기관` 값. 파일 내용뿐 아니라 파일 이름, 주석, 문서, 커밋 메시지에도 적용한다.
- 예외: `profile.yaml` 경력 항목의 소속 회사명(`career.org`)은 `교육기관` 값과 같아도 실명으로 적는다(2026-11-18 결정). 강의 이력 표와 그 밖의 곳에는 여전히 운영사를 싣지 않는다.
- Notion 응답을 파일로 저장하지 않는다. 캐시가 꼭 필요하면 `.notion-cache/`에만 두고, 이 폴더는 `.gitignore`에 있어야 한다.
- 빌드에 필요한 파일(`src/content/` 등)은 `.gitignore`로 숨기지 않는다. 호스팅이 저장소에서 빌드하므로 빌드가 깨진다. 숨겨야 하는 내용은 처음부터 저장소에 두지 않는다.
- 커밋 전에 `git status`로 `.env`, `naming/`, `references/`, `raw_reviews/`, `.notion-cache/`가 빠졌는지 확인한다.
- `.githooks/pre-commit`이 커밋 직전에 제외 폴더, Notion 토큰 형식, `.env`의 실제 값, `.githooks/denylist.local`(비공개 단어 목록, 깃 제외)을 검사한다. `git init` 직후 `git config core.hooksPath .githooks`로 연결한다. 검사를 건너뛰는 `--no-verify`를 쓰지 않는다.
- 저장소 이름은 `gyeomsa-web`(GitHub `gyeom-yee` 계정, 공개).
- 이메일 주소, 실명 기업 목록, 프로필 사진처럼 사이트에 이미 공개하는 정보는 저장소에 있어도 된다.

## 금지사항

- Notion 토큰·DB ID를 코드, 문서, 커밋에 적는 것. `.env`와 호스팅 환경변수에만 둔다.
- "공개 저장소 규칙"에서 저장소에 적지 않기로 한 정보를 커밋하는 것.
- 사용자가 요청하기 전에 `git init`, 원격 저장소 생성, push, 배포 설정을 하는 것.
- 외부 CSS 프레임워크, UI 라이브러리, 분석·추적 스크립트를 묻지 않고 추가하는 것.
- 크롤러에게만 사람과 다른 내용을 보여주는 것.
- `공개과정명`이나 `공개기업명`이 빈 Notion 항목, 그리고 Notion의 `강의명`·`기업명`·`교육기관` 값을 저장소나 빌드 결과에 남기는 것(경력 소속 회사명 예외는 "공개 저장소 규칙" 참고).
