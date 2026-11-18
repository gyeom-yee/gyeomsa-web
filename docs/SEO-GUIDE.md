# SEO 가이드

검색엔진(SEO), 답변 영역(AEO), 생성형 AI(GEO)에 공통으로 적용하는 구현 규칙이다.
`<head>` 태그, 구조화 데이터, URL, 크롤러용 파일을 만들거나 고칠 때 이 문서를 따른다.

`{이름}`, `{도메인}`, `{한 줄 소개}`는 PRD 6장의 미정 사항이 정해지면 한 곳(사이트 설정 파일)에서 관리한다. 값이 없을 때 임의로 채우지 않는다.

## 1. 원칙

1. **본문은 HTML에 있다.** AI 크롤러 다수는 JS를 실행하지 않는다. 빌드 결과 HTML을 텍스트로 열어 본문이 보이지 않으면 실패다.
2. **이름과 소개는 어디서나 같다.** title, h1, 구조화 데이터, 외부 프로필에 같은 이름과 같은 한 줄 소개를 쓴다. 표기가 흔들리면 검색엔진이 한 사람으로 묶지 못한다.
3. **사람과 크롤러가 같은 내용을 본다.** 크롤러에게만 다른 내용을 주는 방식은 쓰지 않는다.

## 2. URL 규칙

- 영문 소문자와 하이픈만 쓴다. 예: `/lectures/`
- 한글 URL은 쓰지 않는다. 공유할 때 퍼센트 인코딩으로 깨져 보인다.
- 모든 경로는 `/`로 끝난다. 끝 슬래시가 없는 주소와 섞이지 않게 프레임워크 설정에서 고정한다.
- 경로는 PRD 3장의 사이트맵에 적힌 것만 쓴다.
- 깊이는 두 단계까지만 쓴다.
- 한번 공개한 URL은 바꾸지 않는다. 바꿔야 하면 옛 주소에서 새 주소로 301 리디렉션을 건다.
- 주소 기준은 `https://{도메인}/` 하나다. `www` 유무도 하나로 정하고 나머지는 리디렉션한다.

## 3. 메타 태그

### 3.1 모든 페이지 공통

```html
<html lang="ko">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>페이지 제목 | {이름}</title>
<meta name="description" content="페이지 요약">
<meta name="author" content="{이름}">
<link rel="canonical" href="https://{도메인}/현재-경로/">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{이름}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="페이지 제목 | {이름}">
<meta property="og:description" content="페이지 요약">
<meta property="og:url" content="https://{도메인}/현재-경로/">
<meta property="og:image" content="https://{도메인}/og.png">
<meta name="twitter:card" content="summary_large_image">
```

- canonical, og:url, og:image는 절대 주소로 쓴다.
- 소개 페이지만 `og:type`을 `profile`로 바꾼다.
- `robots` 메타는 기본적으로 넣지 않는다. 404 페이지에만 `noindex`를 넣는다.
- `keywords` 메타는 넣지 않는다. 구글이 쓰지 않는다.
- 검색엔진 소유 확인 태그(`google-site-verification`, `naver-site-verification`, `msvalidate.01`)는 값이 생기면 공통 레이아웃에 넣는다.

### 3.2 길이와 작성법

| 항목 | 기준 |
| --- | --- |
| title | 한글 30자 안팎. 페이지마다 달라야 한다 |
| description | 한글 70~90자. 그 페이지에서 얻을 수 있는 것을 한두 문장으로 |
| og:image | 1200×630px. 페이지별 이미지가 없으면 공통 이미지 |

### 3.3 페이지별 title과 description

| 페이지 | title | description 방향 |
| --- | --- | --- |
| 홈 | `{이름} \| 기업 AI 교육 강사` | 누구이고 무엇을 가르치는지 |
| 소개 | `{이름} 소개 \| 기업 AI 교육 강사` | 경력과 전문 분야 요약 |
| 강의 이력 | `강의 이력 \| {이름}` | 어떤 기관에서 어떤 주제로 강의했는지 |
| 문의 | `강의 문의 \| {이름}` | 문의 방법 |

이름이 들어가는 위치: 홈과 소개 페이지는 title 맨 앞, 나머지는 맨 뒤.

홈과 소개 페이지는 h1에도 이름이 들어간다. 구호만으로 h1을 쓰지 않는다.

제공 교육은 별도 페이지 없이 홈의 카드로만 나온다. 카드 제목은 h3로, 사람들이 검색할 말을 그대로 쓴다("Claude 업무 자동화 교육"). 카드 제목끼리 겹치지 않게 한다.

## 4. 구조화 데이터(JSON-LD)

`<script type="application/ld+json">`으로 `<head>`에 넣는다. 화면에 없는 내용을 구조화 데이터에만 적지 않는다.

### 4.1 페이지별 타입

| 페이지 | 타입 |
| --- | --- |
| 홈 | `WebSite`, `Person` |
| 소개 | `ProfilePage`(mainEntity가 `Person`) |
| 그 외 하위 페이지 | `BreadcrumbList` |

- Person은 `@id`를 `https://{도메인}/#person`으로 고정하고 다른 페이지에서는 이 `@id`로 참조한다. 사람 정보를 페이지마다 다르게 적지 않는다.
- FAQ는 본문 HTML로 쓰는 것이 먼저다. `FAQPage` 마크업은 선택이다.

### 4.2 Person(소개 페이지 예시)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "dateModified": "2026-11-10",
  "mainEntity": {
    "@type": "Person",
    "@id": "https://{도메인}/#person",
    "name": "{이름}",
    "jobTitle": "기업 AX 교육 강사",
    "description": "{한 줄 소개}",
    "url": "https://{도메인}/",
    "image": "https://{도메인}/profile.jpg",
    "knowsAbout": ["Claude", "생성형 AI 업무 활용", "업무 자동화", "AI 리터러시"],
    "sameAs": [
      "https://www.linkedin.com/in/gyeomsa/",
      "https://github.com/gyeom-yee"
    ]
  }
}
```

- `sameAs`에는 본인이 운영하고 사이트와 같은 이름·소개를 쓰는 프로필만 넣는다. LinkedIn과 GitHub 계정을 넣기로 정했다(PRD 6장).
- `dateModified`는 빌드 날짜가 아니라 내용이 실제로 바뀐 날짜를 쓴다.
- `knowsAbout`은 예시다. 홈의 교육 프로그램 카드 주제와 맞춘다.

### 4.3 WebSite(홈)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://{도메인}/#website",
  "url": "https://{도메인}/",
  "name": "{이름}",
  "inLanguage": "ko-KR",
  "publisher": { "@id": "https://{도메인}/#person" }
}
```

### 4.4 BreadcrumbList(하위 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://{도메인}/" },
    { "@type": "ListItem", "position": 2, "name": "강의 이력" }
  ]
}
```

## 5. 크롤러용 파일

### 5.1 robots.txt

```
User-agent: *
Allow: /

Sitemap: https://{도메인}/sitemap-index.xml
```

- 전체 허용이 기본이다. 특정 AI 크롤러를 막는 줄을 넣지 않는다.
- 호스팅이나 CDN에 AI 봇 차단 옵션이 있으면 꺼져 있는지 확인한다. robots.txt가 열려 있어도 그쪽에서 막히면 소용없다.
- 접근을 확인할 주요 봇: Googlebot, Bingbot, Yeti(네이버), GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot.

### 5.2 sitemap

- 프레임워크의 sitemap 기능으로 빌드 때 만든다.
- 색인할 페이지만 넣는다. 404 페이지는 뺀다.

### 5.3 llms.txt

AI가 사이트를 요약해 읽도록 루트에 두는 마크다운 파일이다. 만드는 비용이 낮아서 넣지만, 주요 AI 검색이 이 파일을 쓴다고 공식적으로 밝힌 것은 아니다. 이 파일에 기대지 말고 1~4장을 먼저 지킨다.

```markdown
# {이름}

> {한 줄 소개}

## 소개
- [소개](https://{도메인}/about/): 경력과 전문 분야
- [강의 이력](https://{도메인}/lectures/): 기관·주제·시기별 강의 기록
- [프로젝트 사례](https://{도메인}/projects/): 강의 외에 수행한 컨설팅·개발 프로젝트

## 제공 교육
- {교육명}({시간}): {한 줄 설명}. 대상: {대상}

제공 교육은 홈(https://{도메인}/)의 "주요 교육 프로그램" 섹션에 있다. 페이지가 따로 없으므로 링크 대신 글로 적는다.

## 문의
- [강의 문의](https://{도메인}/contact/): 문의 방법
```

- 제공 교육 목록은 마크다운 파일들에서 빌드 때 만든다. 손으로 고치지 않는다.
- 링크는 전부 실제로 열리는 주소여야 한다.

## 6. 본문 작성 규칙

AI가 답변에 가져다 쓰기 쉬운 형태로 쓴다.

- **첫 문단에서 답한다.** 각 페이지의 첫 두세 문장만 떼어 읽어도 뜻이 통해야 한다. 소개 페이지라면 "{이름}은 ~을 가르치는 ~다" 형태의 문장으로 시작한다.
- **한 페이지에 주제 하나.** h1은 페이지당 하나, 그 아래는 h2, h3 순서를 건너뛰지 않는다.
- **수치와 고유명사를 쓴다.** "다수 기업"보다 "기업 12곳", "오랜 경험"보다 "2024년부터". 검증할 수 있는 사실이 인용된다.
- **날짜는 `YYYY.MM` 형식으로 통일한다.**
- **목록과 표를 쓴다.** 이력처럼 항목이 반복되는 내용은 문단으로 풀지 않는다.
- **내부 링크를 건다.** 홈의 교육 프로그램 섹션은 강의 이력과 문의로 연결한다.
- **같은 수치는 어디서나 같다.** 누적 수강 인원이나 출강 횟수 같은 숫자는 한 곳에서 관리하고 페이지마다 따로 적지 않는다. 페이지끼리 숫자가 다르면 AI가 어느 쪽도 믿지 않는다.
- **예시와 실적을 구분한다.** 설계용 예시를 고객 사례처럼 쓰지 않는다.
- **교육 카드는 서로 달라야 한다.** 문구를 복사해 검색어만 바꾼 카드를 여러 개 만들지 않는다.
- **링크 문구는 내용을 말한다.** "여기"나 "자세히 보기"만 쓰지 않는다.

## 7. 이미지

- 모든 `<img>`에 `alt`를 넣는다. 장식용이면 `alt=""`.
- `width`와 `height`를 지정해 화면이 밀리지 않게 한다.
- WebP나 AVIF로 내보내고, 화면 아래쪽 이미지는 `loading="lazy"`를 준다.
- 글자가 들어간 이미지로 본문을 대신하지 않는다. 크롤러가 읽지 못한다.

## 8. 동적 효과

움직임은 써도 된다. 조건은 하나다. **JS와 CSS 애니메이션이 전혀 동작하지 않아도 모든 본문이 보여야 한다.**

### 8.1 스크롤 등장 효과
- 요소의 기본 상태는 "보임"이다. JS가 실행된 것이 확인됐을 때만 숨겼다가 등장시킨다.
- 숨김 스타일을 조건 없이 CSS에 적지 않는다. JS가 실패하면 본문이 빈 화면으로 남는다.

```css
.reveal { transition: opacity .6s ease, transform .6s ease; }
.js .reveal:not(.in) { opacity: 0; transform: translateY(14px); }
@media (prefers-reduced-motion: reduce) {
  .js .reveal:not(.in) { opacity: 1; transform: none; }
}
```

- `<html>`에 `js` 클래스를 붙이는 일과 화면에 들어온 요소에 `in`을 붙이는 일은 같은 스크립트가 한다. 관찰 스크립트가 로드되지 않았는데 `js`만 붙는 상황을 만들지 않는다.
- `IntersectionObserver`가 없는 환경에서는 `js` 클래스를 붙이지 않는다.

### 8.2 숫자와 가려진 내용
- 실적 숫자는 HTML에 최종값을 적는다. 0부터 세는 연출을 하려면 JS가 최종값을 읽어 0에서 다시 세게 한다.
- 탭, 아코디언, 슬라이더로 가려진 내용도 HTML에 전부 들어 있어야 한다. 누를 때 불러오지 않는다.
- JS가 만들어 넣는 내용(채팅 창, 폼 완료 안내 등)은 본문으로 치지 않는다. 검색에 잡혀야 할 정보를 거기에만 두지 않는다.

### 8.3 배경 영상
- 장식으로만 쓴다. 제목과 문장은 영상 위에 실제 글자로 얹고, 영상 안에 글자를 넣지 않는다.
- `muted`, `playsinline`, `poster`를 지정하고 `aria-hidden="true"`를 준다. 소리 트랙은 뺀다.
- 화면 밖으로 나가면 일시정지하고, `prefers-reduced-motion`이면 재생하지 않고 poster만 보여 준다.
- 파일은 3MB 이하를 목표로 압축한다. 첫 화면에서 가장 큰 요소이므로 poster 이미지가 빨리 뜨는 것이 로딩 점수를 정한다.

### 8.4 스타일과 스크립트
- CSS는 빌드 때 만들어 파일로 내보낸다. 브라우저에서 CSS를 생성하는 스크립트(CDN 방식의 스타일 도구)를 쓰지 않는다.
- 호버 효과는 CSS만으로 만든다.
- 애니메이션 라이브러리를 넣기 전에 CSS 전환과 `IntersectionObserver`로 되는지 먼저 본다.

## 9. 사이트 밖에서 맞출 것

코드로 해결되지 않지만 이름 검색 순위에 영향이 크다.

- LinkedIn 등 외부 프로필의 이름, 직함, 한 줄 소개를 사이트와 같게 쓴다.
- 외부 프로필의 웹사이트 칸에 `https://{도메인}/`을 넣는다.
- 강의 플랫폼이나 행사 페이지에 강사 소개가 실릴 때 사이트 주소를 함께 넣는다.

## 10. 점검

### 빌드할 때마다
- [ ] `dist/`의 HTML을 텍스트로 열어 본문이 보이는지
- [ ] 브라우저에서 JS를 끄고 열어도 본문이 전부 보이는지
- [ ] title과 description이 페이지끼리 겹치지 않는지
- [ ] canonical이 실제 주소와 같은지(끝 슬래시 포함)
- [ ] JSON-LD가 [Schema Markup Validator](https://validator.schema.org/)에서 오류가 없는지

### 배포한 뒤
- [ ] Google Search Console에 등록하고 sitemap 제출
- [ ] Bing Webmaster Tools에 등록하고 sitemap 제출
- [ ] 네이버 서치어드바이저에 등록하고 sitemap 제출
- [ ] [Rich Results Test](https://search.google.com/test/rich-results)로 실제 주소 확인
- [ ] 5.1의 봇 이름을 User-Agent로 넣어 실제 주소를 요청했을 때 정상 응답(200)이 오는지. 호스팅이 봇을 막고 있으면 여기서 드러난다
- [ ] 이름으로 구글·네이버를 검색하고, AI 서비스 두세 곳에 이름을 물어 결과를 기록
