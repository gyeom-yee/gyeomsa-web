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

프레임워크는 Astro로 확정했다(PRD 6장). 나머지는 코드가 아직 없는 상태의 잠정안이다. 바꾸면 이 파일도 함께 고친다.

- Astro(정적 출력) + TypeScript(strict)
- 콘텐츠: 강의 이력은 Notion API(`@notionhq/client`)로 빌드 시점에만 호출, 제공 교육·프로젝트 사례·고객 후기는 저장소의 마크다운 파일
- 스타일: 순수 CSS(Astro scoped style)
- 패키지 매니저: npm
- 도메인: gyeomsa.com
- 호스팅: 미정

## 폴더 구조

```
/
├─ CLAUDE.md          작업 규칙(이 파일)
├─ docs/              기획·가이드 문서. 규칙 파일 외의 문서는 전부 여기
│  ├─ PRD.md
│  └─ SEO-GUIDE.md
├─ naming/            작명 메모(NAMING.md, 후보 CSV). 기획과 무관, 깃 제외
├─ references/        참고용으로 저장한 외부 사이트. 기획과 무관, 깃 제외
├─ raw_reviews/       후기 원본 설문(엑셀). 깃 제외
├─ src/               (예정)
│  ├─ pages/          라우트. URL 규칙은 SEO-GUIDE 2장
│  ├─ layouts/        공통 레이아웃, <head> 조립
│  ├─ components/
│  ├─ content/services/   제공 교육. 홈 카드마다 {slug}.md 하나(별도 페이지 없음)
│  ├─ content/projects/   프로젝트 사례. 프로젝트마다 {slug}.md 하나
│  ├─ content/reviews/    고객 후기. 후기마다 {slug}.md 하나
│  ├─ content/clients.yaml  주요 교육 기업 목록(실명)
│  └─ lib/notion/     Notion 호출·변환 코드는 여기에만 둔다
├─ public/            robots.txt 등 정적 파일
├─ .env               비밀값. 커밋 금지
└─ .env.example       변수 이름만 적은 견본
```

## 명령어

```
npm install        의존성 설치
npm run dev        개발 서버
npm run build      Notion에서 내용을 가져와 dist/ 생성
npm run preview    빌드 결과 확인
```

배포 명령은 아직 없다. GitHub와 호스팅은 나중에 연결한다.

## 코딩 규칙

- 본문은 반드시 빌드 결과 HTML에 들어 있어야 한다. 브라우저 JS로 본문을 그리지 않는다.
- 페이지·컴포넌트에서 Notion API를 직접 부르지 않는다. `src/lib/notion/`의 함수만 쓴다.
- Notion에서 읽는 대상은 강의 이력 DB 하나뿐이다. 제공 교육은 `src/content/services/`의 파일에서 읽는다.
- 교육 목록을 코드나 다른 파일에 따로 적지 않는다. 홈의 교육 카드와 llms.txt 모두 `src/content/services/`에서 만든다. 제공 교육은 별도 페이지를 만들지 않는다.
- 제공 교육 파일의 본문 문구는 사용자가 쓴다. 요청 없이 내용을 지어내 채우지 않는다.
- 프로젝트 사례와 고객 후기도 `src/content/projects/`, `src/content/reviews/`의 파일에서 읽고, 문구는 사용자가 쓴다. 후기를 지어내거나 고쳐 쓰지 않는다.
- 주요 교육 기업 목록은 `src/content/clients.yaml`에서만 읽고, 사용자가 적는다. Notion의 `기업명`으로 채우지 않는다.
- 홈의 수치 요약은 `src/lib/notion/`이 가져온 공개 강의 이력에서 계산한다. 숫자를 코드에 직접 적지 않고, HTML의 초기값을 0으로 두지 않는다.
- 강의 이력 DB는 `공개과정명`과 `공개기업명`이 모두 채워지고 `참여상태`가 `완료`인 항목만 가져온다. 이 필터는 `src/lib/notion/` 안에서 건다.
- 강의 이력에서 사이트로 내보내는 이름은 `공개과정명`과 `공개기업명`뿐이다. `강의명`, `기업명`, `교육기관` 값은 `src/lib/notion/` 밖으로 넘기지 않는다.
- JS가 꺼져 있어도 모든 본문이 보여야 한다. 요소를 기본값으로 숨기지 않는다.
- Notion 이미지 주소는 만료되므로 빌드 때 내려받아 사이트에 포함한다.
- 모든 페이지는 공통 레이아웃을 거쳐 title·description·canonical·OG 태그를 받는다.
- 화면 문구는 한국어, 코드 식별자와 URL 경로는 영어로 쓴다.
- 새 문서는 `docs/`에 만든다. 루트에는 CLAUDE.md 말고 다른 문서를 두지 않는다. 작명 관련 파일만 `naming/`에 둔다.

## 공개 저장소 규칙

이 저장소는 GitHub에 공개된다. 사이트에 나가지 않는 정보는 저장소에도 두지 않는다는 기준으로 판단한다. 커밋 기록은 지워지지 않으므로 커밋 전에 지킨다.

- 저장소에 적지 않는 것: 익명 표기 기업의 실명, 실명과 익명 표기의 대응, 기업별 수강인원·강의시간·횟수, Notion의 `강의명`·`기업명`·`교육기관` 값. 파일 내용뿐 아니라 파일 이름, 주석, 문서, 커밋 메시지에도 적용한다.
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
- `공개과정명`이나 `공개기업명`이 빈 Notion 항목, 그리고 Notion의 `강의명`·`기업명`·`교육기관` 값을 저장소나 빌드 결과에 남기는 것.
